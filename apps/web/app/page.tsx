import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-6xl" aria-hidden>
          🍅
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Pomodoro Anime
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Foque como um protagonista. Ganhe XP, mantenha o streak e evolua seu
          personagem a cada ciclo concluído.
        </p>
      </div>

      <Button size="lg" disabled>
        Timer em breve
      </Button>

      <p className="text-xs text-muted-foreground">
        Setup inicial · PWA instalável
      </p>
    </main>
  );
}
