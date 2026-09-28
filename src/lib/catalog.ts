// Каталог конструктора книжки: вік → розділ → підтема → мораль → стиль → шрифт.
// Поле `en` — англійська назва для запитів до ШІ (тексти й ілюстрації).
// Поле `icon` — опис 3D-іконки для генерації картинки-заглушки (див. docs/zaglushky.md).

export type AgeGroupId = "0-2" | "3-5" | "6-9" | "10+";

export const AGE_GROUPS: { id: AgeGroupId; label: string; about: string; icon: string; minAge: number; maxAge: number }[] = [
  { id: "0-2", label: "0–2 роки", about: "Короткі речення, повтори й перші слова", icon: "a cute baby in a onesie sitting with a rattle", minAge: 0, maxAge: 2 },
  { id: "3-5", label: "3–5 років", about: "Пригоди, звірята й багато фантазії", icon: "a happy preschool child holding a picture book", minAge: 3, maxAge: 5 },
  { id: "6-9", label: "6–9 років", about: "Довші історії для першого самостійного читання", icon: "a school child with a backpack reading a book", minAge: 6, maxAge: 9 },
  { id: "10+", label: "10+ років", about: "Захопливий сюжет, гумор і справжні виклики", icon: "a pre-teen with headphones reading an adventure novel", minAge: 10, maxAge: 16 },
];

export type Subtopic = { id: string; label: string; en: string; icon: string };
export type Category = { id: string; label: string; en: string; icon: string; about: string; topics: Subtopic[] };

const t = (id: string, label: string, en: string, icon = en): Subtopic => ({ id, label, en, icon });

