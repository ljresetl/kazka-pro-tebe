"""Чернетка тексту від локальної моделі Лапа (через Ollama).

Використання:
    python scripts/lapa-chernetka.py "Перекажи сучасною мовою казку «Котигорошко» для дітей 5 років"
    python scripts/lapa-chernetka.py --file zavdannia.txt

Результат — у файлі chernetka.txt (UTF-8).

ВАЖЛИВО: це лише чернетка. Лапа робить помилки у відмінках, вставляє латинські
літери всередину слів (напр. «підвікoння») і може повторювати події.
Перед публікацією текст обов'язково вичитати.
"""
import json
import sys
import urllib.request

MODEL = "hf.co/lapa-llm/lapa-v0.1.2-instruct-GGUF:Q4_K_M"

if len(sys.argv) < 2:
    sys.exit(__doc__)
prompt = open(sys.argv[2], encoding="utf-8").read() if sys.argv[1] == "--file" else " ".join(sys.argv[1:])

# ensure_ascii=True — кирилиця передається як \uXXXX. Без цього в терміналі Windows
# текст запиту псується, і модель відповідає не на тему.
body = json.dumps(
    {
        "model": MODEL,
        "stream": False,
        "options": {"num_predict": 1500, "temperature": 0.75},
        "messages": [{"role": "user", "content": prompt}],
    },
    ensure_ascii=True,
).encode("ascii")
req = urllib.request.Request("http://localhost:11434/api/chat", data=body, headers={"Content-Type": "application/json"})
with urllib.request.urlopen(req, timeout=900) as r:
    text = json.loads(r.read().decode("utf-8"))["message"]["content"]

open("chernetka.txt", "w", encoding="utf-8").write(text)
latin = [w for w in text.split() if any("a" <= c.lower() <= "z" for c in w) and any("а" <= c.lower() <= "я" for c in w)]
print(f"Готово: chernetka.txt ({len(text)} символів)")
if latin:
    print("Увага! Слова з латинськими літерами всередині:", ", ".join(latin[:20]))
