import { TIERS } from "@/lib/gamification";

const ACCENT = "oklch(0.78 0.17 150)";
const ACCENT_SOFT = "oklch(0.88 0.15 150)";
const RING_RADIUS = 42;

interface OfaEmblemProps {
  nivel: number;
  size?: number;
}

export function OfaEmblem({ nivel, size = 96 }: OfaEmblemProps) {
  const total = TIERS.length;
  const acesos = Math.max(0, Math.min(total, nivel));
  const glow = 3 + acesos * 1.4;

  const pips = Array.from({ length: total }, (_, index) => {
    const angle = (-90 + index * (360 / total)) * (Math.PI / 180);
    return {
      lit: index < acesos,
      x: 50 + RING_RADIUS * Math.cos(angle),
      y: 50 + RING_RADIUS * Math.sin(angle),
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={`Emblema One For All, nível ${nivel}`}
    >
      <circle
        cx="50"
        cy="50"
        r={RING_RADIUS}
        fill="none"
        stroke="var(--muted)"
        strokeWidth="1.5"
      />
      {pips.map((pip, index) => (
        <circle
          key={index}
          cx={pip.x}
          cy={pip.y}
          r={pip.lit ? 3 : 2}
          fill={pip.lit ? ACCENT : "var(--muted)"}
          style={pip.lit ? { filter: `drop-shadow(0 0 ${glow / 2}px ${ACCENT_SOFT})` } : undefined}
        />
      ))}
      <path
        d="M56 18 L36 52 L48 52 L44 82 L66 46 L53 46 Z"
        fill={ACCENT}
        stroke={ACCENT_SOFT}
        strokeWidth="1"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 ${glow}px ${ACCENT_SOFT})` }}
      />
    </svg>
  );
}