export const CATEGORIES: Category[] = [
  {
    id: "kazky",
    label: "Казки",
    en: "fairy tales",
    icon: "an open glowing storybook with a tiny castle popping out",
    about: "Принцеси, лицарі, феї та чарівні ліси",
    topics: [
      t("pryntsesy", "Принцеси й принци", "princes and princesses", "a small golden crown with jewels"),
      t("lytsari", "Лицарі й дракони", "knights and dragons", "a friendly green dragon next to a knight helmet"),
      t("charivnyi-lis", "Чарівний ліс", "an enchanted forest", "a magical glowing tree with mushrooms"),
      t("fei", "Феї й ельфи", "fairies and elves", "a tiny fairy with sparkling wings"),
      t("yedynorohy", "Єдинороги", "unicorns", "a cute pastel unicorn with a rainbow mane"),
      t("rusalky", "Русалки", "mermaids", "a friendly mermaid tail with a seashell"),
      t("veletni", "Велетні", "gentle giants", "a big friendly giant boot next to a tiny house"),
      t("hnomy", "Гноми", "garden gnomes", "a cheerful gnome with a red hat"),
      t("charivna-shkola", "Чарівна школа", "a school of magic", "a wizard hat on top of spell books"),
      t("chariviyky", "Чарівники й відьмочки", "wizards and little witches", "a magic wand with stars and a cauldron"),
      t("kazka-na-nich", "Казка на ніч", "a calm bedtime story", "a crescent moon with a sleeping cloud"),
    ],
  },
  {
    id: "pryhody",
    label: "Пригоди",
    en: "adventure",
    icon: "a treasure map with a compass",
    about: "Динозаври, пірати, пожежники й таємні місії",
    topics: [
      t("smittievoz", "Сміттєвоз", "a garbage truck adventure", "a green recycling garbage truck"),
      t("budivelna-tekhnika", "Будівельна техніка", "construction machines", "a yellow excavator"),
      t("litak", "Літак", "an airplane adventure", "a small propeller airplane"),
      t("perehony", "Перегони", "car racing", "a red race car with a child driver"),
      t("pozhezhnyky", "Пожежники", "firefighters", "a red fire truck with a ladder"),
      t("politsiia", "Поліція", "police helpers", "a friendly police car"),
      t("dynozavry", "Динозаври", "dinosaurs", "a cute green t-rex"),
      t("piraty", "Пірати", "pirates", "a wooden pirate ship"),
      t("superheroi", "Супергерой", "a superhero", "a child superhero with a cape"),
      t("kempinh", "Кемпінг", "camping", "a tent with a campfire"),
      t("podorozhi", "Подорожі", "travelling the world", "a travel backpack with stickers"),
      t("skarb", "Пошук скарбу", "a treasure hunt", "an open treasure chest with gold coins"),
      t("taiemna-misiia", "Таємна місія", "a secret mission", "a detective hat with sunglasses"),
      t("budynok-pryvydiv", "Будинок з привидами", "a friendly haunted house", "a cute little haunted house with a smiling ghost"),
      t("podorozh-u-chasi", "Подорож у часі", "time travel", "a magical pocket watch with sparkles"),
    ],
  },
  {
    id: "zaniattia",
    label: "Заняття",
    en: "activities",
    icon: "a paint palette with brushes",
    about: "Спорт, танці, кухня, зоопарк і цирк",
    topics: [
      t("sport", "Спорт", "sports", "a football and a medal"),
      t("tantsi", "Танці", "dancing", "pink ballet shoes"),
      t("muzyka", "Музика", "making music", "a small drum and a trumpet"),
      t("maliuvannia", "Малювання", "painting", "a paint palette with brushes"),
      t("kukhnia", "Кухня й випічка", "cooking and baking", "a chef hat with a rolling pin and cookies"),
      t("sadivnytstvo", "Садівництво", "gardening", "a watering can with sprouting flowers"),
      t("zoopark", "Зоопарк", "a visit to the zoo", "a giraffe peeking over a zoo sign"),
      t("park-rozvah", "Парк розваг", "an amusement park", "a colourful carousel"),
      t("tsyrk", "Цирк", "the circus", "a circus tent with flags"),
      t("biblioteka", "Бібліотека", "the library", "a stack of books with a reading lamp"),
      t("likar", "У лікаря", "a visit to the doctor", "a stethoscope and a teddy bear"),
      t("stomatoloh", "У стоматолога", "a visit to the dentist", "a smiling tooth with a toothbrush"),
      t("budynochok-na-derevi", "Будиночок на дереві", "building a treehouse", "a wooden treehouse"),
      t("hry-nadvori", "Ігри надворі", "playing outside", "a kite and a skipping rope"),
      t("potiah", "Потяг", "a train journey", "a small steam train"),
      t("perevdiahannia", "Перевдягання", "dress-up play", "a costume trunk with hats"),
      t("pliazh", "На пляжі", "a day at the beach", "a sand castle with a bucket and a starfish"),
      t("ferma", "На фермі", "a day on a farm", "a red barn with a little cow and chicks"),
      t("turbota-tvaryny", "Турбота про тварин", "caring for animals", "a child's hands holding a bowl for a kitten and a puppy"),
      t("tvorchist", "Творчість і рукоділля", "arts and crafts", "scissors, coloured paper and a glue stick making a paper crown"),
    ],
  },
  {
    id: "svity",
    label: "Світи",
    en: "worlds",
    icon: "a small globe with a rocket orbiting it",
    about: "Космос, джунглі, підводний світ і козацька Січ",
    topics: [
      t("kosmos", "Космос", "outer space", "a rocket flying around a planet"),
      t("dzhunhli", "Джунглі", "the jungle", "a monkey hanging from a jungle vine"),
      t("savana", "Савана", "the savanna", "a lion cub under an acacia tree"),
      t("pivnichnyi-polius", "Північний полюс", "the North Pole", "a polar bear cub on an ice floe"),
      t("pidvodnyi-svit", "Підводний світ", "the underwater world", "a turtle with coral and fish"),
      t("kraina-solodoshchiv", "Країна солодощів", "a land of sweets", "a candy house with lollipops"),
      t("dykyi-zakhid", "Дикий Захід", "the Wild West", "a cowboy hat and a cactus"),
      t("yehypet", "Стародавній Єгипет", "ancient Egypt", "a small pyramid with a camel"),
      t("hretsiia", "Стародавня Греція", "ancient Greece", "a greek column with an olive branch"),
      t("kamianyi-vik", "Кам'яний вік", "the stone age", "a cave with a campfire and a mammoth"),
      t("vikinhy", "Вікінги", "vikings", "a viking ship"),
      t("seredniovichchia", "Середньовіччя", "the middle ages", "a small medieval castle"),
      t("maibutnie", "Світ майбутнього", "the world of the future", "a friendly robot"),
      t("tysiacha-nochei", "Тисяча й одна ніч", "One Thousand and One Nights", "a flying carpet with an oil lamp"),
      t("kozatska-sich", "Козацька Січ", "a Ukrainian Cossack camp (Zaporizhian Sich)", "a Cossack hat (kuchma) with a bandura"),
      t("ukrainske-selo", "Українське село", "a Ukrainian village farm", "a white Ukrainian hut with sunflowers"),
    ],
  },
  {
    id: "sviata",
    label: "Свята",
    en: "holidays",
    icon: "a wrapped gift with a bow",
    about: "День народження, Миколай, Різдво, Великдень",
    topics: [
      t("den-narodzhennia", "День народження", "a birthday", "a birthday cake with candles"),
      t("mykolai", "Святий Миколай", "Saint Nicholas Day", "a pair of shoes with sweets and a little gift"),
      t("rizdvo", "Різдво", "Christmas", "a decorated Christmas tree with a star"),
      t("novyi-rik", "Новий рік", "New Year", "fireworks over a clock"),
      t("velykden", "Великдень", "Easter", "painted Ukrainian pysanky eggs in a basket"),
      t("den-materi", "День матері", "Mother's Day", "a bouquet of tulips with a heart"),
      t("den-batka", "День батька", "Father's Day", "a toolbox with a heart"),
      t("den-ditei", "День захисту дітей", "Children's Day", "balloons and a kite"),
      t("den-babusi-didusia", "День бабусі й дідуся", "Grandparents Day", "a rocking chair with knitting and a pipe"),
      t("imenyny", "Іменини", "a name day", "a gift with a name tag"),
      t("pershyi-dzvonyk", "Перший дзвоник", "the first day of school", "a school bell with a flower bouquet"),
      t("vypusknyi", "Випускний у садочку", "kindergarten graduation", "a graduation cap on a teddy bear"),
      t("kupala", "Івана Купала", "the Ukrainian midsummer festival Ivana Kupala", "a floral wreath floating on water with a candle"),
      t("valentyn", "День святого Валентина", "Valentine's Day", "a heart-shaped balloon"),
      t("helovin", "Гелловін", "Halloween", "a smiling pumpkin lantern"),
      t("karnaval", "Карнавал", "a costume carnival", "a colourful carnival mask with confetti"),
      t("den-nezalezhnosti", "День Незалежності", "Ukrainian Independence Day", "a blue and yellow Ukrainian flag with a sunflower"),
      t("den-vyshyvanky", "День вишиванки", "Ukrainian Vyshyvanka Day (embroidered shirt day)", "a small white embroidered Ukrainian shirt with red and black patterns"),
    ],
  },
  {
    id: "rodyna",
    label: "Родина",
    en: "family",
    icon: "a small house with a heart on the roof",
    about: "Братик чи сестричка, переїзд, новий улюбленець",
    topics: [
      t("bratyk", "У мене буде братик", "becoming a big sibling to a baby brother", "a baby bottle with a blue ribbon"),
      t("sestrychka", "У мене буде сестричка", "becoming a big sibling to a baby sister", "a baby bottle with a pink ribbon"),
      t("maliatko", "Нове малятко", "a new baby in the family", "a baby cradle with a star mobile"),
      t("uliublenets", "Новий улюбленець", "a new pet", "a puppy in a basket"),
      t("pereizd", "Переїзд", "moving house", "moving boxes with a toy on top"),
      t("vesillia", "Весілля", "a family wedding", "wedding rings with flowers"),
      t("nochivlia", "Ночівля в гостях", "a sleepover", "a sleeping bag with a pillow and a torch"),
      t("vidpustka", "Відпустка", "a family holiday", "a suitcase with a beach ball"),
      t("babusia-didus", "У бабусі й дідуся", "visiting grandparents", "a pie on a windowsill of a cosy house"),
      t("rozluchennia", "Коли батьки живуть окремо", "parents living apart, both loving the child", "two houses connected by a rainbow"),
      t("zmishana-rodyna", "Велика змішана родина", "a blended family", "a family tree with many hearts"),
      t("proshchannia", "Прощання", "saying goodbye and remembering someone dear", "a floating balloon with a star"),
    ],
  },
  {
    id: "navchalni",
    label: "Навчальні",
    en: "educational",
    icon: "wooden alphabet blocks",
    about: "Абетка, лічба, горщик, чищення зубів",
    topics: [
      t("abetka", "Українська абетка", "the Ukrainian alphabet", "wooden blocks with Ukrainian letters"),
      t("lichba", "Лічба", "learning to count", "wooden number blocks 1 2 3"),
      t("pershi-slova", "Перші слова", "first words", "a speech bubble with a heart"),
      t("kolory-formy", "Кольори й форми", "colours and shapes", "colourful wooden shapes"),
      t("pory-roku", "Пори року й погода", "seasons and weather", "a sun, a cloud and a snowflake"),
      t("chastyny-tila", "Частини тіла", "parts of the body", "a teddy bear pointing to its nose"),
      t("horshchyk", "Горщик", "potty training", "a cute potty with a star sticker"),
      t("pustushka", "Прощання з пустушкою", "giving up the dummy", "a pacifier waving goodbye"),
      t("chyshchennia-zubiv", "Чищення зубів", "brushing teeth", "a toothbrush with foam and a smiling tooth"),
      t("velosyped", "Їзда на велосипеді", "learning to ride a bike", "a small bicycle with training wheels"),
      t("shnurky", "Зав'язування шнурків", "tying shoelaces", "a sneaker with a bow"),
      t("hodynnyk", "Годинник і час", "telling the time", "a friendly alarm clock"),
      t("prybyrannia", "Прибирання", "tidying up", "a toy box with a broom"),
      t("kyshenkovi", "Кишенькові гроші", "pocket money and saving", "a piggy bank with coins"),
      t("kharchuvannia", "Корисна їжа", "healthy eating", "a plate with vegetables smiling"),
      t("pershi-kroky", "Перші кроки", "first steps", "baby shoes"),
      t("palchyk", "Прощання зі смоктанням пальчика", "stopping thumb sucking", "a small hand giving a thumbs-up with a star"),
    ],
  },
  {
    id: "pochuttia",
    label: "Почуття",
    en: "feelings",
    icon: "a smiling heart with little arms",
    about: "Страх темряви, гнів, сором'язливість, впевненість",
    topics: [
      t("strakh-temriavy", "Страх темряви", "being afraid of the dark", "a night light shaped like a moon"),
      t("sorom-iazlyvist", "Сором'язливість", "shyness", "a turtle peeking out of its shell"),
      t("hniv", "Гнів", "dealing with anger", "a small grumpy cloud turning into a sun"),
      t("revnoshchi", "Ревнощі", "jealousy", "two teddy bears sharing a heart"),
      t("tuha", "Туга за домом", "missing home", "a small house in a snow globe"),
      t("vpevnenist", "Впевненість у собі", "self-confidence", "a child standing on a small podium with a star"),
      t("buling", "Булінг", "standing up to bullying", "two hands making a heart"),
      t("vplyv-druziv", "Тиск друзів", "peer pressure", "a compass pointing to a heart"),
      t("nevpevnenist", "Невпевненість", "insecurity", "a small bird learning to fly"),
      t("emotsii", "Керування емоціями", "managing emotions", "a rainbow of emotion faces"),
      t("hordist", "Гордість за себе", "being proud of yourself", "a golden medal with a smile"),
      t("smishni", "Смішні історії", "funny stories", "a laughing face with confetti"),
      t("mriia", "Мрії на ніч", "dreamy bedtime stories", "a cloud bed with stars"),
    ],
  },
];

