import { NextRequest, NextResponse } from "next/server";
import { TicketDispatcher } from "@/src/dispatch/tickets";

const dispatcher = new TicketDispatcher();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") || "all";
  const tenantId = searchParams.get("tenantId") || undefined;

  let records = [];
  if (filter === "all") {
    records = await dispatcher.findTickets({ tenantId });
  } else {
    records = await dispatcher.findTickets({ category: filter, tenantId });
  }

  return NextResponse.json({ tickets: records });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as any;
    
    const record = await dispatcher.createTicket({
      callerName: body.callerName || "Unknown Caller",
      callerPhone: body.callerPhone || "+1-000-000-0000",
      category: body.category || "general",
      serviceType: body.serviceType || "Inbound Query",
      details: body.details || "",
      priority: body.priority || "STANDARD",
      language: body.language || "en",
      tenantId: body.tenantId || null
    });

    if (!record) throw new Error("Failed to create ticket");

    return NextResponse.json({ success: true, ticket: record }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Dispatch failed" }, { status: 500 });
  }
}
