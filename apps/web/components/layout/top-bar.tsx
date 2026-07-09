"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Timer, ListTodo, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const LINKS = [
  { href: "/", label: "Timer", icon: Timer },
  { href: "/tasks", label: "Tarefas", icon: ListTodo },
  { href: "/perfil", label: "Perfil", icon: User },
];

export function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between px-5 py-3">
      <nav className="flex items-center gap-1">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-lg transition-colors",
                ativo
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </Link>
          );
        })}
      </nav>
      <ThemeToggle />
    </header>
  );
}
