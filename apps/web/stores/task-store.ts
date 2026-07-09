import { create } from "zustand";
import { getAllTasks, putTask, deleteTask } from "@/lib/db";
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
  hydrate: () => Promise<void>;
  add: (input: NewTaskInput) => Promise<void>;
  edit: (id: string, patch: TaskPatch) => Promise<void>;
  toggleDone: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  hydrated: false,

  hydrate: async () => {
    const tasks = await getAllTasks();
    set({ tasks: sortTasks(tasks), hydrated: true });
  },

  add: async (input) => {
    const task = createTask(input);
    await putTask(task);
    set({ tasks: sortTasks([...get().tasks, task]) });
  },

  edit: async (id, patch) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const updated = applyPatch(current, patch);
    await putTask(updated);
    set({
      tasks: sortTasks(get().tasks.map((task) => (task.id === id ? updated : task))),
    });
  },

  toggleDone: async (id) => {
    const current = get().tasks.find((task) => task.id === id);
    if (!current) return;
    const updated = toggleTaskDone(current);
    await putTask(updated);
    set({
      tasks: sortTasks(get().tasks.map((task) => (task.id === id ? updated : task))),
    });
  },

  remove: async (id) => {
    await deleteTask(id);
    set({ tasks: get().tasks.filter((task) => task.id !== id) });
  },
}));
