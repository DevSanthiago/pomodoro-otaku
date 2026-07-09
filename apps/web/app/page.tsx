import { PomodoroTimer } from "@/components/timer/pomodoro-timer";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-10">
      <PomodoroTimer />
    </main>
  );
}
