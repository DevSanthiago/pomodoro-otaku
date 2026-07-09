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
    <header
      className="flex items-center justify-between gap-2 py-3"
      style={{
        paddingTop: "max(0.75rem, env(safe-area-inset-top))",
        paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
        paddingRight: "max(1.25rem, env(safe-area-inset-right))",
      }}
    >
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
                "inline-flex size-10 items-center justify-center rounded-lg transition-colors",
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
