"use server";

import { AuthError } from "next-auth";
import { signIn, signOut, postAuth } from "@/auth";

export type FormState = { erro: string } | null;

export async function entrarComGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function sair() {
  await signOut({ redirectTo: "/login" });
}

export async function entrarComSenha(_estado: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");

  try {
    await signIn("credentials", { email, senha, redirectTo: "/" });
    return null;
  } catch (error) {
    if (error instanceof AuthError) return { erro: "E-mail ou senha inválidos" };
    throw error;
  }
}

export async function registrar(_estado: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const senha = String(formData.get("senha") ?? "");
  const nome = String(formData.get("nome") ?? "");

  const criado = await postAuth("register", { email, senha, nome });
  if (!criado) {
    return { erro: "Não foi possível criar a conta. O e-mail pode já estar cadastrado." };
  }

  try {
    await signIn("credentials", { email, senha, redirectTo: "/" });
    return null;
  } catch (error) {
    if (error instanceof AuthError) return { erro: "Conta criada, mas o login falhou. Tente entrar." };
    throw error;
  }
}
