import { NextRequest, NextResponse } from "next/server";
import { SutraHybridEngine, KnowledgeDocument } from "@/src/engine/sutradb";
import { supabase } from "@/lib/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      query?: string;
      category?: string;
      tenantId?: string;
      filter?: Record<string, string | number | boolean>;
      topK?: number;
      minScore?: number;
    };
    const { query, category, filter, topK, minScore, tenantId } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing required 'query' field" }, { status: 400 });
    }

    // Connect to Supabase and pull live knowledge rows
    let queryBuilder = supabase.from("sutradb_knowledge").select("*");
    if (tenantId) queryBuilder = queryBuilder.eq("tenant_id", tenantId);
    
    const { data: dbDocs, error } = await queryBuilder;
    if (error) throw new Error("Failed to sync knowledge from database");

    const engine = new SutraHybridEngine();
    
    // Load live rows into the lightning-fast Edge memory engine
    if (dbDocs) {
      for (const row of dbDocs) {
        engine.insert({
          id: row.id,
          title: row.title,
          content: row.content,
          category: row.category,
          metadata: row.metadata,
        });
      }
    }

    const start = performance.now();
    const results = engine.query(query, {
      category,
      filter,
      topK: topK ?? 3,
      minScore: minScore ?? 0,
    });
    const latencyMs = +(performance.now() - start).toFixed(2);

    return NextResponse.json({
      query,
      count: results.length,
      latencyMs,
      results,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as any;

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Missing required 'title' or 'content' field" },
        { status: 400 }
      );
    }

    const doc = {
      tenant_id: body.tenantId || null,
      title: body.title,
      content: body.content,
      category: body.category || "general",
      metadata: body.metadata,
    };

    const start = performance.now();
    const { data, error } = await supabase.from("sutradb_knowledge").insert([doc]).select().single();
    if (error) throw new Error(error.message);
    const latencyMs = +(performance.now() - start).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        document: data,
        latencyMs,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get("tenantId") || undefined;
  
  let queryBuilder = supabase.from("sutradb_knowledge").select("*").order("created_at", { ascending: false });
  if (tenantId) queryBuilder = queryBuilder.eq("tenant_id", tenantId);
  
  const { data, error } = await queryBuilder;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    totalDocuments: data.length,
    documents: data,
  });
}
