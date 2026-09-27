// Мотиви петриківського розпису в сучасному плоскому стилі:
// квітка з пелюсток-«зерняток», листя-«пір'ячко» і ягідки калини.

const CORAL = "var(--coral)";
const SUN = "var(--sun)";
const MINT = "var(--mint)";
const SKY = "var(--sky)";

/** Пелюстка-«зернятко»: краплина, що звужується до центру. */
function petal(angle: number, len: number, width: number, color: string, key: string) {
  return (
    <path
      key={key}
      d={`M0 0 C ${width} ${-len * 0.35}, ${width * 0.8} ${-len * 0.85}, 0 ${-len} C ${-width * 0.8} ${-len * 0.85}, ${-width} ${-len * 0.35}, 0 0 Z`}
      fill={color}
      transform={`rotate(${angle})`}
    />
  );
}

/** Петриківська квітка. */
export function Kvitka({ size = 64, className }: { size?: number; className?: string }) {
  const outer = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" className={className} aria-hidden="true">
      {outer.map((a) => petal(a, 46, 15, a % 90 === 0 ? CORAL : SUN, `o${a}`))}
      {outer.map((a) => petal(a + 22.5, 30, 9, a % 90 === 0 ? SUN : CORAL, `i${a}`))}
      <circle r="12" fill={SKY} />
      <circle r="5" fill={SUN} />
    </svg>
  );
}

/** Листок-«пір'ячко» з прожилками-мазками. */
function Pero({ x, y, angle, color = MINT, len = 70 }: { x: number; y: number; angle: number; color?: string; len?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path d={`M0 0 C ${len * 0.25} ${-len * 0.2}, ${len * 0.7} ${-len * 0.22}, ${len} 0 C ${len * 0.7} ${len * 0.22}, ${len * 0.25} ${len * 0.2}, 0 0 Z`} fill={color} />
      {[0.25, 0.45, 0.65].map((k) => (
        <path
          key={k}
          d={`M${len * k} 0 q ${len * 0.08} ${-len * 0.1} ${len * 0.16} ${-len * 0.11}`}
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />
      ))}
    </g>
  );
}

/** Гілочка: квітка, два листки й ягідки калини. Для прикрас першого екрана. */
export function Hilochka({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 180" className={className} aria-hidden="true">
      <path d="M20 170 C 70 140, 110 110, 130 70" stroke={MINT} strokeWidth="5" fill="none" strokeLinecap="round" />
      <Pero x={60} y={146} angle={-150} len={62} />
      <Pero x={92} y={118} angle={-20} len={58} color={SKY} />
      {[
        [150, 128],
        [164, 140],
        [146, 146],
        [160, 156],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill={CORAL} />
      ))}
      <path d="M110 100 C 130 112, 140 124, 150 128" stroke={MINT} strokeWidth="3" fill="none" />
      <g transform="translate(138 58)">
        <g transform="scale(0.62)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => petal(a, 46, 15, a % 90 === 0 ? CORAL : SUN, `h${a}`))}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => petal(a + 22.5, 30, 9, a % 90 === 0 ? SUN : CORAL, `j${a}`))}
          <circle r="12" fill={SKY} />
          <circle r="5" fill={SUN} />
        </g>
      </g>
    </svg>
  );
}

/** Тонка орнаментальна смужка-розділювач. */
export function OrnamentRule({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 24" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d="M0 12 H90 M150 12 H240" stroke="var(--line)" strokeWidth="2" />
      <g transform="translate(120 12) scale(0.22)">
        {[0, 60, 120, 180, 240, 300].map((a) => petal(a, 46, 16, a % 120 === 0 ? CORAL : SUN, `r${a}`))}
        <circle r="12" fill={SKY} />
      </g>
      <circle cx="98" cy="12" r="3.5" fill={CORAL} />
      <circle cx="142" cy="12" r="3.5" fill={CORAL} />
    </svg>
  );
}
