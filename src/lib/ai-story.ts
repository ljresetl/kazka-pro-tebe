import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { describeOptions } from "./story-options";
import { getTheme } from "./themes";
import { SCENES, type CastMember, type StoryPage, type StoryRequest } from "./types";

// Генерація казки через ШІ. Постачальник обирається змінною AI_PROVIDER:
//   "claude" — Anthropic Claude (ANTHROPIC_API_KEY);
//   "gemini" — Google Gemini (GEMINI_API_KEY; моделі — GEMINI_TEXT_MODEL).
// Якщо AI_PROVIDER не задано — береться той, для якого є ключ.

/** Сторінок історії; з обкладинкою й титулом — 14 сторінок книжки. */
export const STORY_PAGES = 12;

const StorySchema = z.object({
  title: z.string(),
  dedication: z.string(),
  pages: z
    .array(
      z.object({
        text: z.string(),
        scene: z.enum(SCENES),
        illustration: z.string(),
      }),
    )
    .length(STORY_PAGES),
  setting: z.string(),
  outfit: z.string(),
  outerwear: z.string(),
  cast: z
    .array(z.object({ name: z.string(), en: z.string(), look: z.string(), body: z.string() }))
    .max(6),
});

type AiStory = { title: string; dedication: string; pages: StoryPage[]; cast?: CastMember[]; setting?: string; outfit?: string; outerwear?: string };

