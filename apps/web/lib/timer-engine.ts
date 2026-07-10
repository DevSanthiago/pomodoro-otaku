export type SessionType = "focus" | "shortBreak" | "longBreak";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

export const DURATION_OPTIONS_MIN = [3, 5, 15, 25, 60] as const;

export type DurationMin = (typeof DURATION_OPTIONS_MIN)[number];

export const FOCUS_QUIRKS: Record<DurationMin, string> = {
  3: "Gearshift",
  5: "Fa Jin",
  15: "Danger Sense",
  25: "Blackwhip",
  60: "Float",
};

export const DEFAULT_DURATION_MIN: Record<SessionType, DurationMin> = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

export const SESSION_LABELS: Record<SessionType, string> = {
  focus: "Foco",
  shortBreak: "Pausa curta",
  longBreak: "Pausa longa",
};

export const FOCUS_SESSIONS_PER_LONG_BREAK = 4;

export function minToMs(minutes: number): number {
  return minutes * 60_000;
}

export function sessionLabel(sessionType: SessionType, durationMin: DurationMin): string {
  return sessionType === "focus" ? FOCUS_QUIRKS[durationMin] : SESSION_LABELS[sessionType];
}

export interface TimerSnapshot {
  status: TimerStatus;
  sessionType: SessionType;
  durationMs: number;
  startedAt: number | null;
  elapsedBeforePauseMs: number;
}

export function createSnapshot(sessionType: SessionType, durationMs: number): TimerSnapshot {
  return {
    status: "idle",
    sessionType,
    durationMs,
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
