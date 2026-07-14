import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";

interface GoogleRefreshResponse {
  id_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

async function refreshIdToken(refreshToken: string): Promise<GoogleRefreshResponse | null> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID ?? "",
      client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!response.ok) return null;
  return (await response.json()) as GoogleRefreshResponse;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    signIn: ({ profile }) => Boolean(profile?.email && profile.email_verified),

    jwt: async ({ token, account }) => {
      if (account) {
        return {
          ...token,
          idToken: account.id_token,
          refreshToken: account.refresh_token ?? token.refreshToken,
          expiresAt: account.expires_at ?? 0,
        };
      }

      const expiresAt = typeof token.expiresAt === "number" ? token.expiresAt : 0;
      if (Date.now() < (expiresAt - 60) * 1000) return token;

      const refreshToken = typeof token.refreshToken === "string" ? token.refreshToken : null;
      if (!refreshToken) return { ...token, idToken: undefined };

      const refreshed = await refreshIdToken(refreshToken);
      if (!refreshed?.id_token) return { ...token, idToken: undefined };

      return {
        ...token,
        idToken: refreshed.id_token,
        refreshToken: refreshed.refresh_token ?? refreshToken,
        expiresAt: Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600),
      };
    },

    session: ({ session, token }) => ({
      ...session,
      userId: typeof token.sub === "string" ? token.sub : "",
      idToken: typeof token.idToken === "string" ? token.idToken : undefined,
      expiresAt: typeof token.expiresAt === "number" ? token.expiresAt : 0,
    }),
  },
});
