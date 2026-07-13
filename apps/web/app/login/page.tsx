import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { entrarComGoogle } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { OfaEmblem } from "@/components/gamification/ofa-emblem";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  if (session?.userId) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <OfaEmblem nivel={3} size={96} />
        <h1 className="text-2xl font-bold tracking-tight">Pomodoro Otaku</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Entre para acumular controle de One For All e sincronizar seu progresso.
        </p>
      </div>

      <form action={entrarComGoogle}>
        <Button type="submit" size="lg" className="font-semibold">
          Entrar com Google
        </Button>
      </form>

      {error ? (
        <p className="max-w-xs text-center text-sm text-red-400">
          Essa conta não tem acesso ao app.
        </p>
      ) : null}
    </main>
  );
}
