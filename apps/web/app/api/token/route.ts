import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if (!session?.idToken || !session.userId) {
    return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  }

  return NextResponse.json(
    {
      userId: session.userId,
      idToken: session.idToken,
      expiresAt: session.expiresAt,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
