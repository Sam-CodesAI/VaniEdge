import { describe, it, expect, beforeEach } from "vitest";
import { createVaniEdgeHandler } from "../src/server.js";
import { SutraHybridEngine } from "../src/engine/sutradb.js";
import { TicketDispatcher } from "../src/dispatch/tickets.js";

describe("VaniEdge Edge & Node Request Handler", () => {
  let engine: SutraHybridEngine;
  let dispatcher: TicketDispatcher;
  let handler: (request: Request) => Promise<Response>;

  beforeEach(() => {
    engine = new SutraHybridEngine();
    dispatcher = new TicketDispatcher();

    engine.insert({
      id: "clinic-1",
      title: "Dr. Sharma Pediatric Clinic",
      content: "Pediatric vaccinations, health checkups, open Monday to Saturday 9am to 7pm.",
      category: "clinic",
    });
    engine.insert({
      id: "food-1",
      title: "Bhojanalaya Kitchen Indiranagar",
      content: "Authentic North Indian thali, dal makhani, paneer butter masala delivery.",
      category: "restaurant",
    });

    handler = createVaniEdgeHandler({
      engine,
      dispatcher,
      fallbackNumber: "+18005550199",
      twilioPhoneNumber: "+18149613703",
      streamWsUrl: "wss://vani.example.com/stream",
    });
  });

  it("handles OPTIONS preflight requests with CORS headers", async () => {
    const req = new Request("http://localhost:8080/api/query", {
      method: "OPTIONS",
    });
    const res = await handler(req);

    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("returns health info on GET / and GET /health", async () => {
    const req = new Request("http://localhost:8080/health", { method: "GET" });
    const res = await handler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("application/json");

    const body = (await res.json()) as {
      service: string;
      status: string;
      sutradb: { documentsIndexed: number };
      dispatcher: { totalTickets: number };
      telephony: { fallbackNumber: string; twilioPhoneNumber: string };
    };

    expect(body.service).toBe("VaniEdge AI");
    expect(body.status).toBe("healthy");
    expect(body.sutradb.documentsIndexed).toBe(2);
    expect(body.dispatcher.totalTickets).toBe(0);
    expect(body.telephony.fallbackNumber).toBe("+18005550199");
  });

  it("generates stream TwiML on POST /voice/incoming from urlencoded form data", async () => {
    const formData = new URLSearchParams({
      CallSid: "CA_TEST_CALL_123",
      From: "+919876543210",
    });

    const req = new Request("http://localhost:8080/voice/incoming", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/xml");

    const xml = await res.text();
    expect(xml).toContain('<Stream url="wss://vani.example.com/stream">');
    expect(xml).toContain('<Parameter name="callSid" value="CA_TEST_CALL_123" />');
    expect(xml).toContain('<Parameter name="caller" value="+919876543210" />');
  });

  it("generates fallback TwiML on POST /voice/fallback", async () => {
    const req = new Request("http://localhost:8080/voice/fallback", {
      method: "POST",
    });

    const res = await handler(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/xml");

    const xml = await res.text();
    expect(xml).toContain('<Dial timeout="25" callerId="+18149613703">+18005550199</Dial>');
    expect(xml).toContain("Please hold for just a moment");
  });

  it("executes SutraDB RAG queries on POST /api/query", async () => {
    const req = new Request("http://localhost:8080/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "What time is the pediatric clinic open?",
        category: "clinic",
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    const body = (await res.json()) as {
      count: number;
      results: Array<{ document: { id: string; title: string }; fusedScore: number }>;
    };

    expect(body.count).toBeGreaterThan(0);
    expect(body.results[0].document.id).toBe("clinic-1");
  });

  it("rejects POST /api/query when query field is missing", async () => {
    const req = new Request("http://localhost:8080/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: "clinic" }),
    });

    const res = await handler(req);
    expect(res.status).toBe(400);

    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Missing required 'query' field");
  });

  it("dispatches new ticket and returns localized confirmation on POST /api/dispatch", async () => {
    const req = new Request("http://localhost:8080/api/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callerName: "Rajesh Rao",
        callerPhone: "+91-99887-55443",
        category: "clinic",
        serviceType: "General Checkup",
        details: "Slot: 3:00 PM Thursday",
        language: "hi",
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(201);

    const body = (await res.json()) as {
      success: boolean;
      ticket: {
        ticketId: string;
        callerName: string;
        smsConfirmation: string;
        language: string;
      };
    };

    expect(body.success).toBe(true);
    expect(body.ticket.callerName).toBe("Rajesh Rao");
    expect(body.ticket.smsConfirmation).toContain("वाणीEdge AI");
    expect(body.ticket.language).toBe("hi");
  });

  it("validates missing fields on POST /api/dispatch", async () => {
    const req = new Request("http://localhost:8080/api/dispatch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callerName: "Rajesh",
      }),
    });

    const res = await handler(req);
    expect(res.status).toBe(400);

    const body = (await res.json()) as { error: string };
    expect(body.error).toContain("Missing required fields");
  });

  it("retrieves and filters tickets on GET /api/tickets", async () => {
    dispatcher.createTicket({
      callerName: "Customer 1",
      callerPhone: "+91-91111-22222",
      category: "restaurant",
      serviceType: "Thali",
      details: "Delivery",
    });
    dispatcher.createTicket({
      callerName: "Patient 2",
      callerPhone: "+91-93333-44444",
      category: "clinic",
      serviceType: "Checkup",
      details: "10am",
    });

    // List all
    const reqAll = new Request("http://localhost:8080/api/tickets", { method: "GET" });
    const resAll = await handler(reqAll);
    const bodyAll = (await resAll.json()) as { count: number };
    expect(bodyAll.count).toBe(2);

    // Filter by phone
    const reqPhone = new Request("http://localhost:8080/api/tickets?phone=+919111122222", {
      method: "GET",
    });
    const resPhone = await handler(reqPhone);
    const bodyPhone = (await resPhone.json()) as { count: number };
    expect(bodyPhone.count).toBe(1);
  });

  it("returns 404 for unknown routes", async () => {
    const req = new Request("http://localhost:8080/unknown/endpoint", { method: "GET" });
    const res = await handler(req);
    expect(res.status).toBe(404);
  });
});
