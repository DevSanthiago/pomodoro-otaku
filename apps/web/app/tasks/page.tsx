import type { Metadata } from "next";
import Link from "next/link";
import { Timer } from "lucide-react";
import { TaskList } from "@/components/tasks/task-list";

export const metadata: Metadata = {
  title: "Tarefas — Pomodoro Otaku",
  description: "Gerencie suas tarefas locais e estime pomodoros por tarefa.",
};

export default function TasksPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="flex w-full max-w-md items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Tarefas</h1>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <Timer className="size-4" />
          Timer
        </Link>
      </div>

      <TaskList />
    </main>
  );
}
