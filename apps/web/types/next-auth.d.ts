import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    userId: string;
    apiToken?: string;
    expiresAt: number;
  }

  interface User {
    apiToken?: string;
    apiExpiraEm?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    apiToken?: string;
    apiExpiraEm?: number;
  }
}
