export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let cachedClient: MongoClient | null = null;
async function getClient() {
  if (cachedClient) return cachedClient;
  if (!uri) throw new Error('MONGODB_URI missing');
  cachedClient = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });
  await cachedClient.connect();
  return cachedClient;
}

const clean = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const doc = {
      // no email field at all
      name: clean(body?.name),                 // optional
      phone: clean(body?.phone),               // optional
      businessType: clean(body?.businessType), // optional
      message: clean(body?.message),           // optional
      source: clean(body?.source || 'site'),
      createdAt: new Date(),
    };
    // Require at least one non-empty lead field
    const hasContent = !!(doc.name || doc.phone || doc.businessType || doc.message);
    if (!hasContent) {
      return NextResponse.json({ ok: false, error: 'empty_lead' }, { status: 400 });
    }
    const client = await getClient();
    const col = client.db(process.env.DB_NAME || 'site').collection('inquiries');
    const res = await col.insertOne(doc);
    return NextResponse.json({ ok: true, id: res.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error('POST /api/inquiries failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await getClient();
    const col = client.db(process.env.DB_NAME || 'site').collection('inquiries');
    const items = await col
      .find({})
      .project({ name: 1, phone: 1, businessType: 1, message: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error('GET /api/inquiries failed', err);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
