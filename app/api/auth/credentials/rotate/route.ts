import { NextResponse } from "next/server";
import { authDb } from "@/lib/auth-store";

export async function POST(req: Request) {
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
      return NextResponse.json({ error: "Unauthorized. Valid session token required." }, { status: 401 });
    }

    const user = authDb.getSessionUser(token);
    if (!user) {
      return NextResponse.json({ error: "Session expired or invalid." }, { status: 401 });
    }

    const newCredentials = authDb.rotateApiKey(user.id);

    return NextResponse.json(
      {
        success: true,
        message: "API credentials rotated successfully. Previous keys are now invalidated.",
        credentials: newCredentials,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to rotate credentials.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