export const MORALS: { id: string; label: string; en: string; icon: string }[] = [
  { id: "druzhba", label: "Дружба", en: "friendship", icon: "two children holding hands" },
  { id: "smilyvist", label: "Сміливість", en: "courage", icon: "a small lion cub with a brave face" },
  { id: "pryroda", label: "Турбота про природу", en: "caring for nature", icon: "hands holding a sprouting plant" },
  { id: "liubov", label: "Любов", en: "love", icon: "a big red heart" },
  { id: "napolehlyvist", label: "Наполегливість", en: "perseverance", icon: "a snail reaching a mountain flag" },
  { id: "dilytysia", label: "Вміння ділитися", en: "sharing", icon: "a cookie broken in two halves" },
  { id: "chesnist", label: "Чесність", en: "honesty", icon: "a shining star with a smile" },
  { id: "povaha", label: "Повага", en: "respect", icon: "two animals bowing politely" },
];

// Стилі ілюстрацій. `prompt` — як описати стиль художнику-ШІ.
// `sample` — однакова сцена в кожному стилі для картки вибору.
const SAMPLE_SCENE = "a smiling girl showing her drawing of a tiger to her mother on a sunny meadow";
export const ILLUSTRATION_STYLES: { id: string; label: string; prompt: string; sample: string }[] = [
  { id: "3d", label: "3D-анімація", prompt: "3D animated movie style, soft lighting, rounded cute characters, Pixar-like", sample: SAMPLE_SCENE },
  { id: "akvarel", label: "Акварель", prompt: "soft watercolor children's book illustration, gentle washes, paper texture", sample: SAMPLE_SCENE },
  { id: "heometriia", label: "Геометричний", prompt: "flat geometric vector illustration, simple shapes, bold clean colours", sample: SAMPLE_SCENE },
  { id: "plastylin", label: "Пластилін", prompt: "claymation style, handmade plasticine characters, stop-motion look", sample: SAMPLE_SCENE },
  { id: "naklieiky", label: "Наліпки", prompt: "sticker art style, thick white outlines, glossy cartoon stickers", sample: SAMPLE_SCENE },
  { id: "komiks", label: "Комікс", prompt: "colourful comic book style, bold ink outlines, halftone shading", sample: SAMPLE_SCENE },
  { id: "huash", label: "Гуаш", prompt: "gouache painting, rich matte colours, visible brush strokes", sample: SAMPLE_SCENE },
  { id: "anime", label: "М'яке аніме", prompt: "soft anime style inspired by gentle hand-drawn animated films, pastel skies", sample: SAMPLE_SCENE },
  { id: "kubyky", label: "Кубики", prompt: "blocky voxel game world style, cube-shaped characters and landscape", sample: SAMPLE_SCENE },
  { id: "kolazh", label: "Колаж", prompt: "paper collage illustration, cut paper textures and layered shapes", sample: SAMPLE_SCENE },
];

