import { NextRequest, NextResponse } from "next/server";
import { tenantStore } from "@/lib/tenant-store";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const tenant = tenantStore.get(resolvedParams.id);
    if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await req.json()) as any;
    
    // Update fields
    if (body.brandColor !== undefined) tenant.brandColor = body.brandColor;
    if (body.logoUrl !== undefined) tenant.logoUrl = body.logoUrl;
    if (body.name !== undefined) tenant.name = body.name;

    return NextResponse.json({ tenant });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tenant = tenantStore.get(resolvedParams.id);
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ tenant });
}
