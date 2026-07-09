import type { Metadata } from "next";
import { TaskList } from "@/components/tasks/task-list";

export const metadata: Metadata = {
  title: "Tarefas — Pomodoro Otaku",
  description: "Gerencie suas tarefas locais e estime pomodoros por tarefa.",
};

export default function TasksPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight">Tarefas</h1>
        <p className="text-sm text-muted-foreground">
          Organize o que vai focar — cada tarefa concluída rende XP.
        </p>
      </div>

      <TaskList />
    </main>
  );
}
