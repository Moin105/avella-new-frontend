// src/routes/inquiries.ts
// Client-safe helper: never import server modules here.
export type InquiryPayload = {
  name?: string;
  phone?: string;
  businessType?: string;
  message?: string;
  source?: string; // e.g., "contact_page"
};

export async function submitInquiry(payload: InquiryPayload) {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`submitInquiry failed: ${res.status} ${errText}`);
  }
  return res.json();
}

export type Inquiry = {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  source?: string;
  businessType?: string;
  createdAt?: string;
  status?: 'new' | 'read' | 'archived';
};

export async function fetchInquiries(params: { status?: string } = {}) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const url = `/api/inquiries${qs ? `?${qs}` : ''}`;

  const res = await fetch(url, { method: 'GET', cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch inquiries: ${res.status}`);
  const data = await res.json();
  return (data?.inquiries ?? []) as Inquiry[];
}

// Back-compat so existing imports keep working:
export const listInquiries = fetchInquiries;
