"use client";

import { useEffect } from "react";
import { useGamificationStore } from "@/stores/gamification-store";
import { OfaMeter } from "./ofa-meter";
import { StreakBadge } from "./streak-badge";
import { Achievements } from "./achievements";

export function GamificationPanel() {
  const progress = useGamificationStore((s) => s.progress);
  const hydrated = useGamificationStore((s) => s.hydrated);
  const hydrate = useGamificationStore((s) => s.hydrate);
  const sync = useGamificationStore((s) => s.sync);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const onOnline = () => sync();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [sync]);

  if (!hydrated || !progress) return null;

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <OfaMeter progress={progress} />
      <StreakBadge progress={progress} />
      <Achievements progress={progress} />
    </div>
  );
}
