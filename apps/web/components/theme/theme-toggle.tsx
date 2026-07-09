"use client";

import { useReducer } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/lib/use-hydrated";

export function ThemeToggle() {
  const hydrated = useHydrated();
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  function toggle() {
    const proximo = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", proximo);
    try {
      localStorage.setItem("theme", proximo ? "dark" : "light");
    } catch {
      // localStorage indisponível: alterna só na sessão
    }
    rerender();
  }

  const dark = hydrated && document.documentElement.classList.contains("dark");

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      className="cursor-pointer"
    >
      {!hydrated ? <span className="size-4" /> : dark ? <Moon /> : <Sun />}
    </Button>
  );
}
