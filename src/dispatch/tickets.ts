import { supabase } from "@/lib/supabase-client";
import * as crypto from "crypto";

export type TicketPriority = "STANDARD" | "URGENT" | "CRITICAL";
export type TicketStatus = "PENDING" | "CONFIRMED" | "DISPATCHED" | "ESCALATED" | "RESOLVED";

export interface TicketRequest {
  callerName: string;
  callerPhone: string;
  category: string;
  serviceType: string;
  details: string;
  priority?: TicketPriority;
  language?: string;
  metadata?: Record<string, string | number | boolean>;
  tenantId?: string;
}

export interface TicketRecord {
  id?: string;
  tenant_id?: string | null;
  ticketId: string;
  timestamp: string;
  callerName: string;
  callerPhone: string;
  category: string;
  serviceType: string;
  details: string;
  status: TicketStatus;
  priority: TicketPriority;
  language: string;
  smsConfirmation: string;
  checksum: string;
  notes?: string[];
  metadata?: Record<string, string | number | boolean>;
}

export function generateChecksum(payload: string): string {
  return crypto.createHash("sha256").update(payload).digest("hex").substring(0, 8).toUpperCase();
}

export type SupportedLanguage = "en" | "kn" | "es" | "hi";
export function generateSmsConfirmation() { return ""; }
export function phoneMatches() { return false; }
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export class TicketDispatcher {
  public async createTicket(req: TicketRequest): Promise<TicketRecord | null> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = req.category.slice(0, 3).toUpperCase();
    const ticketId = `VANI-${prefix}-${randomSuffix}`;
    const timestamp = new Date().toISOString();
    const language = req.language || "en";

    const checksum = generateChecksum(`${ticketId}:${req.callerPhone}:${timestamp}`);

    const record: TicketRecord = {
      tenant_id: req.tenantId || null,
      ticketId,
      timestamp,
      callerName: req.callerName,
      callerPhone: req.callerPhone,
      category: req.category,
      serviceType: req.serviceType,
      details: req.details,
      status: req.priority === "URGENT" ? "ESCALATED" : "CONFIRMED",
      priority: req.priority || "STANDARD",
      language,
      smsConfirmation: "SMS Confirmed.",
      checksum,
      notes: [],
      metadata: req.metadata,
    };

    const { data, error } = await supabase
      .from("dispatch_tickets")
      .insert([{
        tenant_id: record.tenant_id,
        ticket_id: record.ticketId,
        caller_name: record.callerName,
        caller_phone: record.callerPhone,
        category: record.category,
        service_type: record.serviceType,
        details: record.details,
        priority: record.priority,
        language: record.language,
        status: record.status
      }])
      .select()
      .single();

    if (error) {
      console.error("Error creating ticket:", error);
      return null;
    }

    // We merge the DB result back into the frontend type
    return { ...record, id: data.id };
  }

  public async getTicket(ticketId: string): Promise<TicketRecord | null> {
    const { data, error } = await supabase
      .from("dispatch_tickets")
      .select("*")
      .eq("ticket_id", ticketId)
      .single();
    if (error) return null;
    return this.mapToRecord(data);
  }

  public async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<boolean> {
    const { error } = await supabase
      .from("dispatch_tickets")
      .update({ status })
      .eq("ticket_id", ticketId);
    return !error;
  }

  public async findTickets(filter: { category?: string; status?: string; phone?: string; tenantId?: string }): Promise<TicketRecord[]> {
    let query = supabase.from("dispatch_tickets").select("*").order("created_at", { ascending: false });
    
    if (filter.category) query = query.eq("category", filter.category);
    if (filter.status) query = query.eq("status", filter.status);
    if (filter.phone) query = query.eq("caller_phone", filter.phone);
    if (filter.tenantId) query = query.eq("tenant_id", filter.tenantId);

    const { data, error } = await query;
    if (error) return [];
    
    return data.map(this.mapToRecord);
  }

  public async count(): Promise<number> {
    const { count, error } = await supabase.from("dispatch_tickets").select("*", { count: 'exact', head: true });
    return count || 0;
  }

  public async listTickets(): Promise<TicketRecord[]> {
    const { data, error } = await supabase
      .from("dispatch_tickets")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) return [];
    return data.map(this.mapToRecord);
  }

  private mapToRecord(row: any): TicketRecord {
    return {
      id: row.id,
      tenant_id: row.tenant_id,
      ticketId: row.ticket_id,
      timestamp: row.created_at,
      callerName: row.caller_name,
      callerPhone: row.caller_phone,
      category: row.category,
      serviceType: row.service_type,
      details: row.details,
      status: row.status as TicketStatus,
      priority: row.priority as TicketPriority,
      language: row.language,
      smsConfirmation: "SMS Confirmed.",
      checksum: "",
    };
  }
}
