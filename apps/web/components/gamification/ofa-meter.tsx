"use client";

import { Zap } from "lucide-react";
import { ofaPercent, proximoTier, tierParaXp, type Progress } from "@/lib/gamification";

export function OfaMeter({ progress }: { progress: Progress }) {
  const percent = Math.round(ofaPercent(progress.xpTotal));
  const tier = tierParaXp(progress.xpTotal);
  const proximo = proximoTier(progress.xpTotal);
  const fill = proximo
    ? (progress.xpTotal - tier.xpMinimo) / (proximo.xpMinimo - tier.xpMinimo)
    : 1;

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Zap className="size-4 text-primary" />
          {tier.nome}
        </span>
        <span className="text-sm font-bold whitespace-nowrap">One For All: {percent}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.round(fill * 100)}%` }}
        />
      </div>
      <div className="flex justify-between gap-2 text-xs text-muted-foreground">
        <span>{progress.xpTotal} XP</span>
        {proximo ? (
          <span>faltam {proximo.xpMinimo - progress.xpTotal} XP p/ {proximo.nome}</span>
        ) : (
          <span>controle máximo</span>
        )}
      </div>
    </div>
  );
}
