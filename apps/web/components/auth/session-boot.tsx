"use client";

import { useEffect } from "react";
import { ensureOwner } from "@/lib/db";
import { getSessionToken, userIdConhecido } from "@/lib/auth/token";
import { useGamificationStore } from "@/stores/gamification-store";

export function SessionBoot() {
  const hydrate = useGamificationStore((state) => state.hydrate);

  useEffect(() => {
    const preparar = async () => {
      const token = await getSessionToken();
      const userId = token?.userId ?? userIdConhecido();
      if (!userId) return;
      await ensureOwner(userId);
      await hydrate();
    };
    void preparar();
  }, [hydrate]);

  return null;
}
