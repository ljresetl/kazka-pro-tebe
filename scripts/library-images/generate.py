# Збирає картинки сайту з 3D-іконок Microsoft Fluent Emoji (MIT) і шрифту Nunito (OFL).
# Результат — WebP у kids-books/public/img/<група>/<id>.webp (там, де їх чекає реєстр images.ts).
import json, math, os, random, re, sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

sys.stdout.reconfigure(encoding="utf-8")
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "C:/Users/ljres/projects/проби роблю тут/kids-books/public/img"
sys.path.insert(0, HERE)
from mapping import *  # noqa

DATA = json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8"))
FONT = os.path.join(HERE, "Nunito.ttf")

PAL = {
    "kazky": ("#fbe7ff", "#e8d4ff", "#8b5cf6"),
    "pryhody": ("#ffe8cf", "#ffc98f", "#ea580c"),
    "zaniattia": ("#e3f7ec", "#bfe8cf", "#059669"),
    "svity": ("#e0edff", "#bcd6fe", "#2563eb"),
    "sviata": ("#ffe8ec", "#fecdd3", "#e11d48"),
    "rodyna": ("#fff5d6", "#fde68a", "#d97706"),
    "navchalni": ("#e2f4fe", "#bae6fd", "#0284c7"),
    "pochuttia": ("#fde9f4", "#fbcfe8", "#db2777"),
    "istorii": ("#efeaff", "#ddd6fe", "#7c3aed"),
    "default": ("#fff3e3", "#ffd9b3", "#ea580c"),
}
TOPIC_CAT = {}
src = open("C:/Users/ljres/projects/проби роблю тут/kids-books/src/lib/catalog.ts", encoding="utf-8").read()
for block in re.finditer(r'id: "([a-z-]+)",\s*label: "[^"]+",\s*en: "[^"]*",\s*icon: "[^"]*",\s*about: "[^"]*",\s*topics: \[(.*?)\]', src, re.S):
    for tid in re.findall(r't\("([a-z-]+)"', block.group(2)):
        TOPIC_CAT[tid] = block.group(1)

_cache = {}


def emoji(name, size):
    key = (name, size)
    if key not in _cache:
        fn = os.path.join(HERE, "png", name.lstrip("@").replace(" ", "_") + ("_L" if name.startswith("@") else "") + ".png")
        if not os.path.exists(fn):
            import urllib.parse, urllib.request
            P = json.load(open(os.path.join(HERE, "paths.json"), encoding="utf-8"))
            n = name.lstrip("@")
            p = (P["light"].get(n) if name.startswith("@") else None) or P["plain"].get(n) or P["light"].get(n)
            urllib.request.urlretrieve("https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/" + urllib.parse.quote(p), fn)
        im = Image.open(fn).convert("RGBA")
        _cache[key] = im.resize((size, int(size * im.height / im.width)), Image.LANCZOS)
    return _cache[key]


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def gradient(w, h, top, bottom):
    a, b = hexrgb(top), hexrgb(bottom)
    col = Image.new("RGBA", (1, h))
    for y in range(h):
        t = y / max(1, h - 1)
        col.putpixel((0, y), tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)) + (255,))
    return col.resize((w, h))


def rounded(img, r):
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, img.width - 1, img.height - 1], r, fill=255)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


def shadow(canvas, cx, cy, rw, rh, alpha=60):
    sh = Image.new("RGBA", canvas.size, (120, 70, 30, 0))
    ImageDraw.Draw(sh).ellipse([cx - rw, cy - rh, cx + rw, cy + rh], fill=(120, 70, 30, alpha))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(rh * 0.8)))


def place(canvas, name, size, cx, cy, angle=0):
    e = emoji(name, size)
    if angle:
        e = e.rotate(angle, resample=Image.BICUBIC, expand=True)
    canvas.alpha_composite(e, (int(cx - e.width / 2), int(cy - e.height / 2)))


def glow(canvas, cx, cy, r):
    g = Image.new("RGBA", canvas.size, (255, 255, 255, 0))
    ImageDraw.Draw(g).ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 255, 255, 150))
    canvas.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.35)))


