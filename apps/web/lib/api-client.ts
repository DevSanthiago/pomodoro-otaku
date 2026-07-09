import type { Task, TaskStatus } from "./task";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5279";

interface ApiTask {
  id: string;
  titulo: string;
  descricao: string | null;
  status: TaskStatus;
  pomodorosEstimados: number;
  pomodorosCompletados: number;
  criadaEm: string;
  atualizadaEm: string;
}

function toApiBody(task: Task) {
  return {
    titulo: task.titulo,
    descricao: task.descricao ?? null,
    status: task.status,
    pomodorosEstimados: task.pomodorosEstimados,
    pomodorosCompletados: task.pomodorosCompletados,
    criadaEm: new Date(task.criadaEm).toISOString(),
    atualizadaEm: new Date(task.atualizadaEm).toISOString(),
  };
}

function fromApiTask(dto: ApiTask): Task {
  return {
    id: dto.id,
    titulo: dto.titulo,
    descricao: dto.descricao ?? undefined,
    status: dto.status,
    pomodorosEstimados: dto.pomodorosEstimados,
    pomodorosCompletados: dto.pomodorosCompletados,
    criadaEm: new Date(dto.criadaEm).getTime(),
    atualizadaEm: new Date(dto.atualizadaEm).getTime(),
  };
}

export async function putTaskRemote(task: Task): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${task.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiBody(task)),
  });
  if (!response.ok) {
    throw new Error(`PUT /tasks/${task.id} respondeu ${response.status}`);
  }
}

export async function deleteTaskRemote(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE /tasks/${id} respondeu ${response.status}`);
  }
}

export async function listTasksRemote(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`);
  if (!response.ok) {
    throw new Error(`GET /tasks respondeu ${response.status}`);
  }
  const data: ApiTask[] = await response.json();
  return data.map(fromApiTask);
}
