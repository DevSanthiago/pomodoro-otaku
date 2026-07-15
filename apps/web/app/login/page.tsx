import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { entrarComSenha } from "@/lib/auth/actions";
import { CredentialsForm } from "@/components/auth/credentials-form";
import { GoogleButton } from "@/components/auth/google-button";
import { OfaEmblem } from "@/components/gamification/ofa-emblem";

export default async function LoginPage() {
  const session = await auth();
  if (session?.userId) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pb-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <OfaEmblem nivel={3} size={80} />
        <h1 className="text-2xl font-bold tracking-tight">Pomodoro Otaku</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Entre para acumular controle de One For All e sincronizar seu progresso.
        </p>
      </div>

      <CredentialsForm action={entrarComSenha} submitLabel="Entrar" />

      <div className="flex w-full max-w-xs items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">ou</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />

      <p className="text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link href="/registro" className="font-medium text-foreground underline">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
