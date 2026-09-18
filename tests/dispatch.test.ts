import { describe, it, expect } from "vitest";
import { TicketDispatcher, generateChecksum } from "../src/dispatch/tickets.js";

describe("Autonomous Ticket Dispatcher", () => {
  it("generates formatted tickets with checksums and customized SMS", () => {
    const dispatcher = new TicketDispatcher();
    const ticket = dispatcher.createTicket({
      callerName: "Aarav Sharma",
      callerPhone: "+91-98765-11223",
      category: "clinic",
      serviceType: "Pediatric Consultation",
      details: "Slot: 11:30 AM tomorrow",
    });

    expect(ticket.ticketId).toMatch(/^VANI-CLI-\d{4}$/);
    expect(ticket.status).toBe("CONFIRMED");
    expect(ticket.smsConfirmation).toContain("Dr. Sharma Clinic");
    expect(ticket.checksum).toHaveLength(8);

    const retrieved = dispatcher.getTicket(ticket.ticketId);
    expect(retrieved?.callerName).toBe("Aarav Sharma");
  });

  it("escalates urgent roadside emergencies immediately", () => {
    const dispatcher = new TicketDispatcher();
    const ticket = dispatcher.createTicket({
      callerName: "Vikram Malhotra",
      callerPhone: "+91-98111-99887",
      category: "auto",
      serviceType: "Engine Fire / Highway Breakdown",
      details: "Mile marker 44",
      priority: "URGENT",
    });

    expect(ticket.status).toBe("ESCALATED");
    expect(ticket.priority).toBe("URGENT");
  });

  it("generates restaurant food delivery SMS and lists tickets properly", () => {
    const dispatcher = new TicketDispatcher();
    const t1 = dispatcher.createTicket({
      callerName: "Pooja Hegde",
      callerPhone: "+91-99887-11223",
      category: "restaurant",
      serviceType: "2x North Indian Thali",
      details: "Delivery to Indiranagar 12th Main",
    });

    expect(t1.smsConfirmation).toContain("Bhojanalaya Kitchen");
    expect(t1.smsConfirmation).toContain("2x North Indian Thali");
    expect(t1.status).toBe("CONFIRMED");

    const list = dispatcher.listTickets();
    expect(list.length).toBe(1);
    expect(list[0].ticketId).toBe(t1.ticketId);
  });

  it("produces deterministic and distinct checksums for differing inputs", () => {
    const sum1 = generateChecksum("TKT-CLI-1001:+91-9876543210:2026-09-18T10:00:00Z");
    const sum2 = generateChecksum("TKT-CLI-1001:+91-9876543210:2026-09-18T10:00:00Z");
    const sum3 = generateChecksum("TKT-CLI-1002:+91-9876543210:2026-09-18T10:00:00Z");

    expect(sum1).toBe(sum2);
    expect(sum1).not.toBe(sum3);
    expect(sum1).toHaveLength(8);
  });
});
