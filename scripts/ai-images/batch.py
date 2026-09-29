"""Пакетна генерація (Gemini Batch API — удвічі дешевше, результат за кілька годин).

  python scripts/ai-images/batch.py reuse     # обкладинки імен з уже намальованим сюжетом — безкоштовно
  python scripts/ai-images/batch.py submit    # відправити решту одним пакетом (batch-state.json)
  python scripts/ai-images/batch.py status    # стан пакета
  python scripts/ai-images/batch.py collect   # забрати результати, обробити, перевірити (qa.json)

Обкладинки імен з однаковим сюжетом (тема + стать) малюються один раз: ілюстрація спільна,
а назву з ім'ям накладаємо шрифтом (див. generate.book_cover).
"""
import base64, io, json, os, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.argv = sys.argv[:2]
import generate as g  # noqa: E402
from PIL import Image  # noqa: E402

STATE = os.path.join(g.HERE, "batch-state.json")
BASE = "https://generativelanguage.googleapis.com"


def slots():
    return json.load(open(os.path.join(g.HERE, "prompts.json"), encoding="utf8"))


def done_files():
    return set(json.load(open(g.DONE, encoding="utf8"))) if os.path.exists(g.DONE) else set()


def combo(slot):
    n = g.NAMES.get(slot["id"].split("/")[-1])
    return (n["topic"], n["g"]) if n else None


def raw_path(slot_id):
    return os.path.join(g.RAW, slot_id.replace("/", "_") + ".png")


def save(slot, raw: bytes):
    """Обробка й запис готової картинки (як у generate.generate, але без повторного малювання)."""
    _, mode = g.build(slot)
    os.makedirs(g.RAW, exist_ok=True)
    open(raw_path(slot["id"]), "wb").write(raw)
    img = Image.open(io.BytesIO(raw))
    w, h = slot["width"], slot["height"]
    if mode == "cutout":
        out = g.fit_contain(g.cut_white(img), w, h)
    elif mode == "cover":
        out = g.book_cover(img, slot["id"], w, h)
    else:
        out = g.fit_cover(img.convert("RGB"), w, h)
    out.save(os.path.join(g.ROOT, "public", slot["file"].lstrip("/")), "WEBP", quality=86, method=6)
    g.update_json(g.DONE, lambda d: sorted(set((d or []) + [slot["file"]])))


def reuse():
    """Імена, для яких сюжет (тема + стать) уже намальовано для іншого імені."""
    done = done_files()
    art = {}
    for s in slots():
        if s["group"] == "imya" and s["file"] in done and combo(s) and os.path.exists(raw_path(s["id"])):
            art.setdefault(combo(s), raw_path(s["id"]))
    n = 0
    for s in slots():
        if s["group"] == "imya" and s["file"] not in done and combo(s) in art:
            save(s, open(art[combo(s)], "rb").read())
            n += 1
    print(f"Зібрано без генерації: {n}")


def todo():
    done = done_files()
    out, seen = [], set()
    for s in slots():
        if s["file"] in done:
            continue
        if s["group"] == "imya":
            if combo(s) in seen:
                continue
            seen.add(combo(s))
        out.append(s)
    return out


def api(method, url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, method=method, headers={"x-goog-api-key": g.KEY, **(headers or {})})
    return urllib.request.urlopen(req, timeout=600)


def submit():
    items = todo()
    lines = []
    for s in items:
        prompt, mode = g.build(s)
        ar = "1:1" if mode == "cover" else g.aspect(s["width"], s["height"])
        lines.append(json.dumps({"key": s["id"], "request": {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ar}}}}, ensure_ascii=False))
    body = ("\n".join(lines) + "\n").encode("utf8")
    # завантаження файлу запитів (resumable upload)
    r = api("POST", f"{BASE}/upload/v1beta/files", json.dumps({"file": {"display_name": "kazkarnia-batch"}}).encode(), {
        "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": str(len(body)), "X-Goog-Upload-Header-Content-Type": "application/jsonl",
        "Content-Type": "application/json"})
    upload_url = r.headers["X-Goog-Upload-URL"]
    f = json.load(api("POST", upload_url, body, {"X-Goog-Upload-Command": "upload, finalize", "X-Goog-Upload-Offset": "0"}))
    file_name = f["file"]["name"]
    b = json.load(api("POST", f"{BASE}/v1beta/models/{g.MODEL}:batchGenerateContent", json.dumps({
        "batch": {"display_name": "kazkarnia-images", "input_config": {"file_name": file_name}}}).encode(),
        {"Content-Type": "application/json"}))
    json.dump({"batch": b["name"], "file": file_name, "count": len(items)}, open(STATE, "w"), indent=1)
    print(f"Відправлено {len(items)} картинок у пакет {b['name']}")


def status():
    st = json.load(open(STATE))
    b = json.load(api("GET", f"{BASE}/v1beta/{st['batch']}"))
    meta = b.get("metadata", b)
    print(meta.get("state"), json.dumps(meta.get("batchStats", {})))
    return b


def collect():
    b = status()
    meta = b.get("metadata", b)
    if meta.get("state") not in ("JOB_STATE_SUCCEEDED", "BATCH_STATE_SUCCEEDED"):
        print("Пакет ще не готовий.")
        return
    out = (b.get("response") or meta.get("output") or {}).get("responsesFile")
    raw = api("GET", f"{BASE}/download/v1beta/{out}:download?alt=media").read().decode("utf8")
    by_id = {s["id"]: s for s in slots()}
    results, failed = [], []
    for line in raw.splitlines():
        if not line.strip():
            continue
        r = json.loads(line)
        parts = (r.get("response", {}).get("candidates") or [{}])[0].get("content", {}).get("parts", [])
        img = next((p for p in parts if "inlineData" in p), None)
        if img:
            results.append((by_id[r["key"]], base64.b64decode(img["inlineData"]["data"])))
        else:
            failed.append(r["key"])

    def handle(item):
        s, data = item
        save(s, data)
        rep = g.qa(data, "")
        g.update_json(g.QA_LOG, lambda d: {**(d or {}), s["id"]: {"issues": g.bad(rep), "attempts": 1, "batch": True}})
        return s["id"], g.bad(rep)

    with ThreadPoolExecutor(6) as ex:
        issues = [x for x in ex.map(handle, results) if x[1]]
    print(f"Збережено {len(results)}, не намалювало: {len(failed)} {failed}")
    print(f"Перевірка знайшла брак у {len(issues)}: {issues}")
    reuse()  # решта імен з тими самими сюжетами


if __name__ == "__main__":
    {"reuse": reuse, "submit": submit, "status": status, "collect": collect}[sys.argv[1]]()
