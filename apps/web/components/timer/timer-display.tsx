import { formatRemaining } from "@/lib/timer-engine";

interface TimerDisplayProps {
  remainingMs: number;
  progress: number;
  label: string;
  completed: boolean;
}

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDisplay({
  remainingMs,
  progress,
  label,
  completed,
}: TimerDisplayProps) {
  const offset = CIRCUMFERENCE * (1 - progress);

  return (
    <div className="relative flex size-72 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 300 300">
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          className="stroke-white/15"
        />
        <circle
          cx="150"
          cy="150"
          r={RADIUS}
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="timer-ring transition-[stroke-dashoffset] duration-500 ease-linear"
        />
      </svg>

      <div className="flex flex-col items-center gap-1">
        <span
          className="text-sm font-bold uppercase tracking-[0.18em] text-white"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.65)" }}
        >
          {label}
        </span>
        <span className="timer-number font-mono text-6xl font-semibold tabular-nums">
          {formatRemaining(remainingMs)}
        </span>
        <span className="h-4 text-xs text-white/60">
          {completed ? "Concluído!" : ""}
        </span>
      </div>
    </div>
  );
}
