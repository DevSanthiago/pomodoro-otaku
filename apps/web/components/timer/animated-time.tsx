import { cn } from "@/lib/utils";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function Digit({ value, roll }: { value: number; roll: boolean }) {
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden align-top">
      <span
        className={cn(
          "absolute inset-x-0 top-0 flex flex-col",
          roll ? "timer-digit" : "timer-digit-static",
        )}
        style={{ transform: `translateY(${-value}em)` }}
      >
        {DIGITS.map((digit) => (
          <span key={digit} className="block h-[1em] text-center leading-[1em]">
            {digit}
          </span>
        ))}
      </span>
    </span>
  );
}

export function AnimatedTime({ ms, roll }: { ms: number; roll: boolean }) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <span className="timer-number flex items-start font-mono text-6xl leading-none font-semibold tabular-nums">
      <Digit value={Math.floor(minutes / 10)} roll={roll} />
      <Digit value={minutes % 10} roll={roll} />
      <span className="inline-block w-[1ch] text-center">:</span>
      <Digit value={Math.floor(seconds / 10)} roll={roll} />
      <Digit value={seconds % 10} roll={roll} />
    </span>
  );
}
