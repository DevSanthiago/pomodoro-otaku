import { formatRemaining, type SessionType, SESSION_LABELS } from "@/lib/timer-engine";

interface TimerDisplayProps {
  remainingMs: number;
  progress: number;
  sessionType: SessionType;
  completed: boolean;
}

const RADIUS = 130;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerDisplay({
  remainingMs,
  progress,
  sessionType,
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
        <span className="text-xs uppercase tracking-[0.3em] text-white/60">
          {SESSION_LABELS[sessionType]}
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
