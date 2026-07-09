export type SessionType = "focus" | "shortBreak" | "longBreak";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export const DEFAULT_DURATIONS_MS: Record<SessionType, number> = {
  focus: 25 * 60_000,
  shortBreak: 5 * 60_000,
  longBreak: 15 * 60_000,
};

export const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Foco",
  shortBreak: "Pausa curta",
  longBreak: "Pausa longa",
};

export interface SessionAccent {
  base: string;
  strong: string;
  glow: string;
}

export const SESSION_ACCENTS: Record<SessionType, SessionAccent> = {
  focus: {
    base: "oklch(0.78 0.17 150)",
    strong: "oklch(0.52 0.15 150)",
    glow: "oklch(0.88 0.15 150)",
  },
  shortBreak: {
    base: "oklch(0.8 0.12 210)",
    strong: "oklch(0.54 0.13 210)",
    glow: "oklch(0.9 0.1 210)",
  },
  longBreak: {
    base: "oklch(0.72 0.15 265)",
    strong: "oklch(0.55 0.17 265)",
    glow: "oklch(0.86 0.13 265)",
  },
};

export const FOCUS_SESSIONS_PER_LONG_BREAK = 4;

export interface TimerSnapshot {
  status: TimerStatus;
  sessionType: SessionType;
  durationMs: number;
  startedAt: number | null;
  elapsedBeforePauseMs: number;
}

export function createSnapshot(sessionType: SessionType): TimerSnapshot {
  return {
    status: "idle",
    sessionType,
    durationMs: DEFAULT_DURATIONS_MS[sessionType],
    startedAt: null,
    elapsedBeforePauseMs: 0,
  };
}

export function elapsedMs(snapshot: TimerSnapshot, now: number): number {
  const active =
    snapshot.status === "running" && snapshot.startedAt != null
      ? now - snapshot.startedAt
      : 0;
  return snapshot.elapsedBeforePauseMs + Math.max(0, active);
}

export function remainingMs(snapshot: TimerSnapshot, now: number): number {
  return Math.max(0, snapshot.durationMs - elapsedMs(snapshot, now));
}

export function progress(snapshot: TimerSnapshot, now: number): number {
  if (snapshot.durationMs <= 0) return 1;
  return Math.min(1, elapsedMs(snapshot, now) / snapshot.durationMs);
}

export function isExpired(snapshot: TimerSnapshot, now: number): boolean {
  return remainingMs(snapshot, now) <= 0;
}

export function nextSessionType(
  current: SessionType,
  completedFocusCount: number,
): SessionType {
  if (current !== "focus") return "focus";
  return completedFocusCount > 0 &&
    completedFocusCount % FOCUS_SESSIONS_PER_LONG_BREAK === 0
    ? "longBreak"
    : "shortBreak";
}

export function formatRemaining(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
