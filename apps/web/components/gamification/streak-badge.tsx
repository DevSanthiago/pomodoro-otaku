"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Progress } from "@/lib/gamification";

export function StreakBadge({ progress }: { progress: Progress }) {
  const ativo = progress.streakAtual > 0;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
      <Flame className={cn("size-4", ativo ? "text-orange-500" : "text-muted-foreground")} />
      <span className="font-medium">
        {progress.streakAtual} {progress.streakAtual === 1 ? "dia" : "dias"} de treino
      </span>
      <span className="ml-auto text-xs text-muted-foreground">
        recorde {progress.streakRecorde}
      </span>
    </div>
  );
}
