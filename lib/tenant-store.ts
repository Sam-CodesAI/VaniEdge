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
  private tenants: Map<string, Tenant> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    this.create({
      id: "tnt_001",
      name: "Sunrise Dental Care",
      category: "clinic",
      twilioPhone: "+1 (415) 555-0199",
      twilioSid: "AC_live_a1b2c3",
      webhookUrl: "https://vaniedge.vercel.app/api/webhooks/tnt_001",
      monthlyCalls: 342,
      status: "active",
      brandColor: "#0ea5e9", // sky-500
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=Sunrise",
    });
    this.create({
      id: "tnt_002",
      name: "Mama's Italian Kitchen",
      category: "restaurant",
      twilioPhone: "+1 (814) 961-3703",
      twilioSid: "AC_live_x8y9z0",
      webhookUrl: "https://vaniedge.vercel.app/api/webhooks/tnt_002",
      monthlyCalls: 89,
      status: "active",
      brandColor: "#ef4444", // red-500
      logoUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=Mamas",
    });
    this.create({
      id: "tnt_003",
      name: "Fastlane Towing",
      category: "auto",
      twilioPhone: "Pending Allocation",
      twilioSid: "Pending",
      webhookUrl: "Pending",
      monthlyCalls: 0,
      status: "provisioning",
    });
  }

  create(tenant: Omit<Tenant, "createdAt">): Tenant {
    const t = { ...tenant, createdAt: new Date().toISOString() };
    this.tenants.set(t.id, t);
    return t;
  }

  getAll(): Tenant[] {
    return Array.from(this.tenants.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  get(id: string): Tenant | undefined {
    return this.tenants.get(id);
  }

  delete(id: string) {
    this.tenants.delete(id);
  }
}

export const tenantStore = new TenantStore();
