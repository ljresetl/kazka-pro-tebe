"""Генерація картинок сайту через Gemini API за описами з prompts.json.

Використання:
  python scripts/ai-images/generate.py home/hero vik/0-2 ...      # окремі картинки
  python scripts/ai-images/generate.py --group tema imya          # групи
  python scripts/ai-images/generate.py --all                      # усе, що ще не згенеровано
  Додатково: --per-group N (проба: по N з кожної групи), --force (перемалювати готові), --jobs 4.

Ключ — з .env.local (GEMINI_API_KEY). Результат пишеться в public/<file> у webp потрібного розміру,
сирий PNG — у scripts/ai-images/raw/, список готових — у done.json, результати перевірки — у qa.json.

Щоб картинки виходили правильно з першого разу:
  * опис для кожної групи збирається окремо (яскравий стиль, жодного тексту, для іконок — біле тло,
    яке потім вирізаємо в прозоре, бо «прозорого тла» модель не вміє і малює шахматку);
  * назви книжок з іменами не малює ШІ (пише з помилками) — їх накладаємо шрифтом Nunito;
  * кожну картинку перевіряє текстова модель Gemini (текст, шахматка, каліцтва) і лише браковану
    перемальовуємо ще раз.
"""
import argparse, base64, io, json, os, re, sys, threading, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "scripts", "ai-images")
LIB = os.path.join(ROOT, "scripts", "library-images")
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")
QA_MODEL = os.environ.get("GEMINI_QA_MODEL", "gemini-flash-latest")
RAW = os.path.join(HERE, "raw")
API = "https://generativelanguage.googleapis.com/v1beta/models/"

NO_TEXT = ("The image must contain no text at all: no letters, words, names, titles, numbers or logos "
           "on books, signs, vehicles, banners or clothes. Book covers, book pages, cards and posters show only pictures.")
VIVID = ("Vibrant, bright, highly saturated colours, rich warm lighting with glossy highlights, "
         "Pixar-like 3D children's illustration, happy expressive faces with clear eyes and smiles, "
         "well-formed hands, full detailed colourful background scene.")
ICON = ("Cute glossy 3D icon, Pixar-like render, vibrant bright saturated colours, rounded friendly shapes, "
        "soft studio lighting, centered with generous empty margin around it, isolated on a plain solid pure white "
        "background (no checkerboard pattern, no floor, no shadow on the background), square.")
CHARACTER = ("Cute glossy 3D character illustration, Pixar-like render, vibrant bright saturated colours, "
             "friendly smiling face, full body fits inside the frame with margin, "
             "isolated on a plain solid pure white background (no checkerboard pattern, no floor, no scenery).")


def build(slot: dict) -> tuple[str, str]:
    """Повертає (опис для моделі, спосіб обробки: scene | cutout | cover)."""
    p, g = slot["prompt"], slot["group"]
    if "transparent background" in p:  # tema, rozdil, moral, vik — іконки
        subject = re.sub(r"\.?\s*Cute 3D icon.*$", "", p)
        return f"{subject}. {ICON} {NO_TEXT}", "cutout"
    if g == "tema-velyka":
        subject = re.sub(r"\.?\s*Soft clay 3D render.*$", "", p)
        return f"{subject}. {CHARACTER} {NO_TEXT}", "cutout"
    if g == "imya":
        m = re.search(r"a cheerful (.+?) as the hero of an adventure about (.+?), (.+?) next to the child", p)
        hero, about, thing = m.groups() if m else ("child", "a magical adventure", "a friendly companion")
        return (f"Full-bleed square artwork for the front cover of a children's picture book (just the artwork itself, "
                f"not a photo of a book): {hero} as the hero of an adventure about {about}, with {thing}. "
                f"The hero is in the lower two thirds; the top part is open sky or simple background. {VIVID} {NO_TEXT}"), "cover"
    if g == "blog":
        m = re.search(r'titled "(.+?)" \((.+?)\)\.', p)
        title, about = m.groups() if m else ("", "")
        return (f"Illustration for a parenting blog article (context only, never write it: «{title}» — {about}). "
                f"Cosy scene of a parent and a child reading a picture book together, with a few details that hint at "
                f"the topic of the article. {VIVID} Landscape 3:2. {NO_TEXT}"), "scene"
    if g in ("styl", "pryklad-foto"):  # власний стиль — не чіпаємо
        return f"{p} {NO_TEXT}", "scene"
    subject = re.sub(r"\.?\s*Soft 3D render.*$", "", p)
    return f"{subject}. {VIVID} {NO_TEXT}", "scene"


def env_key() -> str:
    for line in open(os.path.join(ROOT, ".env.local"), encoding="utf8"):
        if line.startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("GEMINI_API_KEY немає в .env.local")


