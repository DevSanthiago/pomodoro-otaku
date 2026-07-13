import { create } from "zustand";
import {
  getAllTasks,
  putTask,
  deleteTask,
  enqueueOp,
  countOutboxOps,
  ensureOwner,
} from "@/lib/db";
import { syncTasks } from "@/lib/sync/sync-engine";
import { userIdConhecido } from "@/lib/auth/token";
import { useGamificationStore } from "@/stores/gamification-store";
import {
  createTask,
  applyPatch,
  toggleTaskDone,
  sortTasks,
  type Task,
  type NewTaskInput,
  type TaskPatch,
} from "@/lib/task";

interface TaskState {
  tasks: Task[];
  hydrated: boolean;
  pendingSync: number;
  hydrate: () => Promise<void>;
  add: (input: NewTaskInput) => Promise<void>;
  edit: (id: string, patch: TaskPatch) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}

async function reloadPending(set: (partial: Partial<TaskState>) => void) {
  set({ pendingSync: await countOutboxOps() });
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  hydrated: false,
  pendingSync: 0,

  hydrate: async () => {
    const userId = userIdConhecido();
    if (userId) await ensureOwner(userId);
    const tasks = await getAllTasks();
    set({ tasks: sortTasks(tasks), hydrated: true });
    await reloadPending(set);
    void get().sync();
  },

  add: async (input) => {
    const task = createTask(input);
    await putTask(task);
    await enqueueOp({ type: "upsert", taskId: task.id, task });
    set({ tasks: sortTasks([...get().tasks, task]) });
    await reloadPending(set);
    void get().sync();
  },

  edit: async (id, patch) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const updated = applyPatch(current, patch);
    await putTask(updated);
    await enqueueOp({ type: "upsert", taskId: id, task: updated });
    set({
      tasks: sortTasks(get().tasks.map((task) => (task.id === id ? updated : task))),
    });
    await reloadPending(set);
    void get().sync();
  },

  toggleDone: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const updated = toggleTaskDone(current);
    await putTask(updated);
    await enqueueOp({ type: "upsert", taskId: id, task: updated });
    set({
      tasks: sortTasks(get().tasks.map((task) => (task.id === id ? updated : task))),
    });
    if (updated.status === "concluida") {
      void useGamificationStore.getState().registrarTarefaConcluida();
    }
    await reloadPending(set);
    void get().sync();
  },

  remove: async (id) => {
    await deleteTask(id);
    await enqueueOp({ type: "delete", taskId: id });
    set({ tasks: get().tasks.filter((task) => task.id !== id) });
    await reloadPending(set);
    void get().sync();
  },

  sync: async () => {
    try {
      await syncTasks();
      const tasks = await getAllTasks();
      set({ tasks: sortTasks(tasks) });
    } catch {
      // offline ou API indisponível: ops ficam no outbox e reenviam depois
    } finally {
      await reloadPending(set);
    }
  },
}));
