import type { SceneId } from "@/lib/types";

// Ілюстрації у стилі різографії: кілька плашкових фарб, що накладаються (multiply).
// У режимі розмальовки ті самі фігури стають контурами (див. .coloring у globals.css).

const P = "var(--riso-pink)";
const B = "var(--riso-blue)";
const Y = "var(--riso-yellow)";
const G = "var(--riso-green)";

function Star({ x, y, r = 6 }: { x: number; y: number; r?: number }) {
  const d = `M${x} ${y - r}L${x + r * 0.3} ${y - r * 0.3}L${x + r} ${y}L${x + r * 0.3} ${y + r * 0.3}L${x} ${y + r}L${x - r * 0.3} ${y + r * 0.3}L${x - r} ${y}L${x - r * 0.3} ${y - r * 0.3}Z`;
  return <path d={d} fill={Y} />;
}

function Tree({ x, base, h, color = G }: { x: number; base: number; h: number; color?: string }) {
  return (
    <g>
      <rect x={x - 5} y={base - h * 0.25} width="10" height={h * 0.25} fill={P} />
      <path d={`M${x} ${base - h}L${x + h * 0.32} ${base - h * 0.2}L${x - h * 0.32} ${base - h * 0.2}Z`} fill={color} />
    </g>
  );
}

function House({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="110" height="80" fill={P} />
      <path d={`M${x - 14} ${y + 2}L${x + 55} ${y - 56}L${x + 124} ${y + 2}Z`} fill={B} />
      <rect x={x + 18} y={y + 22} width="28" height="28" fill={Y} />
      <rect x={x + 66} y={y + 34} width="26" height="46" fill={B} />
    </g>
  );
}

