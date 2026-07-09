import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SESSION_LABELS,
  SESSION_ACCENTS,
  type SessionType,
  type TimerStatus,
} from "@/lib/timer-engine";

const SESSION_ORDER: SessionType[] = ["focus", "shortBreak", "longBreak"];

interface TimerControlsProps {
  status: TimerStatus;
  sessionType: SessionType;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onAdvance: () => void;
  onSelectSession: (sessionType: SessionType) => void;
}

export function TimerControls({
  status,
  sessionType,
  onStart,
  onPause,
  onResume,
  onReset,
  onAdvance,
  onSelectSession,
}: TimerControlsProps) {
  const activeIndex = SESSION_ORDER.indexOf(sessionType);
  const disabled = status === "running";

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative grid grid-cols-3 rounded-full bg-muted p-1"
        style={
          {
            "--accent-base": SESSION_ACCENTS[sessionType].base,
            "--accent-glow": SESSION_ACCENTS[sessionType].glow,
          } as React.CSSProperties
        }
      >
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
            style={type === sessionType ? { color: "oklch(0.2 0 0)" } : undefined}
            className={cn(
              "relative z-10 cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed",
              type === sessionType ? "" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {SESSION_LABELS[type]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {status === "idle" && (
          <Button size="lg" onClick={onStart}>
            Iniciar
          </Button>
        )}
        {status === "running" && (
          <Button size="lg" variant="secondary" onClick={onPause}>
            Pausar
          </Button>
        )}
        {status === "paused" && (
          <Button size="lg" onClick={onResume}>
            Retomar
          </Button>
        )}
        {status === "completed" && (
          <Button size="lg" onClick={onAdvance}>
            Próxima sessão
          </Button>
        )}

        {status !== "idle" && status !== "completed" && (
          <Button size="lg" variant="ghost" onClick={onReset}>
            Resetar
          </Button>
        )}
      </div>
    </div>
  );
}
