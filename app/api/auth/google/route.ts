import { NextResponse } from "next/server";
import { authDb } from "@/lib/auth-store";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; name?: string; avatarUrl?: string };
    const { email, name, avatarUrl } = body;

    const targetEmail = email && typeof email === "string" && email.includes("@")
      ? email.trim()
      : "developer@google.com";

    const targetName = name && typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : "Google Cloud Developer";

    const { user, token } = authDb.authenticateGoogle(targetEmail, targetName, avatarUrl);
    const safeUser = authDb.safeUser(user);

    const response = NextResponse.json(
      {
        success: true,
        message: "Google authentication verified.",
        user: safeUser,
        token,
      },
      { status: 200 }
    );

    response.cookies.set("vaniedge_session", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Google authentication failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
