import { NextRequest, NextResponse } from "next/server";
import { MetricsCollector } from "@/src/telemetry/metrics";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format");
  const acceptsPrometheus = request.headers.get("Accept")?.includes("text/plain");

  if (format === "prometheus" || acceptsPrometheus) {
    const text = MetricsCollector.getInstance().toPrometheus();
    return new Response(text, {
      headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
    });
  }

  const snapshot = MetricsCollector.getInstance().getSnapshot();
  return NextResponse.json(snapshot);
}
