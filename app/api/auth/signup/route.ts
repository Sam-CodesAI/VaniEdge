import { NextResponse } from "next/server";
import { authDb } from "@/lib/auth-store";

export async function POST(req: Request) {
  try {
    const body = await req.json() as Record<string, unknown>;
    const { name, email, password, company, provider } = body as {
      name: string; email: string; password: string; company?: string; provider?: string;
    };

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Full name or organization name is required." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const { user, token } = authDb.register(
      name,
      email,
      password,
      company || "Independent Developer",
      "email"
    );

    const safeUser = authDb.safeUser(user);

    const response = NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: safeUser,
        token,
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie for sessions
    response.cookies.set("vaniedge_session", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: false, // Accessible to client-side auth state
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create account.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
