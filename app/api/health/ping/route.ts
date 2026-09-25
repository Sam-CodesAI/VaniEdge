import { NextResponse } from "next/server";

export async function GET() {
  const start = Date.now();
  try {
    await fetch("https://cloudflare-dns.com/dns-query?name=twilio.com", {
      headers: { "accept": "application/dns-json" },
      signal: AbortSignal.timeout(1000)
    });
  } catch (e) {}
  const end = Date.now();
  const latency = end - start;
  
  return NextResponse.json({
    status: "ok",
    edgeLatencyMs: latency,
    timestamp: new Date().toISOString()
  });
}
