import { describe, it, expect } from "vitest";
import {
  TicketDispatcher,
  generateChecksum,
  generateSmsConfirmation,
} from "../src/dispatch/tickets.js";

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

  it("generates localized SMS confirmations in Hindi and Kannada", () => {
    // Hindi clinic confirmation
    const hiClinic = generateSmsConfirmation(
      "clinic",
      "रोहन गुप्ता",
      "दंत चिकित्सा",
      "शाम 5:00 बजे",
      "VANI-CLI-1001",
      "hi"
    );
    expect(hiClinic).toContain("वाणीEdge AI");
    expect(hiClinic).toContain("डॉ. शर्मा क्लिनिक");
    expect(hiClinic).toContain("रोहन गुप्ता के लिए अपॉइंटमेंट कन्फर्म");

    // Hindi restaurant confirmation
    const hiRestaurant = generateSmsConfirmation(
      "restaurant",
      "प्रिया",
      "2x पनीर टिक्का",
      "घर का पता",
      "VANI-RES-2002",
      "hi"
    );
    expect(hiRestaurant).toContain("भोजनालय: आर्डर कन्फर्म");

    // Kannada clinic confirmation
    const knClinic = generateSmsConfirmation(
      "clinic",
      "ಸುರೇಶ್ ಕುಮಾರ್",
      "ಸಾಮಾನ್ಯ ತಪಾಸಣೆ",
      "ಬೆಳಿಗ್ಗೆ 10:00",
      "VANI-CLI-3003",
      "kn"
    );
    expect(knClinic).toContain("ವಾಣಿEdge AI");
    expect(knClinic).toContain("ಡಾ. ಶರ್ಮಾ ಕ್ಲಿನಿಕ್");
    expect(knClinic).toContain("ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ");

    // Kannada auto recovery confirmation
    const knAuto = generateSmsConfirmation(
      "auto",
      "ಮಹೇಶ್",
      "ಟೋಯಿಂಗ್ ಸೇವೆ",
      "ಎಂ.ಜಿ ರಸ್ತೆ",
      "VANI-AUT-4004",
      "kn"
    );
    expect(knAuto).toContain("ಅಪೆಕ್ಸ್ ರೆಸ್ಕ್ಯೂ");
  });

  it("normalizes phone numbers and retrieves tickets by phone", () => {
    const dispatcher = new TicketDispatcher();
    dispatcher.createTicket({
      callerName: "Ramesh",
      callerPhone: "+91-98765-43210",
      category: "clinic",
      serviceType: "Checkup",
      details: "Slot: 10 AM",
    });
    dispatcher.createTicket({
      callerName: "Ramesh",
      callerPhone: "+91 98765 43210",
      category: "restaurant",
      serviceType: "Lunch",
      details: "Delivery",
    });
    dispatcher.createTicket({
      callerName: "Sita",
      callerPhone: "+91-91234-56789",
      category: "auto",
      serviceType: "Tire",
      details: "Highway",
    });

    const results = dispatcher.getTicketsByPhone("+919876543210");
    expect(results.length).toBe(2);
    expect(results[0].callerName).toBe("Ramesh");
    expect(results[1].callerName).toBe("Ramesh");
  });

  it("updates ticket status with timestamped audit notes", () => {
    const dispatcher = new TicketDispatcher();
    const ticket = dispatcher.createTicket({
      callerName: "Ananya",
      callerPhone: "+91-98888-77777",
      category: "clinic",
      serviceType: "Consultation",
      details: "Tomorrow morning",
    });

    const updated = dispatcher.updateTicketStatus(
      ticket.ticketId,
      "DISPATCHED",
      "Nurse assigned to consultation room 2"
    );
    expect(updated).toBe(true);

    const record = dispatcher.getTicket(ticket.ticketId);
    expect(record?.status).toBe("DISPATCHED");
    expect(record?.notes?.length).toBe(1);
    expect(record?.notes?.[0]).toContain("Nurse assigned to consultation room 2");

    // Non-existent ticket returns false
    expect(dispatcher.updateTicketStatus("VANI-NONEXISTENT", "COMPLETED")).toBe(false);
  });

  it("filters tickets by category and status", () => {
    const dispatcher = new TicketDispatcher();
    dispatcher.createTicket({
      callerName: "Patient A",
      callerPhone: "+91-90000-00001",
      category: "clinic",
      serviceType: "Dental",
      details: "10am",
    });
    dispatcher.createTicket({
      callerName: "Customer B",
      callerPhone: "+91-90000-00002",
      category: "restaurant",
      serviceType: "Dosa",
      details: "11am",
    });

    const clinicTickets = dispatcher.findTickets({ category: "clinic" });
    expect(clinicTickets.length).toBe(1);
    expect(clinicTickets[0].callerName).toBe("Patient A");

    const noneFound = dispatcher.findTickets({ status: "CANCELLED" });
    expect(noneFound.length).toBe(0);
  });

  it("supports snapshot export, import, and total count tracking", () => {
    const dispatcher = new TicketDispatcher();
    dispatcher.createTicket({
      callerName: "Doc Test",
      callerPhone: "+91-90000-11111",
      category: "clinic",
      serviceType: "Cardiology",
      details: "9am",
    });
    expect(dispatcher.count()).toBe(1);

    const snapshot = dispatcher.exportSnapshot();
    expect(snapshot.length).toBe(1);

    const newDispatcher = new TicketDispatcher();
    newDispatcher.importSnapshot(snapshot);
    expect(newDispatcher.count()).toBe(1);
    expect(newDispatcher.getTicket(snapshot[0].ticketId)?.callerName).toBe("Doc Test");
  });
});
