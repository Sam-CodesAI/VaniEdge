import { NextRequest, NextResponse } from "next/server";
import { SutraHybridEngine } from "@/src/engine/sutradb";

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

    const results = engine.query(query, {
      category,
      filter,
      topK: topK ?? 3,
      minScore: minScore ?? 0,
    });

    return NextResponse.json({ query, count: results.length, results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
