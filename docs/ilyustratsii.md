# Ілюстрації до 10 казок — завдання для генерації

Усього: 10 обкладинок + 65 сторінок = 113 картинок (38 сторінок з дитиною — у двох варіантах). Сторінки з дитиною позначені 👧👦 — для них потрібні **два варіанти**: з дівчинкою (`-g`) і з хлопчиком (`-b`). Решта — один файл.

## Як називати й куди класти файли

- Формат: PNG або JPG, **4:3 горизонтально**, бажано 1600×1200.
- Папка: `kids-books/public/illustrations/<назва-сюжету>/`
- Імена: `00-cover.png`, `01-g.png`, `01-b.png`, `02.png` …
- Надішли мені папку — я підключу картинки до сайту.

## Стиль — додавай на початок КОЖНОГО промпту

```
Children's picture book illustration, risograph print style, flat simple shapes, limited palette of fluorescent pink (#FF6FA5), bright blue (#3255E6), sunny yellow (#FFC92E) and green (#1FAA7F) on warm off-white paper, visible print grain, slight colour misregistration, soft friendly faces with dot eyes, no text, no letters, 4:3 landscape.
```

Порада: зроби спершу обкладинку й 1-шу сторінку, підбери стиль, а тоді використовуй ту саму картинку як референс (image reference / style reference), щоб усі сторінки були схожими.

## Герой — однаковий на всіх картинках

- **Дівчинка (`-g`)**: 5 років, кругле личко, темно-сині волосся з двома пухнастими хвостиками-кульками, рожева сукня-трапеція, сині легінси.
  `a 5-year-old girl with a round face, dark blue hair in two puffy pigtail buns, pink A-line dress, blue leggings`
- **Хлопчик (`-b`)**: 5 років, кругле личко, коротке скуйовджене темно-синє волосся, рожева футболка, сині шорти.
  `a 5-year-old boy with a round face, short messy dark blue hair, pink t-shirt, blue shorts`

У промптах нижче замість героя стоїть **[HERO]** — підстав потрібний опис.

---

## 1. «[Ім'я] і зоряний кит» — Космос
Папка: `space-kyt`

**Обкладинка** — `00-cover.png`
Опис: величезний добрий кит пливе серед зірок, на його спині сидить дитина (зі спини, щоб підійшла і для хлопчика, і для дівчинки).
```
A huge gentle glowing whale swimming among stars and colourful planets, a small child seen from behind sitting on its back, night sky, dreamy.
```

**1** 👧👦 — «Жила-була дівчинка на ім'я [Ім'я]. Їй було 5 років, і щовечора вона махала зіркам на добраніч.»
Опис: дитина в піжамі біля вікна махає зіркам.
```
[HERO] in pyjamas standing at a bedroom window at night, waving at the stars, a small bed and toy nearby.
```

**2** — «Одного вечора в шибку постукав зоряний промінчик… розстелив сріблясту драбину аж до неба.»
Опис: маленький промінчик-зірочка з личком біля вікна, від вікна вгору йде срібляста драбина.
```
A tiny smiling star-sprite knocking on a window at night, a shimmering silver ladder rising from the window sill up into the starry sky.
```

