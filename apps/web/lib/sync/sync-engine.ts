import {
  getOutboxOps,
  removeOp,
  getAllTasks,
  putTask,
  deleteTask,
} from "@/lib/db";
import {
  putTaskRemote,
  deleteTaskRemote,
  listTasksRemote,
} from "@/lib/api-client";

export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine;
}

async function flushOutbox(): Promise<void> {
  const ops = await getOutboxOps();
  for (const op of ops) {
    if (op.type === "upsert" && op.task) {
      await putTaskRemote(op.task);
    } else if (op.type === "delete") {
      await deleteTaskRemote(op.taskId);
    }
    if (op.seq != null) await removeOp(op.seq);
  }
}

async function pullAndReconcile(): Promise<void> {
  const serverTasks = await listTasksRemote();
  const localTasks = await getAllTasks();
  const pendingIds = new Set((await getOutboxOps()).map((op) => op.taskId));
  const localById = new Map(localTasks.map((task) => [task.id, task]));

  const serverIds = new Set<string>();
  for (const server of serverTasks) {
    serverIds.add(server.id);
    const local = localById.get(server.id);
    if (!local || server.atualizadaEm > local.atualizadaEm) {
      await putTask(server);
    }
  }

  for (const local of localTasks) {
    if (!serverIds.has(local.id) && !pendingIds.has(local.id)) {
      await deleteTask(local.id);
    }
  }
}

export async function syncTasks(): Promise<void> {
  if (!isOnline()) return;
  await flushOutbox();
  await pullAndReconcile();
}
