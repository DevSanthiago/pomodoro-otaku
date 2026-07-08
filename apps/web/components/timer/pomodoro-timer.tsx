"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/stores/timer-store";
import { remainingMs, progress, createSnapshot } from "@/lib/timer-engine";
import { TimerDisplay } from "./timer-display";
import { TimerControls } from "./timer-controls";

export function PomodoroTimer() {
  const snapshot = useTimerStore((s) => s.snapshot);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const resume = useTimerStore((s) => s.resume);
  const reset = useTimerStore((s) => s.reset);
  const advance = useTimerStore((s) => s.advance);
  const setSessionType = useTimerStore((s) => s.setSessionType);
  const sync = useTimerStore((s) => s.sync);

  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setMounted(true);
    const n = Date.now();
    setNow(n);
    sync(n);
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

  const hydratedSnapshot = mounted ? snapshot : createSnapshot("focus");
  const remaining = remainingMs(hydratedSnapshot, now);
  const ratio = progress(hydratedSnapshot, now);

  return (
    <div className="flex flex-col items-center gap-10">
      <TimerDisplay
        remainingMs={remaining}
        progress={ratio}
        sessionType={hydratedSnapshot.sessionType}
        completed={hydratedSnapshot.status === "completed"}
      />
      <TimerControls
        status={hydratedSnapshot.status}
        sessionType={hydratedSnapshot.sessionType}
        onStart={start}
        onPause={pause}
        onResume={resume}
        onReset={reset}
        onAdvance={advance}
        onSelectSession={setSessionType}
      />
    </div>
  );
}
