import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createSnapshot,
  isExpired,
  nextSessionType,
  type SessionType,
  type TimerSnapshot,
  DEFAULT_DURATIONS_MS,
} from "@/lib/timer-engine";
import { FOCOS_POR_CICLO } from "@/lib/gamification";
import { useGamificationStore } from "@/stores/gamification-store";

interface TimerState {
  snapshot: TimerSnapshot;
  completedFocusCount: number;
  completedSessions: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setSessionType: (sessionType: SessionType) => void;
  advance: () => void;
  sync: (now: number) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      snapshot: createSnapshot("focus"),
      completedFocusCount: 0,
      completedSessions: 0,

      start: () => {
        const { snapshot } = get();
        if (snapshot.status === "running" || snapshot.status === "completed") return;
        set({
          snapshot: {
            ...snapshot,
            status: "running",
            startedAt: Date.now(),
          },
        });
      },

      pause: () => {
        const { snapshot } = get();
        if (snapshot.status !== "running" || snapshot.startedAt == null) return;
        set({
          snapshot: {
            ...snapshot,
            status: "paused",
            startedAt: null,
            elapsedBeforePauseMs:
              snapshot.elapsedBeforePauseMs + (Date.now() - snapshot.startedAt),
          },
        });
      },

      resume: () => {
        const { snapshot } = get();
        if (snapshot.status !== "paused") return;
        set({
          snapshot: { ...snapshot, status: "running", startedAt: Date.now() },
        });
      },

      reset: () => {
        const { snapshot } = get();
        set({ snapshot: createSnapshot(snapshot.sessionType) });
      },

      setSessionType: (sessionType) => {
        set({ snapshot: createSnapshot(sessionType) });
      },

      advance: () => {
        const { snapshot, completedFocusCount } = get();
        set({ snapshot: createSnapshot(nextSessionType(snapshot.sessionType, completedFocusCount)) });
      },

      sync: (now) => {
        const { snapshot, completedFocusCount, completedSessions } = get();
        if (snapshot.status !== "running") return;
        if (!isExpired(snapshot, now)) return;
        const wasFocus = snapshot.sessionType === "focus";
        const novoFocusCount = wasFocus ? completedFocusCount + 1 : completedFocusCount;
        set({
          snapshot: {
            ...snapshot,
            status: "completed",
            startedAt: null,
            elapsedBeforePauseMs: snapshot.durationMs,
          },
          completedFocusCount: novoFocusCount,
          completedSessions: completedSessions + 1,
        });
        if (wasFocus) {
          const cicloCompleto = novoFocusCount % FOCOS_POR_CICLO === 0;
          void useGamificationStore.getState().registrarFocoConcluido(cicloCompleto);
        }
      },
    }),
    {
      name: "pomodoro-otaku-timer",
      partialize: (state) => ({
        snapshot: state.snapshot,
        completedFocusCount: state.completedFocusCount,
        completedSessions: state.completedSessions,
      }),
      merge: (persisted, current) => {
        const incoming = (persisted as Partial<TimerState>) ?? {};
        const snapshot = incoming.snapshot ?? current.snapshot;
        const durationMs = DEFAULT_DURATIONS_MS[snapshot.sessionType] ?? snapshot.durationMs;
        return { ...current, ...incoming, snapshot: { ...snapshot, durationMs } };
      },
    },
  ),
);