function Flower({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${y}V${y + 60}`} stroke={G} strokeWidth="4" fill="none" />
      <circle cx={x - 9} cy={y} r="10" fill={color} />
      <circle cx={x + 9} cy={y} r="10" fill={color} />
      <circle cx={x} cy={y - 9} r="10" fill={color} />
      <circle cx={x} cy={y + 9} r="10" fill={color} />
      <circle cx={x} cy={y} r="6" fill={Y} />
    </g>
  );
}

/* ---------- Персонажі для сюжетних ілюстрацій ---------- */

const INK = "var(--ink)";

/** Дитина: голова, зачіска з хвостиками, сукенка-трапеція. (x, y) — точка між ногами на землі. */
function Child({ x, y, s = 1, singing = false, sitting = false }: { x: number; y: number; s?: number; singing?: boolean; sitting?: boolean }) {
  const bodyH = (sitting ? 34 : 50) * s;
  const top = y - bodyH - (sitting ? 0 : 16 * s);
  const headY = top - 17 * s;
  return (
    <g>
      {!sitting && (
        <>
          <rect x={x - 11 * s} y={y - 18 * s} width={7 * s} height={18 * s} fill={B} />
          <rect x={x + 4 * s} y={y - 18 * s} width={7 * s} height={18 * s} fill={B} />
        </>
      )}
      <path d={`M${x - 12 * s} ${top}H${x + 12 * s}L${x + 26 * s} ${top + bodyH}H${x - 26 * s}Z`} fill={P} />
      <path d={`M${x - 12 * s} ${top + 8 * s}L${x - 30 * s} ${top + (singing ? -6 : 26) * s}`} stroke={P} strokeWidth={7 * s} strokeLinecap="round" fill="none" />
      <path d={`M${x + 12 * s} ${top + 8 * s}L${x + 30 * s} ${top + (singing ? -6 : 26) * s}`} stroke={P} strokeWidth={7 * s} strokeLinecap="round" fill="none" />
      <circle cx={x - 20 * s} cy={headY - 4 * s} r={8 * s} fill={B} />
      <circle cx={x + 20 * s} cy={headY - 4 * s} r={8 * s} fill={B} />
      <circle cx={x} cy={headY} r={17 * s} fill={Y} />
      <path d={`M${x - 17 * s} ${headY - 2 * s}A${17 * s} ${17 * s} 0 0 1 ${x + 17 * s} ${headY - 2 * s}Q${x} ${headY - 10 * s} ${x - 17 * s} ${headY - 2 * s}Z`} fill={B} />
      <circle cx={x - 6 * s} cy={headY + 2 * s} r={2 * s} fill={INK} />
      <circle cx={x + 6 * s} cy={headY + 2 * s} r={2 * s} fill={INK} />
      {singing ? (
        <ellipse cx={x} cy={headY + 9 * s} rx={3.5 * s} ry={4.5 * s} fill={INK} />
      ) : (
        <path d={`M${x - 5 * s} ${headY + 8 * s}Q${x} ${headY + 12 * s} ${x + 5 * s} ${headY + 8 * s}`} stroke={INK} strokeWidth={1.8 * s} fill="none" />
      )}
    </g>
  );
}

/** Музична нотка. */
function Note({ x, y, s = 1, color = B }: { x: number; y: number; s?: number; color?: string }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={7 * s} ry={5 * s} fill={color} transform={`rotate(-20 ${x} ${y})`} />
      <path d={`M${x + 6 * s} ${y - 2 * s}V${y - 30 * s}Q${x + 16 * s} ${y - 24 * s} ${x + 18 * s} ${y - 14 * s}`} stroke={color} strokeWidth={3 * s} fill="none" />
    </g>
  );
}

/** Крабик у шапочці. (x, y) — центр тіла. */
function Crab({ x, y, s = 1, hat = true }: { x: number; y: number; s?: number; hat?: boolean }) {
  const legs = [-1, 1].flatMap((d) =>
    [0, 1, 2].map((i) => (
      <path
        key={`${d}-${i}`}
        d={`M${x + d * 22 * s} ${y + (2 + i * 6) * s}l${d * 16 * s} ${(8 + i * 3) * s}`}
        stroke={P}
        strokeWidth={4 * s}
        strokeLinecap="round"
      />
    )),
  );
  return (
    <g>
      {legs}
      <path d={`M${x - 24 * s} ${y - 6 * s}L${x - 40 * s} ${y - 26 * s}`} stroke={P} strokeWidth={5 * s} strokeLinecap="round" />
      <path d={`M${x + 24 * s} ${y - 6 * s}L${x + 40 * s} ${y - 26 * s}`} stroke={P} strokeWidth={5 * s} strokeLinecap="round" />
      <path d={`M${x - 40 * s} ${y - 26 * s}m-9 0a9 9 0 1 1 18 0l-9 3Z`} fill={P} />
      <path d={`M${x + 40 * s} ${y - 26 * s}m-9 0a9 9 0 1 1 18 0l-9 3Z`} fill={P} />
      <ellipse cx={x} cy={y} rx={28 * s} ry={18 * s} fill={P} />
      {hat && (
        <>
          <path d={`M${x - 20 * s} ${y - 12 * s}L${x - 26 * s} ${y - 40 * s}L${x - 6 * s} ${y - 16 * s}Z`} fill={Y} />
          <circle cx={x - 26 * s} cy={y - 42 * s} r={4 * s} fill={P} />
        </>
      )}
      <path d={`M${x - 8 * s} ${y - 16 * s}V${y - 30 * s}M${x + 8 * s} ${y - 16 * s}V${y - 30 * s}`} stroke={P} strokeWidth={3 * s} />
      <circle cx={x - 8 * s} cy={y - 32 * s} r={5 * s} fill="#fff" />
      <circle cx={x + 8 * s} cy={y - 32 * s} r={5 * s} fill="#fff" />
      <circle cx={x - 8 * s} cy={y - 32 * s} r={2.2 * s} fill={INK} />
      <circle cx={x + 8 * s} cy={y - 32 * s} r={2.2 * s} fill={INK} />
      <path d={`M${x - 8 * s} ${y + 2 * s}Q${x} ${y + 9 * s} ${x + 8 * s} ${y + 2 * s}`} stroke={INK} strokeWidth={2 * s} fill="none" />
    </g>
  );
}

/** Мушля-гребінець. (x, y) — нижня точка. */
function Shell({ x, y, s = 1, color = Y }: { x: number; y: number; s?: number; color?: string }) {
  const r = 26 * s;
  const ribs = [-0.75, -0.4, 0, 0.4, 0.75].map((k) => {
    const a = -Math.PI / 2 + k;
    return (
      <path
        key={k}
        d={`M${x} ${y}L${x + Math.cos(a) * r * 1.15} ${y - 6 * s + Math.sin(a) * r * 1.15}`}
        stroke="var(--paper)"
        strokeWidth={2 * s}
      />
    );
  });
  return (
    <g>
      <path d={`M${x} ${y}L${x - r} ${y - r * 0.8}A${r * 1.05} ${r * 1.05} 0 0 1 ${x + r} ${y - r * 0.8}Z`} fill={color} />
      {ribs}
      <path d={`M${x - 8 * s} ${y + 2 * s}h${16 * s}l-${4 * s} ${6 * s}h-${8 * s}Z`} fill={color} />
    </g>
  );
}

function Dolphin({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <path d="M-40 10Q-10 -34 36 -8Q42 -4 50 -6Q44 2 36 2Q4 -16 -28 16Z" fill={B} />
      <path d="M-2 -20L6 -36L14 -17Z" fill={B} />
      <path d="M-40 10L-54 2L-50 18Z" fill={B} />
      <circle cx="30" cy="-8" r="2.2" fill="#fff" />
    </g>
  );
}

function Island({ cx = 200 }: { cx?: number }) {
  return (
    <>
      <path d="M0 250Q50 238 100 250T200 250T300 250T400 250V300H0Z" fill={B} />
      <path d={`M${cx - 170} 252Q${cx} 170 ${cx + 170} 252Z`} fill={Y} style={{ mixBlendMode: "normal" }} />
      <path d={`M${cx + 90} 222V120`} stroke={P} strokeWidth="8" />
      <path
        d={`M${cx + 90} 120q-40-8-62 20M${cx + 90} 120q40-8 62 20M${cx + 90} 120q-12-38-44-46M${cx + 90} 120q20-38 50-36`}
        stroke={G}
        strokeWidth="10"
        fill="none"
      />
    </>
  );
}

const scenes: Record<SceneId, React.ReactNode> = {
  "sing-home": (
    <>
      <rect x="0" y="236" width="400" height="64" fill={P} fillOpacity="0.35" />
      <rect x="236" y="46" width="120" height="110" fill="#fff" />
      <rect x="236" y="46" width="120" height="110" fill={B} fillOpacity="0.18" />
      <circle cx="318" cy="84" r="20" fill={Y} />
      <path d="M296 46V156M236 101H356" stroke={B} strokeWidth="6" />
      <Child x={130} y={250} s={1.25} singing />
      <Note x={206} y={120} />
      <Note x={60} y={96} s={0.8} color={P} />
      <Note x={228} y={196} s={0.9} color={Y} />
      <Note x={180} y={60} s={0.7} color={P} />
    </>
  ),
  "crab-door": (
    <>
      <rect x="0" y="0" width="400" height="300" fill={Y} fillOpacity="0.25" />
      <rect x="0" y="248" width="400" height="52" fill={P} fillOpacity="0.35" />
      <path d="M60 248V90a70 70 0 0 1 140 0V248Z" fill={B} />
      <circle cx="176" cy="170" r="7" fill={Y} />
      <rect x="40" y="244" width="180" height="10" fill={P} />
      <Crab x={290} y={222} s={1.35} />
      <path d="M340 110q10-16 26-10M352 126q14-6 24 4" stroke={B} strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
  "boat-dolphins": (
    <>
      <circle cx="330" cy="60" r="30" fill={Y} />
      <path d="M0 196Q50 182 100 196T200 196T300 196T400 196V300H0Z" fill={B} />
      <path d="M0 236Q50 222 100 236T200 236T300 236T400 236V300H0Z" fill={B} />
      <path d="M150 188H270L250 214H170Z" fill={P} />
      <path d="M212 184V92L262 176Z" fill={Y} />
      <Child x={178} y={196} s={0.7} sitting />
      <Crab x={238} y={178} s={0.45} />
      <Dolphin x={76} y={170} s={1} />
      <Dolphin x={340} y={184} s={0.8} flip />
      <circle cx="40" cy="186" r="4" fill={B} />
      <circle cx="30" cy="176" r="3" fill={B} />
      <circle cx="376" cy="200" r="3" fill={B} />
    </>
  ),
  "island-silent": (
    <>
      <rect x="0" y="0" width="400" height="300" fill={B} fillOpacity="0.12" />
      <Island />
      <Shell x={110} y={238} s={0.9} color={P} />
      <Shell x={170} y={228} s={1.1} />
      <Shell x={236} y={240} s={0.8} color={P} />
      <Crab x={60} y={250} s={0.5} />
    </>
  ),
  "island-singing": (
    <>
      <circle cx="70" cy="60" r="30" fill={Y} />
      <Island />
      <Shell x={100} y={240} s={0.9} color={P} />
      <Shell x={250} y={238} s={0.9} />
      <Shell x={300} y={246} s={0.7} color={P} />
      <Child x={176} y={236} s={0.95} singing sitting />
      <Note x={104} y={170} s={0.8} color={P} />
      <Note x={140} y={120} s={0.9} />
      <Note x={230} y={110} s={1} color={P} />
      <Note x={262} y={176} s={0.8} />
      <Note x={320} y={200} s={0.7} color={P} />
      <Note x={200} y={70} s={0.7} />
    </>
  ),
  "shell-gift": (
    <>
      <rect x="0" y="0" width="400" height="300" fill={B} fillOpacity="0.3" />
      <circle cx="330" cy="62" r="30" fill={Y} />
      <Star x={60} y={50} />
      <Star x={180} y={34} r={5} />
      <Star x={250} y={90} r={4} />
      <path d="M0 250Q100 236 200 250T400 244V300H0Z" fill={Y} />
      <Child x={130} y={258} s={1.15} />
      <Crab x={290} y={232} s={0.9} hat />
      <Shell x={214} y={214} s={1} color={P} />
      <Note x={230} y={150} s={0.6} />
      <Note x={196} y={128} s={0.5} color={P} />
    </>
  ),

  home: (
    <>
      <circle cx="320" cy="70" r="36" fill={Y} />
      <path d="M0 240Q100 205 200 232T400 222V300H0Z" fill={G} />
      <House x={120} y={160} />
      <Tree x={60} base={250} h={120} />
      <Tree x={330} base={250} h={90} color={B} />
    </>
  ),
  forest: (
    <>
      <circle cx="80" cy="60" r="30" fill={Y} />
      <path d="M0 250Q200 225 400 250V300H0Z" fill={G} />
      <Tree x={70} base={260} h={170} />
      <Tree x={170} base={255} h={210} color={B} />
      <Tree x={275} base={260} h={180} />
      <Tree x={350} base={262} h={130} color={B} />
      <path d="M205 262a22 16 0 0 1 44 0Z" fill={P} />
      <rect x="222" y="262" width="10" height="16" fill={Y} />
    </>
  ),
  sea: (
    <>
      <circle cx="300" cy="80" r="42" fill={Y} />
      <path d="M0 190Q50 175 100 190T200 190T300 190T400 190V300H0Z" fill={B} />
      <path d="M0 230Q50 215 100 230T200 230T300 230T400 230V300H0Z" fill={B} />
      <path d="M110 180H230L210 205H130Z" fill={P} />
      <path d="M168 176V92L222 170Z" fill={Y} />
      <path d="M168 176V110L126 170Z" fill={P} />
      <path d="M300 262q20-18 40 0q-20 18-40 0l-14 -10v20Z" fill={Y} />
    </>
  ),
  space: (
    <>
      <circle cx="120" cy="170" r="70" fill={B} />
      <ellipse cx="120" cy="170" rx="110" ry="22" fill="none" stroke={P} strokeWidth="10" />
      <path d="M318 40A42 42 0 1 0 352 106A34 34 0 1 1 318 40Z" fill={Y} />
      <circle cx="320" cy="230" r="24" fill={P} />
      <Star x={40} y={50} />
      <Star x={230} y={40} r={8} />
      <Star x={250} y={150} r={5} />
      <Star x={370} y={160} />
      <Star x={200} y={270} r={7} />
      <Star x={60} y={270} r={5} />
    </>
  ),
  dino: (
    <>
      <circle cx="330" cy="60" r="30" fill={Y} />
      <path d="M0 250Q120 215 230 245T400 235V300H0Z" fill={G} />
      <path d="M90 230q0-50 60-55h60q30-60 40-110q4-14 18-10q16 4 12 20q-8 60-30 110q30 20 20 45Z" fill={B} />
      <rect x="120" y="222" width="18" height="34" fill={B} />
      <rect x="180" y="222" width="18" height="34" fill={B} />
      <circle cx="274" cy="66" r="3" fill="var(--ink)" />
      <path d="M340 250V150" stroke={P} strokeWidth="8" />
      <path d="M340 150q-40-10-60 20M340 150q40-10 60 20M340 150q-10-40-40-50M340 150q20-40 50-40" stroke={G} strokeWidth="10" fill="none" />
    </>
  ),
  castle: (
    <>
      <path d="M0 250Q200 205 400 250V300H0Z" fill={G} />
      <rect x="130" y="140" width="140" height="110" fill={P} />
      <rect x="100" y="100" width="46" height="150" fill={P} />
      <rect x="254" y="100" width="46" height="150" fill={P} />
      <path d="M92 104L123 50L154 104Z" fill={B} />
      <path d="M246 104L277 50L308 104Z" fill={B} />
      <path d="M123 50V30L143 38L123 44" fill={Y} />
      <path d="M277 50V30L297 38L277 44" fill={Y} />
      <path d="M180 250v-40a20 20 0 0 1 40 0v40Z" fill={B} />
      <rect x="115" y="130" width="16" height="22" fill={Y} />
      <rect x="269" y="130" width="16" height="22" fill={Y} />
    </>
  ),
  night: (
    <>
      <rect x="0" y="0" width="400" height="300" fill={B} fillOpacity="0.35" />
      <circle cx="300" cy="80" r="44" fill={Y} />
      <path d="M0 240Q120 200 220 232T400 215V300H0Z" fill={B} />
      <House x={70} y={170} />
      <Star x={60} y={50} />
      <Star x={160} y={80} r={5} />
      <Star x={210} y={30} r={7} />
      <Star x={370} y={170} r={5} />
    </>
  ),
  meadow: (
    <>
      <circle cx="80" cy="70" r="36" fill={Y} />
      <path d="M0 230Q200 200 400 230V300H0Z" fill={G} />
      <Flower x={90} y={200} color={P} />
      <Flower x={170} y={180} color={B} />
      <Flower x={250} y={205} color={P} />
      <Flower x={330} y={185} color={B} />
      <ellipse cx="240" cy="110" rx="16" ry="11" fill={Y} />
      <ellipse cx="234" cy="100" rx="9" ry="7" fill={B} fillOpacity="0.5" />
      <ellipse cx="300" cy="80" rx="12" ry="8" fill={Y} />
    </>
  ),
};

export default function Scene({ id, className }: { id: SceneId; className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      className={`scene ${className ?? ""}`}
      role="img"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect className="scene-bg" x="0" y="0" width="400" height="300" fill="var(--paper-deep)" />
      <g className="riso">{scenes[id]}</g>
    </svg>
  );
}
