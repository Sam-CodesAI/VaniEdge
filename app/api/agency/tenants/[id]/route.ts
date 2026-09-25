import { NextRequest, NextResponse } from "next/server";
import { tenantStore } from "@/lib/tenant-store";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = (await req.json()) as any;
    
    // Update fields
    const updates: any = {};
    if (body.brandColor !== undefined) updates.brandColor = body.brandColor;
    if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
    if (body.name !== undefined) updates.name = body.name;

    const tenant = await tenantStore.update(resolvedParams.id, updates);
    if (!tenant) return NextResponse.json({ error: "Failed to update tenant" }, { status: 400 });

    return NextResponse.json({ tenant });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tenant" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const tenant = await tenantStore.get(resolvedParams.id);
  if (!tenant) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ tenant });
}