ONLY_MISSING = os.environ.get("ONLY_MISSING") == "1"


def exists(group, name):
    f = os.path.join(OUT, group, name + ".webp")
    return ONLY_MISSING and os.path.exists(f) and os.path.getsize(f) > 0


def save(img, group, name, quality=80):
    os.makedirs(os.path.join(OUT, group), exist_ok=True)
    img.save(os.path.join(OUT, group, name + ".webp"), "WEBP", quality=quality, method=4)


def icon(names, size=512):
    """Іконка: одна головна 3D-іконка на прозорому тлі (як 3D-іконки зразка)."""
    c = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    main = names if isinstance(names, str) else names[0]
    shadow(c, size / 2, size * 0.86, size * 0.26, size * 0.045, 50)
    place(c, main, int(size * 0.8), size / 2, size / 2)
    return c


def scene(names, w, h, pal, radius=48, main_scale=0.62):
    """Сцена: м'який градієнт, головна іконка по центру, дві допоміжні зверху."""
    top, bottom, _ = pal
    c = rounded(gradient(w, h, top, bottom), radius)
    m = min(w, h)
    glow(c, w / 2, h * 0.5, m * 0.42)
    size = min(int(m * main_scale), 460)
    shadow(c, w / 2, h / 2 + size * 0.46, size * 0.36, size * 0.06)
    if len(names) > 1:
        place(c, names[1], min(int(m * 0.26), 240), w * 0.2, h * 0.24, 12)
    if len(names) > 2:
        place(c, names[2], min(int(m * 0.22), 220), w * 0.82, h * 0.26, -10)
    place(c, names[0], size, w / 2, h / 2 + m * 0.04)
    return c


_fonts = {}


def font(size, weight=900):
    if (size, weight) in _fonts:
        return _fonts[(size, weight)]
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([weight])
    except Exception:
        pass
    _fonts[(size, weight)] = f
    return f


def wrap(draw, text, f, max_w):
    words, lines, line = text.split(), [], ""
    for word in words:
        test = (line + " " + word).strip()
        if draw.textlength(test, font=f) <= max_w:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def cover(title, names, pal, w=800, h=800):
    """Обкладинка книжки: тверда палітурка з корінцем, назва з ім'ям і 3D-герой."""
    top, bottom, ink = pal
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    bw, bh = int(w * 0.66), int(h * 0.88)
    x0, y0 = (w - bw) // 2, (h - bh) // 2
    # тінь книжки
    sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([x0 + 14, y0 + 20, x0 + bw + 14, y0 + bh + 20], 26, fill=(90, 50, 20, 90))
    c.alpha_composite(sh.filter(ImageFilter.GaussianBlur(18)))
    book = rounded(gradient(bw, bh, top, bottom), 24)
    d = ImageDraw.Draw(book)
    # корінець
    d.rounded_rectangle([0, 0, int(bw * 0.07), bh], 24, fill=hexrgb(ink) + (255,))
    d.rectangle([int(bw * 0.04), 0, int(bw * 0.07), bh], fill=hexrgb(ink) + (255,))
    # назва
    f = font(int(bw * 0.085))
    lines = wrap(d, title, f, bw * 0.8)
    if len(lines) > 3:
        f = font(int(bw * 0.07))
        lines = wrap(d, title, f, bw * 0.82)
    y = int(bh * 0.07)
    for ln in lines[:4]:
        tw = d.textlength(ln, font=f)
        tx = int(bw * 0.07 + (bw * 0.93 - tw) / 2)
        d.text((tx + 2, y + 3), ln, font=f, fill=(0, 0, 0, 40))
        d.text((tx, y), ln, font=f, fill=hexrgb(ink) + (255,))
        y += int(f.size * 1.18)
    # герой
    area_top = y + int(bh * 0.02)
    size = min(int(bw * 0.58), int((bh - area_top) * 0.78), 360)
    cx, cy = bw * 0.535, area_top + (bh - area_top) * 0.52
    glow(book, cx, cy, size * 0.65)
    if len(names) > 1:
        place(book, names[1], int(size * 0.34), bw * 0.24, cy - size * 0.36, 10)
    if len(names) > 2:
        place(book, names[2], int(size * 0.3), bw * 0.86, cy - size * 0.3, -10)
    place(book, names[0], size, cx, cy + size * 0.06)
    # підпис видавця
    fs = font(int(bw * 0.034), 700)
    label = "Казкарня"
    d.text((bw * 0.535 - d.textlength(label, font=fs) / 2, bh - bw * 0.07), label, font=fs, fill=hexrgb(ink) + (200,))
    c.alpha_composite(book, (x0, y0))
    return c


