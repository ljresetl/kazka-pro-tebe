# Записує перелік бібліотечних файлів для сторінки /zaglushky.
import json, os
root = "C:/Users/ljres/projects/проби роблю тут/kids-books/public"
out = []
for d, _, files in os.walk(os.path.join(root, "img")):
    for f in files:
        if f.endswith(".webp"):
            out.append("/" + os.path.relpath(os.path.join(d, f), root).replace("\\", "/"))
json.dump(sorted(out), open("C:/Users/ljres/projects/проби роблю тут/kids-books/src/lib/library-images.json", "w", encoding="utf-8"), indent=0)
print(len(out))
