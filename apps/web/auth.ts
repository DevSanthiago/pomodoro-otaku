import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5279";

interface AuthResponse {
  token: string;
  expiraEm: string;
  userId: string;
  email: string;
  nomeExibicao: string;
}

export async function postAuth(
  path: string,
  body: Record<string, string>,
): Promise<AuthResponse | null> {
  const response = await fetch(`${API_URL}/auth/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) return null;
  return (await response.json()) as AuthResponse;
}

function comoSessao(auth: AuthResponse) {
  return {
    id: auth.userId,
    email: auth.email,
    name: auth.nomeExibicao,
    apiToken: auth.token,
    apiExpiraEm: Math.floor(new Date(auth.expiraEm).getTime() / 1000),
  };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: { params: { scope: "openid email profile" } },
    }),
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const senha = credentials?.senha;
        if (typeof email !== "string" || typeof senha !== "string") return null;

        const autenticado = await postAuth("login", { email, senha });
        return autenticado ? comoSessao(autenticado) : null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    jwt: async ({ token, account, user }) => {
      if (account?.provider === "google" && typeof account.id_token === "string") {
        const autenticado = await postAuth("google", { idToken: account.id_token });
        if (!autenticado) return { ...token, apiToken: undefined };
        const sessao = comoSessao(autenticado);
        return {
          ...token,
          sub: sessao.id,
          email: sessao.email,
          name: sessao.name,
          apiToken: sessao.apiToken,
          apiExpiraEm: sessao.apiExpiraEm,
        };
      }

      if (user && "apiToken" in user && typeof user.apiToken === "string") {
        return {
          ...token,
          sub: user.id,
          apiToken: user.apiToken,
          apiExpiraEm: typeof user.apiExpiraEm === "number" ? user.apiExpiraEm : 0,
        };
      }

      return token;
    },

    session: ({ session, token }) => ({
      ...session,
      userId: typeof token.sub === "string" ? token.sub : "",
      apiToken: typeof token.apiToken === "string" ? token.apiToken : undefined,
      expiresAt: typeof token.apiExpiraEm === "number" ? token.apiExpiraEm : 0,
    }),
  },
});