def pal_for_topic(t):
    return PAL.get(TOPIC_CAT.get(t, "default"), PAL["default"])


count = 0
# 1. Теми: іконка + велика сцена
for tid, names in TOPICS.items():
    save(icon(names), "tema", tid)
    save(scene(names, 900, 900, pal_for_topic(tid)), "tema-velyka", tid)
    count += 2
# 2. Розділи, мораль, вікові групи
for cid, n in CATEGORIES.items():
    save(icon(n), "rozdil", cid); count += 1
for mid, n in MORALS.items():
    save(icon(n), "moral", mid); count += 1
for aid, n in AGE_GROUPS.items():
    save(icon(n), "vik", aid); count += 1
# 3. Вік (сторінки)
for i, (slug, names) in enumerate(AGE_PAGES.items()):
    pal = list(PAL.values())[i % 9]
    save(scene(names, 600, 600, pal, 40, 0.6), "vik-rik", slug); count += 1
# 4. Подарунки, додатки, можливості, кроки
for slug, names in GIFTS.items():
    save(scene(names, 800, 600, PAL["sviata"] if slug not in ("litni-kanikuly", "do-shkoly") else PAL["svity"]), "pryvid", slug); count += 1
for slug, names in EXTRAS.items():
    save(scene(names, 800, 600, PAL["default"]), "dodatky", slug); count += 1
for i, (slug, names) in enumerate(FEATURES.items()):
    save(scene(names, 800, 600, list(PAL.values())[i % 9]), "mozhlyvosti", slug); count += 1
for slug, names in HOME.items():
    save(scene(names, 800, 600, PAL["default"]), "home", slug); count += 1

# 5. Обкладинки для імен
for n in DATA["names"]:
    if exists("imya", n["slug"]):
        continue
    names = TOPICS[n["topic"]]
    save(cover(n["title"], names, PAL.get(n["cat"], PAL["default"])), "imya", n["slug"], 78)
    count += 1

# 6. Головна: стос обкладинок; книжка у твердій обкладинці; фото → ілюстрація
def book_stack(w, h, items):
    c = rounded(gradient(w, h, "#fff3e3", "#ffe0bf"), 48)
    glow(c, w * 0.5, h * 0.5, min(w, h) * 0.45)
    spots = [(0.28, 0.56, -9), (0.72, 0.54, 8), (0.5, 0.5, 0)]
    for (fx, fy, ang), (title, names, pal) in zip(spots, items):
        cv = cover(title, names, pal, 620, 620).rotate(ang, resample=Image.BICUBIC, expand=True)
        c.alpha_composite(cv, (int(w * fx - cv.width / 2), int(h * fy - cv.height / 2)))
    return c


save(
    book_stack(
        1200,
        900,
        [
            ("Тимко і маленький диплодок", TOPICS["dynozavry"], PAL["pryhody"]),
            ("Злата і дракон-боягуз", TOPICS["lytsari"], PAL["kazky"]),
            ("Марійка і зоряний кит", TOPICS["kosmos"], PAL["svity"]),
        ],
    ),
    "home",
    "hero",
)
save(cover("Книжка, де герой — твоя дитина", ["Open book", "Sparkles", "Glowing star"], PAL["default"], 900, 900), "book", "hardcover")
fp = rounded(gradient(1000, 600, "#fff3e3", "#ffe0bf"), 40)
place(fp, "Framed picture", 240, 250, 300, -6)
place(fp, "Right arrow", 110, 500, 300)
place(fp, "@Child", 250, 760, 300)
place(fp, "Sparkles", 90, 870, 170)
save(fp, "book", "foto-pryklad")
count += 3

