"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { useTaskStore } from "@/stores/task-store";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const pendingSync = useTaskStore((s) => s.pendingSync);
  const hydrate = useTaskStore((s) => s.hydrate);
  const sync = useTaskStore((s) => s.sync);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onOnline = () => sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [sync]);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <TaskForm />

      {pendingSync > 0 && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5" />
          {pendingSync} {pendingSync === 1 ? "alteração pendente" : "alterações pendentes"} de sincronização
        </p>
      )}

      {!hydrated ? (
        <p className="text-center text-sm text-muted-foreground">Carregando…</p>
      ) : tasks.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Nenhuma tarefa ainda. Adicione a primeira.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
