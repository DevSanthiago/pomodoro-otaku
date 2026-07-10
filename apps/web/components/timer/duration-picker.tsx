import { cn } from "@/lib/utils";
import {
  DURATION_OPTIONS_MIN,
  FOCUS_QUIRKS,
  type DurationMin,
  type SessionType,
} from "@/lib/timer-engine";

interface DurationPickerProps {
  sessionType: SessionType;
  durationMin: DurationMin;
  disabled: boolean;
  onSelect: (durationMin: DurationMin) => void;
}

export function DurationPicker({
  sessionType,
  durationMin,
  disabled,
  onSelect,
}: DurationPickerProps) {
  const isFocus = sessionType === "focus";

  return (
    <div className="flex max-w-md flex-wrap items-stretch justify-center gap-2">
      {DURATION_OPTIONS_MIN.map((min) => {
        const active = min === durationMin;
        return (
          <button
            key={min}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(min)}
            aria-pressed={active}
            className={cn(
              "flex min-w-16 cursor-pointer flex-col items-center rounded-2xl border px-3 py-2 leading-tight transition-all duration-150 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
              active
                ? "border-white bg-white text-black shadow-lg"
                : "border-white/15 text-white/70 hover:border-white/40 hover:text-white",
            )}
          >
            {isFocus ? (
              <>
                <span className="text-sm font-semibold">{FOCUS_QUIRKS[min]}</span>
                <span className={cn("text-[0.65rem]", active ? "text-black/60" : "text-white/45")}>
                  {min} min
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold">{min} min</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
