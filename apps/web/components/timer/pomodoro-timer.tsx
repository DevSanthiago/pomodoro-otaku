"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import {
  remainingMs,
  progress,
  createSnapshot,
  sessionLabel,
  minToMs,
  DEFAULT_DURATION_MIN,
} from "@/lib/timer-engine";
import { useHydrated } from "@/lib/use-hydrated";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";

export function PomodoroTimer() {
  const snapshot = useTimerStore((s) => s.snapshot);
  const durations = useTimerStore((s) => s.durations);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const advance = useTimerStore((s) => s.advance);
  const setSessionType = useTimerStore((s) => s.setSessionType);
  const setDuration = useTimerStore((s) => s.setDuration);
  const sync = useTimerStore((s) => s.sync);

  const hydrated = useHydrated();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    sync(Date.now());
  }, [sync]);

  useEffect(() => {
    if (snapshot.status !== "running") return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      sync(n);
    }, 250);
    return () => clearInterval(id);
  }, [snapshot.status, sync]);

  useEffect(() => {
    const resync = () => {
      const n = Date.now();
      setNow(n);
      sync(n);
    };
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
    };
  }, [sync]);

  const hydratedSnapshot = hydrated
    ? snapshot
    : createSnapshot("focus", minToMs(DEFAULT_DURATION_MIN.focus));
  const remaining = remainingMs(hydratedSnapshot, now);
  const ratio = progress(hydratedSnapshot, now);
  const activeSession = hydratedSnapshot.sessionType;
  const durationMin = hydrated ? durations[activeSession] : DEFAULT_DURATION_MIN.focus;

  return (
    <div className="flex flex-col items-center gap-10">
      <TimerDisplay
        remainingMs={remaining}
        progress={ratio}
        label={sessionLabel(activeSession, durationMin)}
        completed={hydratedSnapshot.status === "completed"}
      />
      <TimerControls
        status={hydratedSnapshot.status}
        sessionType={activeSession}
        durationMin={durationMin}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        onAdvance={advance}
        onSelectSession={setSessionType}
        onSelectDuration={(min) => setDuration(activeSession, min)}
      />
    </div>
  );
}
