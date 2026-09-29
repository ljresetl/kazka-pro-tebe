# Записує перелік бібліотечних файлів для сторінки /zaglushky.
import json, os
root = "C:/Users/ljres/projects/проби роблю тут/kids-books/public"
out = []
for d, _, files in os.walk(os.path.join(root, "img")):
    for f in files:
        if f.endswith(".webp"):
            out.append("/" + os.path.relpath(os.path.join(d, f), root).replace("\\", "/"))
# Картинки, вже замінені ілюстраціями від ШІ (scripts/ai-images), — не тимчасові.
done_file = "C:/Users/ljres/projects/проби роблю тут/kids-books/scripts/ai-images/done.json"
if os.path.exists(done_file):
    done = set(json.load(open(done_file, encoding="utf-8")))
    out = [f for f in out if f not in done]
json.dump(sorted(out), open("C:/Users/ljres/projects/проби роблю тут/kids-books/src/lib/library-images.json", "w", encoding="utf-8"), indent=0)
print(len(out))
