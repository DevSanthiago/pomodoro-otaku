import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Task } from "./task";

const DB_NAME = "pomodoro-otaku";
const DB_VERSION = 2;
const TASKS_STORE = "tasks";
const TASKS_BY_CRIADA_EM = "by-criadaEm";
const OUTBOX_STORE = "outbox";

export type SyncOpType = "upsert" | "delete";

export interface SyncOp {
  seq?: number;
  type: SyncOpType;
  taskId: string;
  task?: Task;
}

interface PomodoroOtakuDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { "by-criadaEm": number };
  };
  outbox: {
    key: number;
    value: SyncOp;
  };
}

let dbPromise: Promise<IDBPDatabase<PomodoroOtakuDB>> | null = null;

function getDb(): Promise<IDBPDatabase<PomodoroOtakuDB>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponível neste ambiente"));
  }
  if (!dbPromise) {
    dbPromise = openDB<PomodoroOtakuDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const store = db.createObjectStore(TASKS_STORE, { keyPath: "id" });
          store.createIndex(TASKS_BY_CRIADA_EM, "criadaEm");
        }
        if (oldVersion < 2) {
          db.createObjectStore(OUTBOX_STORE, { keyPath: "seq", autoIncrement: true });
        }
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

export async function enqueueOp(op: SyncOp): Promise<void> {
  const db = await getDb();
  await db.add(OUTBOX_STORE, op);
}

export async function getOutboxOps(): Promise<SyncOp[]> {
  const db = await getDb();
  return db.getAll(OUTBOX_STORE);
}

export async function removeOp(seq: number): Promise<void> {
  const db = await getDb();
  await db.delete(OUTBOX_STORE, seq);
}

export async function countOutboxOps(): Promise<number> {
  const db = await getDb();
  return db.count(OUTBOX_STORE);
}
