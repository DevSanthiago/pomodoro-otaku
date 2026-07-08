import { Button } from "@/components/ui/button";
import {
  SESSION_LABELS,
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
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-2">
        {SESSION_ORDER.map((type) => (
          <Button
            key={type}
            size="sm"
            variant={type === sessionType ? "default" : "outline"}
            disabled={status === "running"}
            onClick={() => onSelectSession(type)}
          >
            {SESSION_LABELS[type]}
          </Button>
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
