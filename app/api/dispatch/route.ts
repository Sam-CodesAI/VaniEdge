import { NextRequest, NextResponse } from "next/server";
import { TicketDispatcher, TicketRequest } from "@/src/dispatch/tickets";

// Shared dispatcher singleton across API requests
const dispatcher = new TicketDispatcher();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TicketRequest;

    if (!body.callerName || !body.callerPhone || !body.category || !body.serviceType) {
      return NextResponse.json(
        { error: "Missing required fields (callerName, callerPhone, category, serviceType)" },
        { status: 400 }
      );
    }

    const ticket = dispatcher.createTicket(body);
    return NextResponse.json({ success: true, ticket }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") || undefined;
  const category = searchParams.get("category") || undefined;
  const status = searchParams.get("status") || undefined;

  const tickets = dispatcher.findTickets({ phone, category, status });
  return NextResponse.json({ count: tickets.length, tickets });
}
