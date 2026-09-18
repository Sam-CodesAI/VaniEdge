/**
 * VaniEdge AI: Autonomous Appointment & Order Dispatch Engine
 */

export interface TicketRequest {
  callerName: string;
  callerPhone: string;
  category: "clinic" | "restaurant" | "auto" | "general";
  serviceType: string;
  details: string;
  priority?: "STANDARD" | "HIGH" | "URGENT";
}

export interface TicketRecord {
  ticketId: string;
  timestamp: string;
  callerName: string;
  callerPhone: string;
  category: string;
  serviceType: string;
  details: string;
  status: "CONFIRMED" | "DISPATCHED" | "ESCALATED";
  priority: "STANDARD" | "HIGH" | "URGENT";
  smsConfirmation: string;
  checksum: string;
}

export function generateChecksum(payload: string): string {
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
}

export class TicketDispatcher {
  private tickets: Map<string, TicketRecord> = new Map();

  public createTicket(req: TicketRequest): TicketRecord {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = req.category.slice(0, 3).toUpperCase();
    const ticketId = `VANI-${prefix}-${randomSuffix}`;
    const timestamp = new Date().toISOString();

    const checksum = generateChecksum(`${ticketId}:${req.callerPhone}:${timestamp}`);

    let sms = "";
    if (req.category === "clinic") {
      sms = `[VaniEdge AI] Appointment confirmed for ${req.callerName} at Dr. Sharma Clinic. Ticket: ${ticketId}. Slot: ${req.details}.`;
    } else if (req.category === "restaurant") {
      sms = `[VaniEdge AI] Bhojanalaya Kitchen: Order confirmed (${req.serviceType}). Ticket: ${ticketId}. Estimated delivery: 25-35 mins.`;
    } else {
      sms = `[VaniEdge AI] Apex Rescue: Recovery vehicle dispatched for ${req.serviceType}. Ticket: ${ticketId}. ETA: 18 mins.`;
    }

    const record: TicketRecord = {
      ticketId,
      timestamp,
      callerName: req.callerName,
      callerPhone: req.callerPhone,
      category: req.category,
      serviceType: req.serviceType,
      details: req.details,
      status: req.priority === "URGENT" ? "ESCALATED" : "CONFIRMED",
      priority: req.priority || "STANDARD",
      smsConfirmation: sms,
      checksum,
    };

    this.tickets.set(ticketId, record);
    return record;
  }

  public getTicket(ticketId: string): TicketRecord | undefined {
    return this.tickets.get(ticketId);
  }

  public listTickets(): TicketRecord[] {
    return Array.from(this.tickets.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}
