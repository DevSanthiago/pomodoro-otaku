"use client";

import { OfaEmblem } from "./ofa-emblem";
import type { Progress } from "@/lib/gamification";

export function CharacterCard({ progress }: { progress: Progress }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border p-6">
      <OfaEmblem nivel={progress.nivel} />
      <div className="flex flex-col items-center gap-0.5 text-center">
        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Nível {progress.nivel}
        </span>
        <span className="text-lg font-bold tracking-tight">{progress.personagemAtual}</span>
      </div>
    </div>
  );
}
