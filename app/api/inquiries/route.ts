import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const r = await fetch(`${process.env.BACKEND_URL}/v1/inquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  return new NextResponse(await r.text(), { status: r.status, headers: { "Content-Type": "application/json" } });
}

export async function GET() {
  const r = await fetch(`${process.env.BACKEND_URL}/v1/inquiries`, { cache: "no-store" });
  return new NextResponse(await r.text(), { status: r.status, headers: { "Content-Type": "application/json" } });
}
