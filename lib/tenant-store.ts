import { supabase } from "./supabase-client";

export interface Tenant {
  id: string;
  name: string;
  category: string;
  twilioPhone: string;
  twilioSid: string;
  webhookUrl: string;
  monthlyCalls: number;
  status: "active" | "provisioning" | "suspended";
  createdAt: string;
  logoUrl?: string;
  brandColor?: string;
}

class TenantStore {
  async create(tenant: Omit<Tenant, "createdAt">): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from("tenants")
      .insert([tenant])
      .select()
      .single();
    if (error) {
      console.error("Error creating tenant:", error);
      return null;
    }
    return data as Tenant;
  }

  async getAll(): Promise<Tenant[]> {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching tenants:", error);
      return [];
    }
    return data as Tenant[];
  }

  async get(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      return null;
    }
    return data as Tenant;
  }

  async update(id: string, updates: Partial<Tenant>): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from("tenants")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error updating tenant:", error);
      return null;
    }
    return data as Tenant;
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("tenants").delete().eq("id", id);
    return !error;
  }
}

export const tenantStore = new TenantStore();