// Шрифти книжки: назва варіанту → шрифт Google Fonts з кирилицею.
export const BOOK_FONTS: { id: string; label: string; family: string }[] = [
  { id: "kazkova", label: "Казкова книжка", family: "Alegreya" },
  { id: "pisok", label: "М'який пісок", family: "Comfortaa" },
  { id: "bulbashky", label: "Бульбашки", family: "Rubik Bubbles" },
  { id: "tsukerka", label: "Цукерковий сон", family: "Pacifico" },
  { id: "neon", label: "Неонова пригода", family: "Russo One" },
  { id: "zavytky", label: "Веселі завитки", family: "Caveat" },
  { id: "shkilnyi", label: "Шкільний почерк", family: "Neucha" },
  { id: "pryhodnytskyi", label: "Пригодницька книжка", family: "Roboto Slab" },
];

export const CHARACTER_TYPES = [
  { id: "person", label: "Людина", icon: "👧" },
  { id: "pet", label: "Тварина", icon: "🐶" },
  { id: "object", label: "Іграшка чи предмет", icon: "🧸" },
] as const;

export function findTopic(topicId: string) {
  for (const c of CATEGORIES) {
    const topic = c.topics.find((x) => x.id === topicId);
    if (topic) return { category: c, topic };
  }
  return null;
}

export const ALL_TOPICS = CATEGORIES.flatMap((c) => c.topics.map((topic) => ({ category: c, topic })));
