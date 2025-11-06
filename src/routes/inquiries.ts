export type InquiryInput = {
  name?: string;
  phone?: string;
  businessType?: string;
  message?: string;
  source?: string;
};

export type Inquiry = {
  _id: string;
  name?: string;
  phone?: string;
  businessType?: string;
  message?: string;
  createdAt?: string;
};

export async function submitInquiry(payload: InquiryInput) {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `submit_inquiry_failed_${res.status}`);
  }
  return res.json();
}

type InquiriesResponse = {
  ok?: boolean;
  error?: string;
  items?: any[];
};

export async function listInquiries(): Promise<Inquiry[]> {
  const load = async () => {
    if (typeof window === 'undefined') {
      const { GET } = await import('@/app/api/inquiries/route');
      return GET();
    }
    return fetch('/api/inquiries', { cache: 'no-store' });
  };

  const res = await load();
  if (!res.ok) {
    const err = await res.json().catch(() => ({} as InquiriesResponse));
    throw new Error(err?.error || `list_inquiries_failed_${res.status}`);
  }

  const json = (await res.json().catch(() => ({}))) as InquiriesResponse;
  return (json?.items || []).map((it: any) => ({
    _id: it._id?.toString?.() ?? it._id,
    name: it.name,
    phone: it.phone,
    businessType: it.businessType,
    message: it.message,
    createdAt: it.createdAt,
  }));
}
