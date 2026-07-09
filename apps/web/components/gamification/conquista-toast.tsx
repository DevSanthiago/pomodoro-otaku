"use client";

import { useEffect } from "react";
import { Award } from "lucide-react";
import { useGamificationStore } from "@/stores/gamification-store";

export function ConquistaToast() {
  const nova = useGamificationStore((s) => s.novaConquista);
  const limpar = useGamificationStore((s) => s.limparNovaConquista);

  useEffect(() => {
    if (!nova) return;
    const id = setTimeout(limpar, 4000);
    return () => clearTimeout(id);
  }, [nova, limpar]);

  if (!nova) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-2 rounded-lg border border-primary/50 bg-background px-4 py-2 shadow-lg">
        <Award className="size-5 text-primary" />
        <div className="flex flex-col">
          <span className="text-sm font-bold">Conquista desbloqueada!</span>
          <span className="text-xs text-muted-foreground">
            {nova.nome} — {nova.descricao}
          </span>
        </div>
      </div>
    </div>
  );
}