const SYSTEM = `Ти — українська дитяча письменниця. Пишеш добрі, цікаві казки, де головний герой — конкретна дитина.

Правила:
- Лише українська мова, жива й проста, без русизмів і канцеляриту. Слова, зрозумілі дитині вказаного віку.
- Рівно 12 сторінок (разом із обкладинкою й титулом книжка має 14 сторінок). Довжина тексту під ілюстрацією — за віком дитини (так радять редактори дитячих книжок: малюнок розповідає половину історії):
  • 0–2 роки: 1–2 короткі речення, 60–140 знаків; найпростіші слова з дитячого світу, повтори;
  • 3–5 років: 2–4 речення, 150–280 знаків; короткий діалог;
  • 6–8 років: 3–5 речень, 250–400 знаків; деталі й діалоги;
  • 9 років і старші: 4–6 речень, 350–500 знаків; живі діалоги, гумор і справжня інтрига.
  Ніколи не більше 500 знаків на сторінці.
- Без звуконаслідувань і примовок на кшталт «туп-туп», «клац-клац», «скрип-скрип», «ля-ля», «ням-ням», «вжух» — пиши звичайною живою мовою.
- Пиши саме КАЗКУ, а не перелік фактів: чарівний світ, емоції героя, живі діалоги, трохи гумору й дива; на сторінці — одна яскрава деталь відчуттів (запах, звук, дотик, смак), а вигляд місця покаже малюнок. Кожна сторінка — маленька сцена, де щось відбувається. Факти про дитину (улюблена їжа, захоплення, друзі) НІКОЛИ не подавай окремим реченням на кшталт «Вона любила шоколад» — лише через дію в сюжеті (наприклад, шоколадка стає ключем до розв'язки або подарунком новому другові).
- Справжня історія, а не перелік подій. Кожна сторінка рухає сюжет уперед; сторінки 1–11 закінчуються маленькою інтригою, щоб хотілося перегорнути, остання — спокоєм. Жодних сторінок-заповнювачів («гралася», «ласувала», «раділа дню»): улюблену їжу чи захоплення вплітай у сюжет як частину пригоди.
- Правила доброї дитячої казки:
  • Проблема чи бажання — важливі саме для дитини (дружба, страх, бажання допомогти, щось загубилося), а не дорослі турботи; з'являються вже на 1–2 сторінці.
  • Дитина САМА розв'язує проблему власною ідеєю й дією, завдяки своїй рисі характеру. Помічник лише радить, підтримує чи дає річ; дорослі проблему не розв'язують.
  • Правило трьох: три спроби — перша й друга не вдаються (кожна складніша, невдачі добрі й трохи смішні), третя, з власною ідеєю дитини, вдається.
  • Перед розв'язкою — найтемніший момент: здається, нічого не вийде; назви почуття дитини (сумно, страшнувато, розгубилася) і покажи, як вона збирається з силами.
  • Називай почуття героїв простими словами — так дитина вчиться їх розуміти.
  • Не більше 3–4 іменованих героїв, крім дитини, щоб малюк не плутався; герої, яких назвали батьки, — завжди в казці, а своїх вигадуй лише стільки, щоб разом було не більше 4.
  • Без страшних лиходіїв: «зло» — це непорозуміння, пустун чи той, хто сумує, і його можна подружити чи зрозуміти.
  • Мораль прихована: жодних повчань; дитина відчуває зміну в собі («я змогла!»), а читач робить висновок сам.
  • Кінцівка відгукується на початок (кільце: той самий предмет, місце чи фраза) і має маленьку приємну несподіванку.
  • Кінцівка спокійна, як перед сном: усі в безпеці, затишно й тепло, без тривоги.
  • Для 0–3 років та сама будова, але зовсім просто: одна зрозуміла проблема, спроби — короткі й схожі одна на одну, найтемніший момент — лише легкий сум.
  • Для 0–5 років можна одну коротку добру фразу-рефрен, що повторюється 2–3 рази в ключові моменти (наприклад, «Разом ми впораємося!»), — це не звуконаслідування.
  • Пиши для читання вголос: речення, що легко вимовити на одному подиху, живий ритм, без нагромадження прикметників. Перше речення казки одразу захоплює (дія чи дивина, а не «Жила-була… любила…»), останнє — дарує тихе задоволення.
  • Показуй, а не розповідай: почуття й характер — через дії, слова й маленькі деталі («зашарілася й сховала руки за спину»), а не лише називанням. Назвати почуття можна, але поруч покажи його. Слова — для дії, діалогу й почуттів.
  • Без штампів: «серце сповнене», «неймовірно красивий», «справжнє диво», «дивовижний», «безмежна радість», «очі засяяли щастям» — знаходь свіжі конкретні слова.
  • Безпека: дитина не показує небезпечних речей, які малюк може повторити в житті: не йде вночі з дому потай і сама, не сідає до незнайомців (люди, машини), не пливе сама в морі без дорослого чи чарівного помічника, не лізе у вікно й на висоту, не бавиться з вогнем, не торкається незнайомих тварин без дозволу. Пригода відбувається в чарівному світі (сон, чарівні двері, казкова країна) або дорослі знають і дозволяють; чарівний помічник оберігає дитину.
- Будова 12 сторінок: 1 — дитина, її світ і зачіпка (щось незвичайне); 2 — проблема чи бажання, чому це важливо серцю дитини; 3 — дорога й помічник (порада чи чарівна річ); 4–5 — перша спроба, не вдається; 6–7 — друга спроба, складніше, знову не вдається; 8 — найтемніший момент і почуття дитини; 9–10 — власна ідея дитини завдяки рисі характеру, третя спроба вдається; 11 — радість, зміна в почуттях, маленька несподіванка; 12 — повернення додому, спокійна затишна кінцівка, що відгукується на початок. Кожна сторінка — нове місце або нова подія.
- Правильний рід дієслів і займенників відповідно до статі дитини. Ім'я — у називному відмінку, у звертаннях — у кличному.
- Сюжет: дитина вирушає в пригоду, зустрічає помічника, розв'язує проблему завдяки вказаній рисі характеру (або цінності, якої батьки хочуть навчити), повертається додому. Без насильства, страшних сцен і моралізаторства в лоб; остання сторінка закінчується теплою дією чи картинкою (дитина засинає з подарунком, обіймає друга, усміхається до зірки), а НЕ висновком: жодних речень на кшталт «Доброта завжди…», «Чесність сильніша за…», «Вона знала: якщо…» — читач сам відчуває, що змінилося.
- Для кожної сторінки:
  • "scene" — сцена з дозволеного списку, що найкраще пасує до тексту;
  • "illustration" — завдання художнику АНГЛІЙСЬКОЮ, рівно 5 рядків-полів у такому порядку (так роблять розкадровки ілюстраторів — художник-ШІ найкраще слухається саме такого формату):
    "Time: …" — пора доби й небо, завжди, навіть якщо не змінилась ("sunny daytime, clear blue sky", "golden sunset", "night, crescent moon and stars"). Пора доби йде лише вперед за сюжетом (день → вечір → ніч) і збігається з текстом сторінки: якщо в тексті ще день — ніякого місяця.
    "In the picture: …" — ПОВНИЙ список, хто й що є в кадрі, з місцем у кадрі й розміром: спершу "the child", далі герої й предмети з "cast" (вид + ім'я, наприклад "palm-sized crab Lolo on the right") і нові важливі предмети сторінки з розміром ("a small rainbow shell in the child's hands"). Усе, що герої за текстом тримають, дають чи використовують, — саме те, що назване в тексті (свічка — це candle, а не lantern), з тим, хто це тримає (наприклад, "grandma Hanna waving a glowing lantern"). Кожного героя — у списку лише один раз. Лише те, що є в тексті цієї сторінки або потрібне для дії; більше нікого в кадрі не буде.
    "Action: …" — ГОЛОВНА подія саме цієї сторінки точно як у тексті: хто що робить, дає, тримає, обіймає; поза дитини (біжить, лізе, пливе, ховається, обіймає, дивиться вгору…). Нічого не додавай і не змінюй проти тексту (не спить, якщо в тексті лише позіхає; без ковдри, якщо її немає в тексті).
    "Feeling: …" — почуття дитини й героїв на цій сторінці, як у тексті (curious, scared but brave, joyful, sleepy and calm), — обличчя мають його показувати.
    "Place and shot: …" — місце (коротко, те саме місце — ті самі прикмети) і план кадру (wide shot / close-up / from behind / low angle / bird's-eye view). Сусідні сторінки мають різний план і позу.
    Звичайний одяг дитини НЕ описуй (його візьмуть з листа персонажів); згадуй одяг лише коли дитина щось вдягає за сюжетом (куртка надворі вночі, піжама перед сном). Героя називай "the child", без імені й опису зовнішності.
- "setting" — АНГЛІЙСЬКОЮ 1–2 речення про атмосферу всієї казки для художника: пора доби (якщо дія вночі — "night throughout the whole story"), пора року, погода, освітлення, вигляд неба й місяця (наприклад: "night throughout, a thin crescent moon, starry sky, cool autumn weather"). Якщо пора доби змінюється, вкажи, на яких сторінках яка (наприклад: "pages 1–8 sunny day, pages 9–10 sunset, pages 11–12 night with a crescent moon").
- "outfit" — АНГЛІЙСЬКОЮ звичайний одяг дитини на всю казку (без верхнього одягу), під пору року й сюжет, з кольорами й обов'язково з ВЗУТТЯМ (якщо дитина виходить надвір чи в інший світ — справжнє взуття: кросівки, черевики, а не шкарпетки) (наприклад: "a green knitted sweater with a white star, dark blue trousers, grey wool socks" взимку; "a yellow t-shirt with a small sun, green shorts, white sneakers" влітку).
- "outerwear" — АНГЛІЙСЬКОЮ верхній одяг, який дитина вдягає лише надворі в холод (наприклад: "a red winter jacket, a knitted blue hat, mittens and brown boots"), або "" якщо він не потрібен. Удома й у приміщеннях дитина без нього — як у житті. Так само для людей у "cast": у "look" — звичайний одяг, а потім "outdoors in the cold: …" — їхній верхній одяг. Якщо в тексті згадано одяг чи аксесуар дитини (шарфик, штанці, чобітки, кишеня), він має бути тут з першої сторінки. Звичайний одяг — лише тут, у сценах його не описуй; піжама перед сном — у сцені.
- "cast" — «паспорт» КОЖНОГО героя й ПРЕДМЕТА, крім самої дитини, який з'являється більш ніж на одній сторінці (перевір кожну сторінку: і ті, що з'являються лише в кінці — знахідка, подарунок, загублена річ, ягідка; наприклад, дзвіночок на 2-й і 10–11-й сторінках — теж у "cast") (друг, тварина, іграшка, машинка, м'ячики, чарівна річ…), а також місце, куди герої повертаються (дім, острів, галявина): "name" — ім'я як у тексті, "en" — англійською й ЛАТИНИЦЕЮ вид + ім'я для художника (наприклад, "dolphin Splesk", "boat Viterets", "the Great Pearl Shell"), "look" — АНГЛІЙСЬКОЮ точний вигляд: вид істоти, розмір, кольори, прикмети, одяг чи аксесуари, а для речей — УСІ візерунки й знаки на них або прямо "plain, no pattern" (наприклад: "a small purple octopus with pink spots and big round eyes", "a plain white sail with no emblem"). Обов'язково вкажи РОЗМІР відносно дитини і повтори його в кожному описі сцени з цим героєм (наприклад: "palm-sized", "reaches the child's knee", "a real garbage truck about twice as tall as the child"; у сцені — "palm-sized crab Lolo"), і він не змінюється протягом казки. Якщо предмет чи механізм за сюжетом рухається або змінюється (піднімається, росте, обертається, відкривається), опиши в "look", як він влаштований і як виглядає ця зміна (наприклад: "a tall stone column with a round rotating stone plate on top that rises higher with every mistake"), а в розкадровці кожної сторінки з ним — його новий стан порівняно з попередньою сторінкою ("the plate has risen above the child's head, the bunny now out of reach"). Чарівні механізми — прості й наочні, щоб дитина побачила їхню дію на малюнку. Рідні дитини схожі на неї: близнюк — "the child's identical twin: the same face, skin tone, hair colour and hairstyle as the child", і різниться лише одягом; брати, сестри, батьки, бабусі й дідусі — "the same skin tone as the child" (волосся й риси можуть відрізнятися), бо дитина в книжці може мати будь-яку зовнішність. "body" — АНГЛІЙСЬКОЮ точна будова саме цього героя чи предмета з числами, щоб художник не помилився: людина — "a person: two arms, two legs, five fingers on each hand, two eyes, one mouth"; кіт — "a cat: four legs with paws, one tail, two ears, two eyes"; пташка — "a bird: two wings, two thin legs, one beak, two eyes"; плюшевий заєць — "a plush toy: two short arms, two short legs, two long ears, two button eyes"; риба — "a fish: fins and a tail, no legs"; предмет без обличчя — "an object, no face"; машинка з обличчям — "a toy truck with four wheels; headlights as two eyes and one smiling grille". Для груп предметів вкажи точну кількість (не більше 4) і колір кожного (наприклад: "exactly three rubber balls: one red, one green, one blue"). В описах ілюстрацій ("illustration") називай цих героїв точно як у "en", лише латиницею й без лапок (кирилиця й лапки в описі — художник впише їх у малюнок), а не загальними словами на кшталт «тваринка» чи «друг».
- Назва — коротка, з іменем дитини. Присвята — одне тепле речення до дитини; якщо батьки дали своє звернення, використай його дослівно.`;

