import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

export function proxy(request: NextRequest) {
  const autenticado = SESSION_COOKIES.some((name) => request.cookies.has(name));
  if (autenticado) return NextResponse.next();

  const login = new URL("/login", request.url);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/", "/tasks/:path*", "/perfil/:path*"],
};
