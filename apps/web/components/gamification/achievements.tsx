"use client";

import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONQUISTAS, type Progress } from "@/lib/gamification";

export function Achievements({ progress }: { progress: Progress }) {
  const desbloqueadas = new Set(progress.conquistasDesbloqueadas);

  return (
    <div className="flex w-full flex-col gap-2">
      <span className="text-sm font-medium">
        Conquistas ({desbloqueadas.size}/{CONQUISTAS.length})
      </span>
      <ul className="grid grid-cols-2 gap-2">
        {CONQUISTAS.map((conquista) => {
          const ativa = desbloqueadas.has(conquista.id);
          return (
            <li
              key={conquista.id}
              className={cn(
                "flex items-start gap-2 rounded-lg border p-2",
                ativa ? "border-primary/50" : "border-border opacity-60",
              )}
            >
              {ativa ? (
                <Award className="mt-0.5 size-4 shrink-0 text-primary" />
              ) : (
                <Lock className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="text-xs font-medium">{conquista.nome}</span>
                <span className="text-[0.7rem] text-muted-foreground">
                  {conquista.descricao}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