# 7. «Використані фото» в прикладах: портрет-іконка героя
for e in DATA["examples"]:
    c = rounded(gradient(400, 400, "#e0edff" if e["g"] == "boy" else "#ffe8ec", "#ffffff"), 36)
    place(c, "@Boy" if e["g"] == "boy" else "@Girl", 300, 200, 215)
    save(c, "pryklad-foto", e["slug"]); count += 1

# 8. Статті блогу: сцена за ключовими словами
KEYS = [
    (r"валентин|любов", ["Heart with ribbon", "Love letter", "Rose"]),
    (r"різдв|миколай|грудн|свят", ["Christmas tree", "Wrapped gift", "Star"]),
    (r"мам|тат|бабус|дідус|родин", ["House with garden", "Two hearts", "Open book"]),
    (r"улюбленц|тварин|звірят", ["Dog", "Cat", "Open book"]),
    (r"фентез|дракон|чарівн", ["Dragon", "Magic wand", "Castle"]),
    (r"пригод", ["World map", "Compass", "Open book"]),
    (r"школ", ["Backpack", "Books", "Pencil"]),
    (r"літ|дорог|подорож", ["Luggage", "Beach with umbrella", "Open book"]),
    (r"осін", ["Fallen leaf", "Hot beverage", "Open book"]),
    (r"на ніч|\bсон|перед сном", ["Crescent moon", "Star", "Teddy bear"]),
    (r"емоц|емпат|страх|тривог|розлуч|втрат|переїзд|братик|сестрич", ["Two hearts", "Teddy bear", "Open book"]),
    (r"стил|ілюстрац", ["Artist palette", "Paintbrush", "Framed picture"]),
    (r"подар", ["Wrapped gift", "Balloon", "Open book"]),
    (r"що таке персональн|персональна чи", ["Open book", "Sparkles", "Glowing star"]),
    (r"наук|розвит|уяв|фантаз", ["Light bulb", "Brain", "Open book"]),
    (r"мов|українськ|казк|колобок|рукавичк|коза", ["Open book", "Sunflower", "Sparkles"]),
    (r"читан|книж", ["Books", "Open book", "Glowing star"]),
]
for i, p in enumerate(DATA["posts"]):
    t = p["title"].lower()
    names = next((v for k, v in KEYS if re.search(k, t)), ["Books", "Open book", "Sparkles"])
    save(scene(names, 1200, 800, list(PAL.values())[i % 9], 40, 0.55), "blog", p["slug"], 78)
    count += 1

print("generated", count)

# 8b. Обкладинки прикладів книжок
THEME_TOPIC = {"space": "kosmos", "forest": "charivnyi-lis", "sea": "pidvodnyi-svit", "dino": "dynozavry", "castle": "lytsari", "meadow": "sadivnytstvo"}
for e in DATA["examples"]:
    t = THEME_TOPIC[e["theme"]]
    save(cover(e["title"], TOPICS[t], pal_for_topic(t), 600, 800), "pryklad-obkladynka", e["slug"])
    count += 1

# 9. Зразки 10 стилів ілюстрацій (та сама сцена, різна обробка)
from PIL import ImageChops, ImageEnhance, ImageOps


def style_scene(sticker=False):
    w, h = 800, 600
    c = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    parts = [("@Woman", 300, 250, 330, 0), ("@Girl", 250, 470, 360, 0), ("Framed picture", 190, 610, 250, -8), ("Tiger face", 120, 612, 250, -8), ("Sunflower", 110, 110, 470, 10), ("Sun", 120, 690, 90, 0)]
    for name, size, x, y, ang in parts:
        e = emoji(name, size)
        if ang:
            e = e.rotate(ang, resample=Image.BICUBIC, expand=True)
        if sticker:
            a = e.split()[3].filter(ImageFilter.MaxFilter(15))
            outline = Image.new("RGBA", e.size, (255, 255, 255, 0))
            outline.putalpha(a)
            layer = Image.new("RGBA", e.size, (0, 0, 0, 0))
            layer.alpha_composite(outline)
            layer.alpha_composite(e)
            e = layer
        c.alpha_composite(e, (int(x - e.width / 2), int(y - e.height / 2)))
    return c


