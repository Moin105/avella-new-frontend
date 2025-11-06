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
