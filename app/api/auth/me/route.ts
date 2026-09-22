import { NextResponse } from "next/server";
import { authDb } from "@/lib/auth-store";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    if (!token) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/vaniedge_session=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    if (!token) {
      return NextResponse.json({ error: "No active session." }, { status: 401 });
    }

    const user = authDb.getSessionUser(token);
    if (!user) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    const safeUser = authDb.safeUser(user);
    return NextResponse.json({ user: safeUser }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