function brief(req: StoryRequest) {
  const theme = getTheme(req.theme);
  const o = describeOptions(req);
  const others = (req.characters ?? [])
    .filter((c) => c.name.trim())
    .map((c) => {
      const kind = c.type === "pet" ? "тварина" : c.type === "object" ? "іграшка чи предмет" : "людина";
      const extra = [c.age ? `${c.age} р.` : null, c.hobbies ? `захоплення: ${c.hobbies}` : null, c.food ? `улюблена їжа: ${c.food}` : null]
        .filter(Boolean)
        .join(", ");
      return `  • ${c.name} (${[c.relation, kind].filter(Boolean).join(", ")}${extra ? "; " + extra : ""})`;
    });
  return [
    `Ім'я дитини: ${req.childName}`,
    `Стать: ${req.gender === "boy" ? "хлопчик" : "дівчинка"}`,
    `Вік: ${req.age}`,
    o.topic ? `Тема казки: ${o.category} — ${o.topic}` : `Тема: ${theme.label} — ${theme.blurb}`,
    o.moral ? `Мораль, цінність казки: ${o.moral}` : `Риса характеру, яка допомагає в пригоді: ${req.trait}`,
    req.hobbies ? `Захоплення дитини (вплети в сюжет): ${req.hobbies}` : null,
    req.food ? `Улюблена їжа дитини (можна згадати): ${req.food}` : null,
    others.length ? `Інші герої казки (усі мають з'явитися й діяти):\n${others.join("\n")}` : null,
    !others.length && req.friend ? `Найкращий друг або улюбленець, який може з'явитися в казці: ${req.friend}` : null,
    req.dedicationFrom ? `Казку дарує: ${req.dedicationFrom}${req.dedicationRelation ? ` (${req.dedicationRelation})` : ""}` : null,
    req.occasion ? `Привід: ${req.occasion}` : null,
    req.teach ? `Чого батьки хочуть навчити дитину цією казкою: ${req.teach}` : null,
    req.message ? `Звернення батьків для присвяти: ${req.message}` : null,
    req.wish
      ? `Побажання батьків до сюжету (побудуй казку навколо цього, якщо це безпечно й доречно для дитини; інакше м'яко обійди): ${req.wish}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export type AiProvider = "claude" | "gemini";

export function aiProvider(): AiProvider | null {
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const wanted = process.env.AI_PROVIDER;
  if (wanted === "gemini" && hasGemini) return "gemini";
  if (wanted === "claude" && hasClaude) return "claude";
  if (hasClaude) return "claude";
  if (hasGemini) return "gemini";
  return null;
}

export function hasAiCredentials(): boolean {
  return aiProvider() !== null;
}

export async function aiStory(req: StoryRequest): Promise<AiStory> {
  const provider = aiProvider();
  const story = provider === "gemini" ? await geminiStory(req) : provider === "claude" ? await claudeStory(req) : null;
  if (!story) throw new Error("Немає ключа для ШІ");
  return completeCast(story);
}

const MissingCastSchema = z.object({
  missing: z.array(z.object({ name: z.string(), en: z.string(), look: z.string(), body: z.string() })).max(4),
  pageFixes: z.array(z.object({ page: z.number().int(), add: z.string() })).max(12),
  /** Остання сторінка без повчання: нове останнє речення (українською) або "" якщо все гаразд. */
  endingFix: z.string(),
});

/**
 * Автор часто не записує в паспорти речі, що з'являються лише наприкінці (кермо, дзвіночок),
 * і художник малює їх щоразу інакше. Дешева модель (~0,1 Kč) читає розкадровку й дописує пропущене.
 */
async function completeCast(story: AiStory): Promise<AiStory> {
  if (!process.env.GEMINI_API_KEY) return story;
  const known = (story.cast ?? []).map((c) => `${c.name} / ${c.en ?? ""}`).join("; ");
  const board = story.pages.map((p, i) => `Page ${i + 1}: ${p.text}\n${p.illustration}`).join("\n\n");
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const res = await ai.models.generateContent({
      model: geminiTextModels()[0],
      contents: `Below is a children's picture book: page texts (Ukrainian) and storyboard notes for the illustrator.
Already described recurring characters and objects: ${known || "none"}.
Find every OTHER character or object, besides the main child, that appears in the pictures on two or more pages (for example a found treasure, a gift, a steering wheel, a bell, a berry), INCLUDING big props, buildings and landmarks that the story comes back to (a sundial, a stone arch, a tree house, a well) — describe their exact design so they look the same on every page. For each give: "name" — its Ukrainian name as in the text, "en" — a short English name in Latin letters used in the storyboard, "look" — an exact English description with size relative to the child, colours, material and markings (or "plain, no pattern"), consistent with the text; "body" — its exact body plan with numbers, as for the other characters (an object: "an object, no face"). Also compare every page text with its storyboard note: if the text says someone holds, uses, gives or waves something (a lantern, a gift, a key) or does a visible action, or wears something the text names (pyjamas, a crown, a costume), that the "In the picture"/"Action" lines miss, add a "pageFixes" item: "page" — page number, "add" — a short English phrase naming ONLY the missing object and where it is, with the exact thing the text names (a candle stays a candle), attached to a character already in the list without listing that character again (for example "a glowing lantern in grandma Hanna's raised hand"). Also track WHERE every recurring object is on every page: it stays where the story put it until the text moves it (a star that landed in a birdhouse stays in the birdhouse until something knocks it out); if a storyboard note puts it somewhere else or leaves out its holder, add a fix that names the correct place (for example "the glowing Christmas Star still inside the snowy tree birdhouse high on the maple"). Also add a fix when the storyboard names a different thing than the text (the text says a candle, the note says a lantern): "add" then says "a lit candle in father Andrii's hand instead of the lantern". Finally check the LAST sentence of page 12: if it states a moral or lesson (for example "…нагадуючи, що терпіння й праця долають будь-які перепони", "Доброта завжди…", "Вона знала: якщо…"), write "endingFix" — a new last sentence in natural Ukrainian that ends the story with a calm, warm action or image instead of the lesson, same characters, same grammatical gender, similar length; otherwise "". Return {"missing": [], "pageFixes": [], "endingFix": ""} if nothing needs fixing.

${board}`,
      config: { responseMimeType: "application/json", responseJsonSchema: z.toJSONSchema(MissingCastSchema), temperature: 0.2 },
    });
    console.log(`[usage] ${JSON.stringify({ what: "cast-check", model: res.modelVersion, usage: res.usageMetadata })}`);
    const parsed = MissingCastSchema.safeParse(JSON.parse(res.text ?? "{}"));
    if (!parsed.success) return story;
    const have = new Set((story.cast ?? []).map((c) => c.name.toLowerCase()));
    const added = parsed.data.missing.filter((c) => !have.has(c.name.toLowerCase()));
    const pages = story.pages.map((p, i) => {
      const adds = parsed.data.pageFixes.filter((f) => f.page === i + 1).map((f) => f.add.trim()).filter(Boolean);
      if (!adds.length || !p.illustration) return p;
      // Дописуємо в рядок «In the picture», бо художник малює саме цей список.
      const line = /^(\s*In the picture:.*)$/im;
      const illustration = line.test(p.illustration)
        ? p.illustration.replace(line, (m) => `${m.replace(/[.\s]+$/, "")}, ${adds.join(", ")}`)
        : `${p.illustration}\nIn the picture also: ${adds.join(", ")}`;
      return { ...p, illustration };
    });
    const ending = parsed.data.endingFix.trim();
    const last = pages.length - 1;
    if (ending && last >= 0) {
      // Замінюємо лише останнє речення останньої сторінки.
      const text = pages[last].text.trim();
      const cut = Math.max(text.lastIndexOf(". ", text.length - 2), text.lastIndexOf("! ", text.length - 2), text.lastIndexOf("? ", text.length - 2));
      pages[last] = { ...pages[last], text: cut > 0 ? `${text.slice(0, cut + 1)} ${ending}` : text };
    }
    return { ...story, pages, cast: [...(story.cast ?? []), ...added].slice(0, 8) };
  } catch (err) {
    console.error("cast-check:", String(err).slice(0, 200));
    return story;
  }
}

function validate(story: AiStory | null | undefined): AiStory {
  if (!story || !Array.isArray(story.pages) || story.pages.length === 0) {
    throw new Error("Не вдалося розібрати відповідь моделі");
  }
  return story;
}

async function claudeStory(req: StoryRequest): Promise<AiStory> {
  const client = new Anthropic();
  const response = await client.beta.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: betaZodOutputFormat(StorySchema),
    },
    system: SYSTEM,
    messages: [{ role: "user", content: brief(req) }],
  });
  console.log(`[usage] ${JSON.stringify({ what: "story", model: response.model, usage: response.usage })}`);
  if (response.stop_reason === "refusal") {
    throw new Error("Модель відмовилася писати цю казку");
  }
  return validate(response.parsed_output);
}

async function geminiStory(req: StoryRequest): Promise<AiStory> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // Безкоштовні моделі Gemini часто перевантажені (503) або впираються в ліміт (429).
  // Тоді пробуємо ще раз, а потім переходимо на запасну, легшу модель.
  const models = geminiTextModels();
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: brief(req),
          config: {
            systemInstruction: SYSTEM,
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(StorySchema),
            temperature: 0.9,
          },
        });
        console.log(`[usage] ${JSON.stringify({ what: "story", model: response.modelVersion ?? model, usage: response.usageMetadata })}`);
        const raw = response.text;
        if (!raw) throw new Error("Gemini повернув порожню відповідь");
        const parsed = StorySchema.safeParse(JSON.parse(raw));
        if (!parsed.success) throw new Error("Gemini повернув казку в неправильному форматі");
        return validate(parsed.data);
      } catch (err) {
        lastError = err;
        console.error(`Gemini ${model}, спроба ${attempt + 1}:`, String(err).slice(0, 300));
        if (!isBusy(err)) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }
  throw lastError;
}

/** Основна модель (GEMINI_TEXT_MODEL) і запасні, через кому в GEMINI_FALLBACK_MODELS. */
export function geminiTextModels() {
  const main = process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest";
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || "gemini-flash-lite-latest")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([main, ...fallbacks])];
}

function isBusy(err: unknown) {
  return /\b(503|429|500)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(String(err));
}
