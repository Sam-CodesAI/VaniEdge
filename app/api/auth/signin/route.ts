import { NextResponse } from "next/server";
import { authDb } from "@/lib/auth-store";

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email: string; password: string };
    const { email, password } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 }
      );
    }

    const { user, token } = authDb.authenticate(email, password);
    const safeUser = authDb.safeUser(user);

    const response = NextResponse.json(
      {
        success: true,
        message: "Authenticated successfully.",
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
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
