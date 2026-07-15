import type { Task, TaskStatus } from "./task";
import type { Progress } from "./gamification";
import { authHeaders } from "./auth/token";

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
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(toApiBody(task)),
  });
  if (!response.ok) {
    throw new Error(`PUT /tasks/${task.id} respondeu ${response.status}`);
  }
}

export async function deleteTaskRemote(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  if (!response.ok && response.status !== 404) {
    throw new Error(`DELETE /tasks/${id} respondeu ${response.status}`);
  }
}

export async function listTasksRemote(): Promise<Task[]> {
  const response = await fetch(`${API_URL}/tasks`, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(`GET /tasks respondeu ${response.status}`);
  }
  const data: ApiTask[] = await response.json();
  return data.map(fromApiTask);
}

interface ApiProgress {
  id: string;
  xpTotal: number;
  focosConcluidos: number;
  tarefasConcluidas: number;
  nivel: number;
  streakAtual: number;
  streakRecorde: number;
  ultimoDiaFoco: string | null;
  personagemAtual: string;
  conquistasDesbloqueadas: string[];
  atualizadaEm: string;
}

function fromApiProgress(dto: ApiProgress): Progress {
  return {
    id: dto.id,
    xpTotal: dto.xpTotal,
    focosConcluidos: dto.focosConcluidos,
    tarefasConcluidas: dto.tarefasConcluidas,
    nivel: dto.nivel,
    streakAtual: dto.streakAtual,
    streakRecorde: dto.streakRecorde,
    ultimoDiaFoco: dto.ultimoDiaFoco ?? null,
    personagemAtual: dto.personagemAtual,
    conquistasDesbloqueadas: dto.conquistasDesbloqueadas ?? [],
    atualizadaEm: new Date(dto.atualizadaEm).getTime(),
  };
}

function toApiProgressBody(progress: Progress) {
  return {
    xpTotal: progress.xpTotal,
    focosConcluidos: progress.focosConcluidos,
    tarefasConcluidas: progress.tarefasConcluidas,
    streakAtual: progress.streakAtual,
    streakRecorde: progress.streakRecorde,
    ultimoDiaFoco: progress.ultimoDiaFoco,
    conquistasDesbloqueadas: progress.conquistasDesbloqueadas,
    atualizadaEm: new Date(progress.atualizadaEm).toISOString(),
  };
}

export async function getProgressRemote(): Promise<Progress> {
  const response = await fetch(`${API_URL}/progress`, { headers: await authHeaders() });
  if (!response.ok) {
    throw new Error(`GET /progress respondeu ${response.status}`);
  }
  return fromApiProgress(await response.json());
}

export async function putProgressRemote(progress: Progress): Promise<Progress> {
  const response = await fetch(`${API_URL}/progress`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify(toApiProgressBody(progress)),
  });
  if (!response.ok) {
    throw new Error(`PUT /progress respondeu ${response.status}`);
  }
  return fromApiProgress(await response.json());
}
