import Link from "next/link";
import { ListTodo } from "lucide-react";
import { PomodoroTimer } from "@/components/timer/pomodoro-timer";
import { GamificationPanel } from "@/components/gamification/gamification-panel";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-10 px-6 py-16">
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-4xl" aria-hidden>
          🍅
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Pomodoro Otaku</h1>
      </div>

      <PomodoroTimer />

      <Link
        href="/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ListTodo className="size-4" />
        Tarefas
      </Link>

      <GamificationPanel />
    </main>
  );
}
