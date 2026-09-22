import { NextRequest, NextResponse } from "next/server";
import { TicketDispatcher, TicketRequest } from "@/src/dispatch/tickets";

// Shared dispatcher singleton across API requests
const dispatcher = new TicketDispatcher();

// Seed initial production demo tickets for BridgeView portal
if (dispatcher.count() === 0) {
  dispatcher.createTicket({
    callerName: "Rahul Verma",
    callerPhone: "+91-98765-43210",
    category: "clinic",
    serviceType: "Urgent Pediatric Consultation",
    details: "Severe fever since last night. Requested appointment with Dr. Sharma at 4:30 PM.",
    priority: "URGENT",
    language: "en",
  });
  dispatcher.createTicket({
    callerName: "Priya Sundaram",
    callerPhone: "+91-98450-11223",
    category: "restaurant",
    serviceType: "Dinner Table Reservation (4 Guests)",
    details: "Window table requested for 8:00 PM tonight. North Indian thali and desserts.",
    priority: "STANDARD",
    language: "kn",
  });
  dispatcher.createTicket({
    callerName: "Amitabh Sen",
    callerPhone: "+1-814-555-0199",
    category: "auto",
    serviceType: "Highway Battery Jumpstart & Towing",
    details: "Vehicle stalled near Indiranagar flyover. Flat battery assistance required.",
    priority: "HIGH",
    language: "en",
  });
}

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
