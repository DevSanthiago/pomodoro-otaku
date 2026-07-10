"use client";

import { useEffect, useRef, useState } from "react";
import type { DurationMin, SessionType } from "@/lib/timer-engine";
import { TimerDisplay } from "./timer-display";
import { DurationMenu } from "./duration-menu";

interface TimerClockProps {
  remainingMs: number;
  progress: number;
  label: string;
  completed: boolean;
  sessionType: SessionType;
  durationMin: DurationMin;
  canEdit: boolean;
  onSelectDuration: (durationMin: DurationMin) => void;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function TimerClock({
  remainingMs,
  progress,
  label,
  completed,
  sessionType,
  durationMin,
  canEdit,
  onSelectDuration,
}: TimerClockProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function pulseDisc() {
    if (prefersReducedMotion()) return;
    discRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.045)" }, { transform: "scale(1)" }],
      { duration: 420, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    );
  }

  return (
    <div ref={ref} className="relative flex flex-col items-center">
      <button
        type="button"
        disabled={!canEdit}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Escolher duração"
        className="group relative rounded-full outline-none disabled:cursor-default"
      >
        <span
          ref={discRef}
          aria-hidden
          className="absolute inset-4 rounded-full bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-md transition-colors group-hover:bg-white/[0.1] group-focus-visible:bg-white/[0.1]"
        />
        <TimerDisplay
          remainingMs={remainingMs}
          progress={progress}
          label={label}
          completed={completed}
          editable={canEdit}
        />
      </button>

      {open && (
        <DurationMenu
          sessionType={sessionType}
          durationMin={durationMin}
          onSelect={(min) => {
            onSelectDuration(min);
            setOpen(false);
            pulseDisc();
          }}
        />
      )}
    </div>
  );
}
