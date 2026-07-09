"use client";

import { useEffect } from "react";
import { useTaskStore } from "@/stores/task-store";
import { TaskForm } from "./task-form";
import { TaskItem } from "./task-item";

export function TaskList() {
  const tasks = useTaskStore((s) => s.tasks);
  const hydrated = useTaskStore((s) => s.hydrated);
  const hydrate = useTaskStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <TaskForm />

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
