import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Task } from "./task";

const DB_NAME = "pomodoro-otaku";
const DB_VERSION = 1;
const TASKS_STORE = "tasks";
const TASKS_BY_CRIADA_EM = "by-criadaEm";

interface PomodoroOtakuDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { "by-criadaEm": number };
  };
}

let dbPromise: Promise<IDBPDatabase<PomodoroOtakuDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PomodoroOtakuDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponível neste ambiente"));
  }
  if (!dbPromise) {
    dbPromise = openDB<PomodoroOtakuDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(TASKS_STORE, { keyPath: "id" });
        store.createIndex(TASKS_BY_CRIADA_EM, "criadaEm");
      },
    });
  }
  return dbPromise;
}

export async function getAllTasks(): Promise<Task[]> {
  const db = await getDb();
  return db.getAllFromIndex(TASKS_STORE, TASKS_BY_CRIADA_EM);
}

export async function putTask(task: Task): Promise<void> {
  const db = await getDb();
  await db.put(TASKS_STORE, task);
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  await db.delete(TASKS_STORE, id);
}
