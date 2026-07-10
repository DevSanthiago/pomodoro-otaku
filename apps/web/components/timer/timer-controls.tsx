import { cn } from "@/lib/utils";
import {
  SESSION_LABELS,
  type SessionType,
  type TimerStatus,
  type DurationMin,
} from "@/lib/timer-engine";
import { DurationPicker } from "./duration-picker";

const SESSION_ORDER: SessionType[] = ["focus", "shortBreak", "longBreak"];

const ACTION_PILL =
  "cursor-pointer rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black shadow-lg transition-transform duration-100 ease-out hover:bg-white/90 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-50";

interface TimerControlsProps {
  status: TimerStatus;
  sessionType: SessionType;
  durationMin: DurationMin;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAdvance: () => void;
  onSelectSession: (sessionType: SessionType) => void;
  onSelectDuration: (durationMin: DurationMin) => void;
}

export function TimerControls({
  status,
  sessionType,
  durationMin,
  onStart,
  onPause,
  onResume,
  onReset,
  onAdvance,
  onSelectSession,
  onSelectDuration,
}: TimerControlsProps) {
  const activeIndex = SESSION_ORDER.indexOf(sessionType);
  const disabled = status === "running";

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative grid grid-cols-3 rounded-full bg-[oklch(0.3_0.045_140)] p-1">
        <div
          aria-hidden
          className="pill-slide glow-pill absolute inset-y-1 left-1 rounded-full transition-transform duration-300 ease-out"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />
        {SESSION_ORDER.map((type) => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onSelectSession(type)}
            aria-pressed={type === sessionType}
            className={cn(
              "relative z-10 cursor-pointer rounded-full px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed sm:px-4",
              type === sessionType ? "text-black" : "text-white/70 hover:text-white",
            )}
          >
            {SESSION_LABELS[type]}
          </button>
        ))}
      </div>

      <DurationPicker
        sessionType={sessionType}
        durationMin={durationMin}
        disabled={disabled}
        onSelect={onSelectDuration}
      />

      <div className="flex items-center gap-3">
        {status === "idle" && (
          <button type="button" className={ACTION_PILL} onClick={onStart}>
            Iniciar
          </button>
        )}
        {status === "running" && (
          <button type="button" className={ACTION_PILL} onClick={onPause}>
            Pausar
          </button>
        )}
        {status === "paused" && (
          <button type="button" className={ACTION_PILL} onClick={onResume}>
            Retomar
          </button>
        )}
        {status === "completed" && (
          <button type="button" className={ACTION_PILL} onClick={onAdvance}>
            Próxima sessão
          </button>
        )}

        {status !== "idle" && status !== "completed" && (
          <button type="button" className={ACTION_PILL} onClick={onReset}>
            Resetar
          </button>
        )}
      </div>
    </div>
  );
}
