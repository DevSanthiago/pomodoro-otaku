import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DURATION_OPTIONS_MIN,
  FOCUS_QUIRKS,
  type DurationMin,
  type SessionType,
} from "@/lib/timer-engine";

interface DurationMenuProps {
  sessionType: SessionType;
  durationMin: DurationMin;
  onSelect: (durationMin: DurationMin) => void;
}

export function DurationMenu({ sessionType, durationMin, onSelect }: DurationMenuProps) {
  const isFocus = sessionType === "focus";

  return (
    <div
      role="menu"
      aria-label="Duração"
      className="absolute top-full left-1/2 z-20 mt-4 w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/80 p-1.5 shadow-2xl backdrop-blur-xl"
    >
      {DURATION_OPTIONS_MIN.map((min) => {
        const active = min === durationMin;
        return (
          <button
            key={min}
            type="button"
            role="menuitemradio"
            aria-checked={active}
            onClick={() => onSelect(min)}
            className={cn(
              "flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3 py-2.5 text-sm transition-colors",
              active ? "bg-white text-black" : "text-white/80 hover:bg-white/10 hover:text-white",
            )}
          >
            <span className="font-medium">{isFocus ? FOCUS_QUIRKS[min] : `${min} min`}</span>
            <span className="flex items-center gap-2">
              {isFocus && (
                <span className={cn("text-xs", active ? "text-black/55" : "text-white/40")}>
                  {min} min
                </span>
              )}
              {active && <Check className="size-4" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