KEY = env_key()


def call(model: str, parts: list, config: dict | None = None, tries: int = 4) -> dict:
    body = {"contents": [{"parts": parts}]}
    if config:
        body["generationConfig"] = config
    for attempt in range(tries):
        req = urllib.request.Request(API + f"{model}:generateContent", data=json.dumps(body).encode(),
                                     headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
        try:
            return json.load(urllib.request.urlopen(req, timeout=240))
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(10 * (attempt + 1))
                continue
            raise RuntimeError(f"HTTP {e.code}: {e.read()[:300]!r}")
        except (urllib.error.URLError, TimeoutError):
            if attempt < tries - 1:
                time.sleep(5)
                continue
            raise


def aspect(w: int, h: int) -> str:
    opts = ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3"]
    return min(opts, key=lambda a: abs(int(a.split(":")[0]) / int(a.split(":")[1]) - w / h))


def draw(prompt: str, ar: str) -> bytes:
    res = call(MODEL, [{"text": prompt}], {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": ar}})
    parts = res.get("candidates", [{}])[0].get("content", {}).get("parts", [])
    img = next((p for p in parts if "inlineData" in p), None)
    if not img:
        raise RuntimeError("модель не повернула картинку")
    return base64.b64decode(img["inlineData"]["data"])


QA_PROMPT = """You check an illustration for a children's website. Answer ONLY with JSON:
{"text": true/false, "checkerboard": true/false, "deformed": true/false}
text — clearly readable letters or words (large enough to notice at a glance; tiny blurred marks do not count);
checkerboard — a grey-white checkerboard "transparency" pattern is drawn;
deformed — clearly broken anatomy (extra or missing limbs, melted or faceless faces) or a garbled mess.
Be strict only about obvious problems a parent would notice."""


def qa(raw: bytes, description: str) -> dict:
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    img.thumbnail((768, 768))
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=85)
    res = call(QA_MODEL, [{"text": QA_PROMPT},
                          {"inlineData": {"mimeType": "image/jpeg", "data": base64.b64encode(buf.getvalue()).decode()}}],
               {"responseMimeType": "application/json"})
    try:
        return json.loads(res["candidates"][0]["content"]["parts"][0]["text"])
    except Exception:
        return {}


def bad(r: dict) -> list[str]:
    return [k for k in ("text", "checkerboard", "deformed") if r.get(k)]


# ---------- обробка ----------

def cut_white(img: Image.Image) -> Image.Image:
    """Прибирає біле тло, з'єднане з краями (заливка від країв), і м'яко згладжує край."""
    rgb = img.convert("RGB")
    w, h = rgb.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)]:
        if sum(rgb.getpixel(xy)) > 690:
            ImageDraw.floodfill(rgb, xy, (255, 0, 255), thresh=30)
    mask = Image.frombytes("L", rgb.size, bytes(0 if px == (255, 0, 255) else 255 for px in rgb.get_flattened_data()))
    mask = mask.filter(ImageFilter.GaussianBlur(0.8))
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out.crop(out.getbbox() or (0, 0, w, h))


def fit_cover(img: Image.Image, w: int, h: int) -> Image.Image:
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    l, t = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((l, t, l + w, t + h))


