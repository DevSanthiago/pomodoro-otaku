export type TaskStatus = "pendente" | "emAndamento" | "concluida";

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  status: TaskStatus;
  pomodorosEstimados: number;
  pomodorosCompletados: number;
  criadaEm: number;
  atualizadaEm: number;
  xpConcedido?: boolean;
}

export interface NewTaskInput {
  titulo: string;
  descricao?: string;
  pomodorosEstimados: number;
}

export interface TaskPatch {
  titulo?: string;
  descricao?: string;
  pomodorosEstimados?: number;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pendente: "Pendente",
  emAndamento: "Em andamento",
  concluida: "Concluída",
};

export const MAX_POMODOROS_ESTIMADOS = 99;

export function clampEstimados(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(MAX_POMODOROS_ESTIMADOS, Math.max(0, Math.floor(value)));
}

function normalizeDescricao(descricao?: string): string | undefined {
  const trimmed = descricao?.trim();
  return trimmed ? trimmed : undefined;
}

export function validateNewTask(input: NewTaskInput): string | null {
  if (!input.titulo.trim()) return "Título é obrigatório";
  if (!Number.isFinite(input.pomodorosEstimados) || input.pomodorosEstimados < 0) {
    return "Estimativa inválida";
  }
  return null;
}

export function createTask(input: NewTaskInput, now: number = Date.now()): Task {
  return {
    id: crypto.randomUUID(),
    titulo: input.titulo.trim(),
    descricao: normalizeDescricao(input.descricao),
    status: "pendente",
    pomodorosEstimados: clampEstimados(input.pomodorosEstimados),
    pomodorosCompletados: 0,
    criadaEm: now,
    atualizadaEm: now,
  };
}

export function applyPatch(task: Task, patch: TaskPatch, now: number = Date.now()): Task {
  return {
    ...task,
    titulo: patch.titulo != null ? patch.titulo.trim() : task.titulo,
    descricao:
      patch.descricao !== undefined
        ? normalizeDescricao(patch.descricao)
        : task.descricao,
    pomodorosEstimados:
      patch.pomodorosEstimados != null
        ? clampEstimados(patch.pomodorosEstimados)
        : task.pomodorosEstimados,
    atualizadaEm: now,
  };
}

export interface ToggleResult {
  task: Task;
  concedeXp: boolean;
}

export function toggleTaskDone(task: Task, now: number = Date.now()): ToggleResult {
  const concluindo = task.status !== "concluida";
  const primeiraConclusao = concluindo && !task.xpConcedido;
  return {
    task: {
      ...task,
      status: concluindo ? "concluida" : "pendente",
      xpConcedido: task.xpConcedido || primeiraConclusao,
      atualizadaEm: now,
    },
    concedeXp: primeiraConclusao,
  };
}

export function isConcluida(task: Task): boolean {
  return task.status === "concluida";
}

const STATUS_ORDER: Record<TaskStatus, number> = {
  emAndamento: 0,
  pendente: 1,
  concluida: 2,
};

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (byStatus !== 0) return byStatus;
    return b.criadaEm - a.criadaEm;
  });
}
