import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createSnapshot,
  isExpired,
  nextSessionType,
  minToMs,
  DEFAULT_DURATION_MIN,
  type SessionType,
  type TimerSnapshot,
  type DurationMin,
} from "@/lib/timer-engine";
import { FOCOS_POR_CICLO } from "@/lib/gamification";
import { useGamificationStore } from "@/stores/gamification-store";

interface TimerState {
  snapshot: TimerSnapshot;
  durations: Record<SessionType, DurationMin>;
  completedFocusCount: number;
  completedSessions: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setSessionType: (sessionType: SessionType) => void;
  setDuration: (sessionType: SessionType, durationMin: DurationMin) => void;
  advance: () => void;
  sync: (now: number) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      snapshot: createSnapshot("focus", minToMs(DEFAULT_DURATION_MIN.focus)),
      durations: { ...DEFAULT_DURATION_MIN },
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
        const { snapshot, durations } = get();
        set({
          snapshot: createSnapshot(snapshot.sessionType, minToMs(durations[snapshot.sessionType])),
        });
      },

      setSessionType: (sessionType) => {
        const { durations } = get();
        set({ snapshot: createSnapshot(sessionType, minToMs(durations[sessionType])) });
      },

      setDuration: (sessionType, durationMin) => {
        const { snapshot, durations } = get();
        const nextDurations = { ...durations, [sessionType]: durationMin };
        if (snapshot.sessionType === sessionType && snapshot.status !== "running") {
          set({
            durations: nextDurations,
            snapshot: createSnapshot(sessionType, minToMs(durationMin)),
          });
        } else {
          set({ durations: nextDurations });
        }
      },

      advance: () => {
        const { snapshot, completedFocusCount, durations } = get();
        const next = nextSessionType(snapshot.sessionType, completedFocusCount);
        set({ snapshot: createSnapshot(next, minToMs(durations[next])) });
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
        durations: state.durations,
        completedFocusCount: state.completedFocusCount,
        completedSessions: state.completedSessions,
      }),
      merge: (persisted, current) => {
        const incoming = (persisted as Partial<TimerState>) ?? {};
        return {
          ...current,
          ...incoming,
          durations: { ...current.durations, ...(incoming.durations ?? {}) },
          snapshot: incoming.snapshot ?? current.snapshot,
        };
      },
    },
  ),
);
