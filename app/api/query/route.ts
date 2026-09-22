import { NextRequest, NextResponse } from "next/server";
import { SutraHybridEngine, KnowledgeDocument } from "@/src/engine/sutradb";

// Shared in-memory engine singleton for Next.js edge/server runtime
const engine = new SutraHybridEngine([
  {
    id: "clinic-1",
    title: "Dr. Sharma Pediatric & Family Clinic",
    content: "Timings: Mon-Sat 9:00 AM - 7:00 PM. General consultation: ₹500. Address: 12th Main Indiranagar, Bengaluru. Phone: +91-98765-43210.",
    category: "clinic",
  },
  {
    id: "restaurant-1",
    title: "Bhojanalaya Kitchen Indiranagar",
    content: "Special North & South Indian Thali, Paneer Butter Masala, Butter Naan, Biryani. Delivery time: 25-35 mins. Min order ₹250.",
    category: "restaurant",
  },
  {
    id: "auto-1",
    title: "Apex Highway Emergency Towing & Recovery",
    content: "24/7 Roadside breakdown assistance, flat tyre fix, engine battery jumpstart. Emergency dispatch ETA: 15-20 mins. Helpline: 1800-APEX-NOW.",
    category: "auto",
  },
]);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      query?: string;
      category?: string;
      filter?: Record<string, string | number | boolean>;
      topK?: number;
      minScore?: number;
    };
    const { query, category, filter, topK, minScore } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing required 'query' field" }, { status: 400 });
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
    const body = (await request.json()) as {
      id?: string;
      title: string;
      content: string;
      category?: string;
      metadata?: Record<string, string | number | boolean>;
    };

    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: "Missing required 'title' or 'content' field" },
        { status: 400 }
      );
    }

    const docId = body.id || `doc-${Date.now()}`;
    const doc: KnowledgeDocument = {
      id: docId,
      title: body.title,
      content: body.content,
      category: body.category || "general",
      metadata: body.metadata,
    };

    const start = performance.now();
    engine.insert(doc);
    const latencyMs = +(performance.now() - start).toFixed(2);

    return NextResponse.json(
      {
        success: true,
        document: doc,
        totalDocuments: engine.size(),
        latencyMs,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  const documents = engine.exportSnapshot();
  return NextResponse.json({
    totalDocuments: documents.length,
    documents,
  });
}
