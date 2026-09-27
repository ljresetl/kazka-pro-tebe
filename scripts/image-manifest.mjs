// Складає список готових картинок у public/img, щоб сайт знав,
// де показувати фото, а де — заглушку з описом для генерації.
// Запускається автоматично перед `npm run dev` і `npm run build`.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = "public/img";
const files = [];
function walk(dir) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(webp|png|jpe?g)$/i.test(name)) files.push("/img/" + relative(root, full).split("\\").join("/"));
  }
}
walk(root);
files.sort();
writeFileSync("src/lib/image-manifest.json", JSON.stringify(files, null, 2) + "\n");
console.log(`image-manifest: ${files.length} картинок`);
