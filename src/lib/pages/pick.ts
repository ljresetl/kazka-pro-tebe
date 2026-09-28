/** Стабільний вибір варіанта за ключем (той самий при кожній збірці). */
export function pick<T>(key: string, list: T[]): T {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}