**3** 👧👦 — «[Ім'я] полізла угору. Дім став маленьким, як ґудзик, а навколо закружляли планети…»
```
[HERO] climbing a silver ladder high in the sky, a tiny house far below, colourful planets like balls floating around.
```

**4** — «Між зірками плив кит Зорян… "Я загубив Місячну Скриньку"…»
Опис: сумний кит зі світною спиною, з очей — сльозинка.
```
A big sad whale with a softly glowing back floating among stars, one small tear, looking for something lost.
```

**5** — «Скринька зачепилася за хвіст комети, що мчала швидше за вітер.»
```
A fast comet with a long bright tail racing across space, a small glowing moon-shaped box stuck on the comet's tail.
```

**6** 👧👦 — «…стала біля рожевої планети, простягнула руки — і впіймала Скриньку!»
```
[HERO] standing on a small pink planet, arms stretched up, catching a glowing moon-shaped box falling from a comet's tail, joyful.
```

**7** 👧👦 — «Кит подарував крихітну зірочку. Вона світиться щоночі, коли [Ім'я] засинає.»
```
[HERO] asleep in bed, a tiny glowing star on the shelf above, a smiling whale shape visible in the night sky through the window.
```

---

## 2. «[Ім'я] і сумний Місяць» — Космос
Папка: `space-misyats`

**Обкладинка** — `00-cover.png`
```
A big friendly crescent moon with a gentle face, a small paper airplane flying up towards it, starry night.
```

**1** 👧👦 — «[Ім'я] любила дивитися на Місяць… вона була певна, що Місяць усміхається саме їй.»
```
[HERO] sitting on a windowsill hugging knees, looking up at a smiling round moon.
```

**2** — «Та однієї ночі Місяць не усміхався. Він висів тоненьким сумним серпиком…»
```
A thin sad crescent moon with a downturned face over a dark path leading to a small house, no light on the path.
```

**3** 👧👦 — «Вона сіла на великий паперовий літачок і полетіла просто в небо.»
```
[HERO] riding a giant paper airplane flying up into the night sky, stars around.
```

**4** — «"Мене всі бачать лише вночі… мені ніхто не каже, що я гарний".»
```
Close-up of a sad crescent moon face talking, a bright happy sun far away on the other side of the picture.
```

**5** 👧👦 — «…розповіла Місяцю, як він освітлює стежку котам, веде додому кораблі й заглядає у вікна до дітей.»
Опис: дитина на літачку поруч із Місяцем, а навколо маленькі «бульбашки думок»: кіт на стежці, кораблик, віконце.
```
[HERO] on a paper airplane next to the moon, talking, small thought bubbles around showing a cat on a moonlit path, a ship at sea, a child's window.
```

**6** — «Місяць слухав і світлішав — аж поки не став круглим і ясним…»
```
A full round bright moon with a big happy smile lighting up the whole sky and a village below.
```

**7** 👧👦 — «Тепер щоночі Місяць усміхається у вікно, де спить [Ім'я].»
```
[HERO] asleep in bed, a smiling full moon looking in through the window, soft moonlight on the blanket.
```

---

## 3. «[Ім'я] і таємниця лісу» — Чарівний ліс
Папка: `forest-penok`

**Обкладинка** — `00-cover.png`
```
An old mossy tree stump with carved animal footprints in a magical forest, a wise owl with round glasses perched on it.
```

**1** 👧👦 — «[Ім'я] любила загадки більше за цукерки… а в кишені завжди лежала лупа.»
```
[HERO] looking through a big magnifying glass at a ladybug, curious, in a garden.
```

**2** — «На підвіконні сиділа сова в круглих окулярах. "Ліс кличе тебе…"»
```
A wise owl with round glasses sitting on a window sill in the morning, looking inside, forest behind.
```

**3** 👧👦 — «Стежка вилася між дубами… дятел угорі стукав, ніби рахував кроки.»
```
[HERO] walking along a winding forest path between big oaks with the owl flying ahead, a woodpecker on a trunk.
```

**4** — «На пеньку були вирізьблені дивні знаки… звірі забули, як відчинити комору з горіхами.»
```
An old tree stump with strange carved marks (paw prints of hare, hedgehog, squirrel), puzzled forest animals around it.
```

**5** 👧👦 — «…придивилася крізь лупу. "Та це ж сліди! Заєць, їжак, білка…"»
```
[HERO] kneeling by the stump, looking through a magnifying glass at carved paw prints, excited expression.
```

**6** — «Звірі вишикувалися — і пеньок відкрив потаємні дверцята. Горіхів вистачило б на три зими!»
```
A hare, a hedgehog and a squirrel standing in a row, a secret little door open in the tree stump full of nuts.
```

**7** 👧👦 — «Білочка подарувала жолудь у золотій шапочці — на щастя.»
```
A squirrel handing a golden-capped acorn to [HERO] in a sunny forest clearing, animals smiling.
```

---

## 4. «[Ім'я] і загублена пісня» — Чарівний ліс
Папка: `forest-solovei`

**Обкладинка** — `00-cover.png`
```
A small nightingale on a branch with colourful music notes flowing out of a deep forest ravine towards it.
```

**1** 👧👦 — «Щоранку [Ім'я] прокидалася під спів соловейка.»
```
[HERO] waking up and stretching in bed, a nightingale singing on a branch outside the open window, music notes.
```

**2** — «Та одного ранку в лісі стояла тиша. Ні пісні, ні щебету…»
```
A quiet still forest in the morning, leaves gently moving in the wind, no birds, empty branches.
```

**3** 👧👦 — «…знайшла соловейка на гілці. Той відкривав дзьобик, але звуку не було.»
```
[HERO] looking up at a sad nightingale on a branch with its beak open but no sound, worried.
```

**4** — «Шукали під листям, у дуплі, навіть у мурашнику. "Пісні тут не пробігали".»
```
Ants shrugging at an anthill, a nightingale peeking into a tree hollow, leaves lifted up — searching everywhere, funny.
```

**5** 👧👦 — «У глибокому яру живе Луна, яка повторює все, що чує!»
```
[HERO] standing at the edge of a deep forest ravine, hands cupped around mouth, the nightingale on shoulder.
```

**6** — «І Луна відповіла — усією соловейковою піснею!»
```
Colourful music notes pouring out of a deep ravine like a river, echoing between rocks.
```

**7** 👧👦 — «Соловейко відтоді співає щоранку під вікном, де спить [Ім'я].»
```
A happy nightingale singing on a branch by a window, [HERO] smiling in bed, morning sun.
```

---

## 5. «[Ім'я] і мушля, що співає» — Море
Папка: `sea-mushlia`

**Обкладинка** — `00-cover.png`
```
A small sandy island with a palm tree and colourful scallop shells, music notes rising from the shells, blue sea.
```

**1** 👧👦 — «[Ім'я] співала завжди: коли малювала, коли їла кашу і навіть коли чистила зуби.»
```
[HERO] singing happily with arms up in a cosy room, music notes flying around.
```

**2** — «На поріг вибіг крабик у червоній шапці. "На нашому острові замовкли всі мушлі!"»
```
A cute pink crab wearing a small yellow pointed hat standing at a blue front door, waving a claw urgently.
```

**3** 👧👦 — «Вони попливли на човнику з білим вітрилом. Дельфіни стрибали поруч.»
```
[HERO] and the little crab in a small boat with a sail, two dolphins jumping beside, waves.
```

**4** — «На острові було тихо-тихо. Мушлі лежали на піску й мовчали.»
```
A quiet sandy island with a palm tree, silent scallop shells lying on the sand, the crab looking sad.
```

**5** 👧👦 — «…сіла на теплий пісок і заспівала колискову. Одна мушля підхопила, за нею друга…»
```
[HERO] sitting on the sand singing, music notes rising from all the shells around, joyful island.
```

**6** 👧👦 — «Крабик подарував маленьку мушлю. Якщо прикласти її до вуха, чути ту саму колискову.»
```
The crab giving a pink scallop shell to [HERO] on the beach at sunset, stars appearing.
```

---

## 6. «[Ім'я] і маяк, що згас» — Море
Папка: `sea-mayak`

**Обкладинка** — `00-cover.png`
```
A tall striped lighthouse on rocks shining a bright beam over a stormy night sea, a tiny fishing boat with lights.
```

**1** 👧👦 — «[Ім'я] жила біля моря… щовечора махала дідусеві Панасу, доглядачеві маяка.»
```
[HERO] waving from a seaside house, an old bearded lighthouse keeper waving back from a distant lighthouse at dusk.
```

**2** — «Маяк не засвітився. А в морі вже виднілися вогники маленького човника.»
```
A dark unlit lighthouse at night, waves, a tiny fishing boat with small lights far out at sea.
```

**3** 👧👦 — «Схопила ліхтарик і побігла кам'янистою стежкою. Вітер свистів…»
```
[HERO] running along a rocky seaside path with a flashlight, wind blowing hair and jacket, determined.
```

**4** — «Дідусь Панас сидів на сходах — у нього розболілася нога.»
```
An old kind bearded lighthouse keeper sitting on spiral stairs holding his sore leg, pointing upwards.
```

**5** 👧👦 — «Піднялася сто двадцять сходинок і повернула великий вмикач. Спалахнуло світло!»
```
[HERO] at the top of the lighthouse turning a big lever, the huge lamp bursting into bright light.
```

**6** — «Човник щасливо дістався берега. Рибалки назвали свій човен на честь…»
```
Happy fishermen pulling a small boat onto the shore in the lighthouse beam, the lighthouse shining.
```

---

## 7. «[Ім'я] і маленький диплодок» — Динозаври
Папка: `dino-dyplodok`

**Обкладинка** — `00-cover.png`
```
A cute baby diplodocus with a long neck and a big mother diplodocus in a valley of giant ferns at sunset.
```

**1** 👧👦 — «[Ім'я] знала про динозаврів усе…»
```
[HERO] sitting on the floor surrounded by dinosaur books and toy dinosaurs, reading happily.
```

**2** — «За сараєм хтось голосно шморгав носом. Це було справжнє динозавреня!»
```
A small crying baby diplodocus peeking from behind a wooden shed in a backyard, big tears.
```

**3** — «"Я диплодок Дзиґа. Я загубив маму…"»
```
Close-up of the baby diplodocus with sad eyes, a small heart floating above its head.
```

**4** 👧👦 — «Вони пішли крізь папороті до долини, де гуло й тупотіло сто динозаврів.»
```
[HERO] and the baby diplodocus walking through giant ferns toward a noisy valley full of many dinosaurs and steam from hot springs.
```

**5** 👧👦 — «"Давай помовчимо разом"… і почулося знайоме "Дзи-и-иґо!"»
```
[HERO] and the baby diplodocus sitting quietly with eyes closed, listening, a mother's call drawn as a soft wave from far away.
```

**6** 👧👦 — «Мама-диплодок підняла обох собі на шию. Найкрасивіший захід сонця!»
```
A big mother diplodocus with [HERO] and the baby on her long neck, looking at a beautiful sunset over the valley.
```

---

## 8. «[Ім'я] і яйце з сюрпризом» — Динозаври
Папка: `dino-yaitse`

**Обкладинка** — `00-cover.png`
```
A big speckled egg cracking open, a tiny triceratops with three funny horns peeking out.
```

**1** 👧👦 — «[Ім'я] знайшла у траві яйце — велике, як диня, і в рожеві цятки.»
```
[HERO] kneeling in tall grass, amazed, finding a big egg with pink spots.
```

**2** 👧👦 — «Загорнула яйце в теплий шарф і поклала біля грубки.»
```
[HERO] tucking a big spotted egg in a warm scarf next to a cosy stove.
```

**3** 👧👦 — «Щовечора розповідала йому казку — щоб йому не було сумно.»
```
[HERO] sitting by the wrapped egg reading a book aloud in the evening, lamp light.
```

**4** — «"Тук-тук… крак!" Зі шкаралупи визирнуло трицератопсеня.»
```
A baby triceratops with three tiny horns hatching from the egg, shell pieces around, surprised and cute.
```

**5** 👧👦 — «Вони йшли за слідами великих лап до долини з папоротями.»
```
[HERO] and the baby triceratops following giant footprints into a valley of huge ferns.
```

**6** — «Мама-трицератопс так зраділа, що аж затанцювала.»
```
A big mother triceratops dancing with joy, the baby running to her, the ground gently shaking with little dust puffs.
```

**7** 👧👦 — «Трицератопсеня торкнулося ріжком — "ти мій друг назавжди".»
```
The baby triceratops gently touching [HERO]'s hand with its horn, both smiling, warm sunset.
```

---

## 9. «[Ім'я] і дракон-боягуз» — Замок і дракон
Папка: `castle-drakon`

**Обкладинка** — `00-cover.png`
```
A small shy green dragon peeking from a red castle tower at night, lots of stars.
```

**1** 👧👦 — «[Ім'я] ніколи не боялася темряви… ніч — це просто день, який пішов спати.»
```
[HERO] walking calmly in a dark bedroom with a small night light, smiling, stars outside.
```

**2** — «На подушці лежав лист із зеленою печаткою: "Допоможіть! Підпис — Дракон".»
```
A letter with a green wax seal lying on a pillow, a tiny scorch mark on its corner.
```

**3** — «Дорога привела до замку з червоними вежами. На мосту дрімав вартовий-равлик.»
```
A castle with red towers and flags on a hill, a sleepy snail guard with a tiny helmet dozing on the bridge.
```

**4** — «У найвищій вежі тремтів дракон Жаринка. "Я боюся темряви…"»
```
A small green dragon trembling in a tower room, breathing a nervous little flame to light the darkness.
```

**5** 👧👦 — «Взяла дракона за лапу й підвела до вікна. "Давай порахуємо зірки".»
```
[HERO] holding the dragon's paw at a tower window, both pointing at many stars, the dragon calming down.
```

**6** 👧👦 — «Король доручив Жаринці запалювати ліхтарі, а [Ім'я] отримала значок друга драконів.»
```
A festive castle square with lanterns being lit by the happy dragon, a king pinning a badge on [HERO].
```

---

## 10. «[Ім'я] рятує квіткове свято» — Лука і бджілки
Папка: `meadow-khmarka`

**Обкладинка** — `00-cover.png`
```
A blooming meadow full of flowers with a pink blushing cloud floating away and happy bees.
```

**1** 👧👦 — «[Ім'я] любила ходити на луку й рахувати бджілок.»
```
[HERO] in a meadow counting bees on fingers, bees flying around flowers.
```

**2** — «У вікно влетіла бджілка Дзвіночка: "Квіти не розпускаються!"»
```
A small worried bee flying in through an open window, buzzing, closed flower buds visible outside.
```

**3** — «Над лукою висіла сіра хмарка. Вона закрила сонечко.»
```
A grey grumpy cloud hanging over a meadow of closed flower buds, hiding the sun.
```

**4** 👧👦 — «"Чого ти сумуєш?" — "Мені ніхто не каже дякую за дощ".»
```
[HERO] looking up and talking to a grumpy grey cloud with a sad face.
```

**5** 👧👦 — «"Дякую, хмарко!" Хмарка зашарілася, стала рожевою і попливла далі.»
```
[HERO] waving and shouting thanks, the cloud turning pink and blushing, floating away happily.
```

**6** — «Сонце визирнуло, квіти розкрилися, бджоли подарували мед.»
```
Sun shining over a meadow in full bloom, bees carrying a small jar of honey, festive flower celebration.
```
