import type { Metadata } from "next";
import { GamificationPanel } from "@/components/gamification/gamification-panel";

export const metadata: Metadata = {
  title: "Perfil — Pomodoro Otaku",
  description: "Seu progresso de One For All: nível, streak e conquistas.",
};

export default function PerfilPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-8 px-6 py-12">
      <div className="flex w-full max-w-md flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight">Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Seu progresso de One For All — evolua a cada sessão de foco.
        </p>
      </div>

      <GamificationPanel />
    </main>
  );
}
