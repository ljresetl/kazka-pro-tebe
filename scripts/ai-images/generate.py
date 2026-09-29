"""Генерація картинок сайту через Gemini API за описами з prompts.json.

Використання:  python scripts/ai-images/generate.py home/hero vik/0-2 ...
               python scripts/ai-images/generate.py --group home
Ключ береться з .env.local (GEMINI_API_KEY). Результат одразу пишеться
в public/<file> у форматі webp потрібного розміру.
"""
import base64, io, json, os, re, sys, time, urllib.request
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image")
RAW = os.path.join(ROOT, "scripts", "ai-images", "raw")

# Яскравий стиль замість пастельного (користувач хоче як у чаті Gemini).
SCENE_STYLE = ("Vibrant, bright, highly saturated colours, rich warm lighting with glossy highlights, "
               "Pixar-like 3D children's illustration, full detailed colourful background scene, "
               "happy expressive faces. Book covers and pages show only pictures: absolutely no words, titles, letters or numbers anywhere in the image.")
ICON_STYLE = ("Cute glossy 3D icon, Pixar-like render, vibrant bright saturated colours, rounded friendly shapes, "
              "happy expressive face, soft studio lighting, centered with generous margin, "
              "isolated on a plain solid pure white background (no checkerboard, no shadow on the background), "
              "square. Any book shows only pictures on its cover: absolutely no words, titles, letters or numbers anywhere.")


def restyle(p: str) -> tuple[str, bool]:
    if "transparent background" in p:
        return re.sub(r"Cute 3D icon.*$", ICON_STYLE, p), True
    return re.sub(r"Soft 3D render.*$", SCENE_STYLE, p), False


def key() -> str:
    for line in open(os.path.join(ROOT, ".env.local"), encoding="utf8"):
        if line.startswith("GEMINI_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"')
    raise SystemExit("GEMINI_API_KEY немає в .env.local")


def aspect(w: int, h: int) -> str:
    opts = ["1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3"]
    return min(opts, key=lambda a: abs(int(a.split(":")[0]) / int(a.split(":")[1]) - w / h))


def cut_white(img: Image.Image) -> Image.Image:
    """Прибирає біле тло, з'єднане з краями (заливка від кутів)."""
    img = img.convert("RGBA")
    mask = Image.new("L", img.size, 0)
    rgb = img.convert("RGB")
    w, h = img.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        ImageDraw.floodfill(rgb, xy, (255, 0, 255), thresh=28)
    px = rgb.load(); m = mask.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] != (255, 0, 255):
                m[x, y] = 255
    img.putalpha(mask)
    return img.crop(img.getbbox() or (0, 0, w, h))


def fit(img: Image.Image, w: int, h: int, icon: bool) -> Image.Image:
    if icon:
        canvas = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        img.thumbnail((int(w * 0.92), int(h * 0.92)), Image.LANCZOS)
        canvas.paste(img, ((w - img.width) // 2, (h - img.height) // 2), img)
        return canvas
    s = max(w / img.width, h / img.height)
    img = img.resize((round(img.width * s), round(img.height * s)), Image.LANCZOS)
    l, t = (img.width - w) // 2, (img.height - h) // 2
    return img.crop((l, t, l + w, t + h))


def generate(slot: dict, k: str) -> None:
    prompt, icon = restyle(slot["prompt"])
    body = {"contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE"],
                                 "imageConfig": {"aspectRatio": aspect(slot["width"], slot["height"])}}}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
        data=json.dumps(body).encode(), headers={"x-goog-api-key": k, "Content-Type": "application/json"})
    res = json.load(urllib.request.urlopen(req, timeout=240))
    part = next(p for p in res["candidates"][0]["content"]["parts"] if "inlineData" in p)
    raw = base64.b64decode(part["inlineData"]["data"])
    os.makedirs(RAW, exist_ok=True)
    open(os.path.join(RAW, slot["id"].replace("/", "_") + ".png"), "wb").write(raw)
    img = Image.open(io.BytesIO(raw))
    if icon:
        img = cut_white(img)
    out = fit(img.convert("RGBA" if icon else "RGB"), slot["width"], slot["height"], icon)
    out.save(os.path.join(ROOT, "public", slot["file"].lstrip("/")), "WEBP", quality=86, method=6)
    mark_done(slot["file"])


def mark_done(file: str) -> None:
    """Список уже згенерованих файлів (їх не показує /zaglushky, див. library-images/write_list.py)."""
    path = os.path.join(ROOT, "scripts", "ai-images", "done.json")
    done = json.load(open(path, encoding="utf8")) if os.path.exists(path) else []
    if file not in done:
        json.dump(sorted(done + [file]), open(path, "w", encoding="utf8"), ensure_ascii=False, indent=1)


def main() -> None:
    slots = json.load(open(os.path.join(ROOT, "scripts", "ai-images", "prompts.json"), encoding="utf8"))
    args = sys.argv[1:]
    if args[:1] == ["--group"]:
        todo = [s for s in slots if s["group"] in args[1:]]
    else:
        by_id = {s["id"]: s for s in slots}
        todo = [by_id[a] for a in args]
    k = key()
    for s in todo:
        t = time.time()
        try:
            generate(s, k)
            print(f"{s['id']}: ok {time.time() - t:.0f}s", flush=True)
        except Exception as e:  # продовжуємо з рештою
            print(f"{s['id']}: ПОМИЛКА {e}", flush=True)


if __name__ == "__main__":
    main()