def fit_contain(img: Image.Image, w: int, h: int) -> Image.Image:
    canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    img = img.copy()
    img.thumbnail((int(w * 0.92), int(h * 0.92)), Image.LANCZOS)
    canvas.paste(img, ((w - img.width) // 2, (h - img.height) // 2), img)
    return canvas


NAMES = {n["slug"]: n for n in json.load(open(os.path.join(LIB, "data.json"), encoding="utf8"))["names"]}
INK = {"kazky": "#8b5cf6", "pryhody": "#ea580c", "zaniattia": "#059669", "svity": "#2563eb", "sviata": "#e11d48",
       "rodyna": "#d97706", "navchalni": "#0284c7", "pochuttia": "#db2777", "istorii": "#7c3aed"}


def font(size: int) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(os.path.join(LIB, "Nunito.ttf"), size)
    try:
        f.set_variation_by_axes([900])
    except Exception:
        pass
    return f


def book_cover(art: Image.Image, slug: str, w: int, h: int) -> Image.Image:
    """Тверда обкладинка: ілюстрація від ШІ на весь розмір, назва з ім'ям — шрифтом зверху."""
    n = NAMES.get(slug.split("/")[-1], {"title": "", "cat": ""})
    ink = INK.get(n.get("cat", ""), "#ea580c")
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bw, bh = int(w * 0.7), int(h * 0.9)
    x0, y0 = (w - bw) // 2, (h - bh) // 2
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([x0 + 14, y0 + 20, x0 + bw + 14, y0 + bh + 20], 24, fill=(90, 50, 20, 90))
    c.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    book = fit_cover(art.convert("RGBA"), bw, bh)
    d = ImageDraw.Draw(book, "RGBA")
    # світла плашка під назву, щоб читалася на будь-якому небі
    f = font(int(bw * 0.085))
    words, lines, line = n["title"].split(), [], ""
    for word in words:
        test = (line + " " + word).strip()
        if d.textlength(test, font=f) <= bw * 0.8:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    lh = int(f.size * 1.18)
    band = int(bh * 0.05) + lh * len(lines) + int(bh * 0.04)
    grad = Image.new("L", (1, band + 60))
    for y in range(band + 60):
        grad.putpixel((0, y), 225 if y < band else int(225 * (1 - (y - band) / 60)))
    book.alpha_composite(Image.merge("RGBA", [Image.new("L", (bw, band + 60), 255)] * 3 + [grad.resize((bw, band + 60))]))
    y = int(bh * 0.05)
    col = tuple(int(ink[i:i + 2], 16) for i in (1, 3, 5))
    for ln in lines:
        tw = d.textlength(ln, font=f)
        d.text(((bw - tw) / 2, y), ln, font=f, fill=col + (255,))
        y += lh
    # корінець
    d.rectangle([0, 0, int(bw * 0.045), bh], fill=col + (235,))
    mask = Image.new("L", book.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, bw - 1, bh - 1], 22, fill=255)
    book.putalpha(mask)
    c.alpha_composite(book, (x0, y0))
    return c


# ---------- запуск ----------

lock = threading.Lock()
DONE = os.path.join(HERE, "done.json")
QA_LOG = os.path.join(HERE, "qa.json")


def update_json(path: str, fn):
    with lock:
        data = json.load(open(path, encoding="utf8")) if os.path.exists(path) else None
        data = fn(data)
        json.dump(data, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=1)


def generate(slot: dict) -> str:
    prompt, mode = build(slot)
    w, h = slot["width"], slot["height"]
    ar = "1:1" if mode == "cover" else aspect(w, h)
    report = {}
    for attempt in range(2):  # друга спроба — лише якщо перевірка знайшла брак
        raw = draw(prompt if attempt == 0 else prompt + " Double-check: absolutely no text, no checkerboard, correct anatomy.", ar)
        report = qa(raw, slot["prompt"][:400])
        if not bad(report):
            break
    os.makedirs(RAW, exist_ok=True)
    open(os.path.join(RAW, slot["id"].replace("/", "_") + ".png"), "wb").write(raw)
    img = Image.open(io.BytesIO(raw))
    if mode == "cutout":
        out = fit_contain(cut_white(img), w, h)
    elif mode == "cover":
        out = book_cover(img, slot["id"], w, h)
    else:
        out = fit_cover(img.convert("RGB"), w, h)
    out.save(os.path.join(ROOT, "public", slot["file"].lstrip("/")), "WEBP", quality=86, method=6)
    update_json(DONE, lambda d: sorted(set((d or []) + [slot["file"]])))
    update_json(QA_LOG, lambda d: {**(d or {}), slot["id"]: {"issues": bad(report), "attempts": attempt + 1}})
    return f"{'OK ' if not bad(report) else 'БРАК'} {slot['id']} (спроб: {attempt + 1}{', ' + ','.join(bad(report)) if bad(report) else ''})"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--group", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--per-group", type=int)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--jobs", type=int, default=4)
    a = ap.parse_args()
    slots = json.load(open(os.path.join(HERE, "prompts.json"), encoding="utf8"))
    done = set(json.load(open(DONE, encoding="utf8"))) if os.path.exists(DONE) else set()
    if a.ids:
        todo = [s for s in slots if s["id"] in a.ids]
    else:
        todo = [s for s in slots if a.all or s["group"] in (a.group or [])]
        if not a.force:
            todo = [s for s in todo if s["file"] not in done]
    if a.per_group:
        seen: dict[str, int] = {}
        todo = [s for s in todo if seen.setdefault(s["group"], 0) < a.per_group and not seen.update({s["group"]: seen[s["group"]] + 1})]
    print(f"Малюємо {len(todo)} картинок моделлю {MODEL}", flush=True)
    t0 = time.time()
    with ThreadPoolExecutor(a.jobs) as ex:
        for i, f in enumerate([ex.submit(generate, s) for s in todo], 1):
            try:
                print(f"[{i}/{len(todo)}] {f.result()}", flush=True)
            except Exception as e:
                print(f"[{i}/{len(todo)}] ПОМИЛКА {todo[i - 1]['id']}: {e}", flush=True)
    print(f"Готово за {time.time() - t0:.0f} с", flush=True)


if __name__ == "__main__":
    main()
