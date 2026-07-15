"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/auth/actions";

interface CredentialsFormProps {
  action: (estado: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  comNome?: boolean;
}

export function CredentialsForm({ action, submitLabel, comNome = false }: CredentialsFormProps) {
  const [estado, formAction, pendente] = useActionState<FormState, FormData>(action, null);

  return (
    <form action={formAction} className="flex w-full max-w-xs flex-col gap-3">
      {comNome ? (
        <Input name="nome" type="text" placeholder="Nome" autoComplete="name" />
      ) : null}

      <Input
        name="email"
        type="email"
        placeholder="E-mail"
        autoComplete="email"
        required
      />

      <Input
        name="senha"
        type="password"
        placeholder="Senha"
        autoComplete={comNome ? "new-password" : "current-password"}
        minLength={8}
        required
      />

      {comNome ? (
        <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres.</p>
      ) : null}

      <Button type="submit" disabled={pendente} className="font-semibold">
        {pendente ? "Aguarde..." : submitLabel}
      </Button>

      {estado?.erro ? (
        <p className="text-center text-sm text-red-400" role="alert">
          {estado.erro}
        </p>
      ) : null}
    </form>
  );
}