def meadow(w=800, h=600):
    bg = gradient(w, h, "#bfe3ff", "#fff3d6")
    d = ImageDraw.Draw(bg)
    d.ellipse([-200, h * 0.62, w + 200, h * 1.6], fill=(150, 214, 140, 255))
    return bg


def noise(w, h, amount=18, seed=1):
    rnd = random.Random(seed)
    n = Image.new("L", (w, h))
    n.putdata([128 + rnd.randint(-amount, amount) for _ in range(w * h)])
    return n


def with_bg(fg, bg):
    out = bg.copy()
    out.alpha_composite(fg)
    return out


def grain(img, amount=14):
    n = noise(img.width, img.height, amount).convert("RGBA")
    return Image.blend(img, ImageChops.overlay(img.convert("RGB"), n.convert("RGB")).convert("RGBA"), 0.5)


S = style_scene()
BG = meadow()
styles = {}
styles["3d"] = with_bg(S, BG)
styles["akvarel"] = grain(with_bg(S, BG).filter(ImageFilter.GaussianBlur(2.5)).filter(ImageFilter.SMOOTH_MORE), 22)
styles["heometriia"] = with_bg(S, BG).convert("RGB").quantize(12, method=Image.Quantize.MEDIANCUT).convert("RGBA")
pl = with_bg(S, BG)
styles["plastylin"] = grain(ImageEnhance.Contrast(pl.filter(ImageFilter.SMOOTH_MORE)).enhance(1.1), 30)
styles["naklieiky"] = with_bg(style_scene(True), gradient(800, 600, "#fff3e3", "#ffe0bf"))
cm = with_bg(S, BG).convert("RGB")
edges = ImageOps.invert(cm.filter(ImageFilter.FIND_EDGES).convert("L")).point(lambda v: 0 if v < 200 else 255)
cm = ImageOps.posterize(cm, 3)
cm.paste((25, 20, 20), mask=ImageOps.invert(edges))
styles["komiks"] = cm.convert("RGBA")
styles["huash"] = grain(ImageOps.posterize(with_bg(S, BG).convert("RGB").filter(ImageFilter.ModeFilter(7)), 4).convert("RGBA"), 10)
an = with_bg(S, BG).filter(ImageFilter.GaussianBlur(1))
styles["anime"] = ImageEnhance.Brightness(ImageEnhance.Color(an).enhance(0.85)).enhance(1.08)
styles["kubyky"] = with_bg(S, BG).resize((80, 60), Image.NEAREST).resize((800, 600), Image.NEAREST)
kol = grain(gradient(800, 600, "#f7e7cf", "#efd6b3"), 25)
for name, size, x, y, ang in [("@Woman", 280, 250, 330, -4), ("@Girl", 240, 470, 360, 5), ("Framed picture", 190, 610, 250, -10), ("Tiger face", 110, 612, 250, -10), ("Sunflower", 110, 110, 470, 12), ("Sun", 110, 690, 90, 6)]:
    e = emoji(name, size)
    a = e.split()[3].filter(ImageFilter.MaxFilter(11))
    paper = Image.new("RGBA", e.size, (255, 252, 244, 0))
    paper.putalpha(a)
    lay = Image.new("RGBA", e.size, (0, 0, 0, 0))
    lay.alpha_composite(paper)
    lay.alpha_composite(ImageOps.posterize(e.convert("RGB"), 3).convert("RGBA") if False else e)
    lay = lay.rotate(ang, resample=Image.BICUBIC, expand=True)
    kol.alpha_composite(lay, (int(x - lay.width / 2), int(y - lay.height / 2)))
styles["kolazh"] = kol
for sid, img in styles.items():
    save(img.convert("RGBA"), "styl", sid)
print("styles", len(styles))
