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
});
