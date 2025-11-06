export type Inquiry = {
  _id?: string;
  name?: string;
  phone?: string;
  businessType?: string;
  message?: string;
  createdAt?: string;
};

export async function fetchInquiries(params: { status?: string } = {}) {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const url = `/api/inquiries${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch inquiries: ${res.status}`);
  const data = await res.json();
  // accept either shape { items: [...] } or { inquiries: [...] }
  return (data.items ?? data.inquiries ?? []) as Inquiry[];
}

// back-compat alias
export const listInquiries = fetchInquiries;

export async function submitInquiry(payload: {
  name?: string;
  phone?: string;
  businessType?: string;
  message?: string;
  source?: string;
}) {
  const res = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`submitInquiry failed: ${res.status} ${errText}`);
  }
  return res.json();
}
