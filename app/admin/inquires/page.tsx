import React from 'react';
import { listInquiries } from '@/src/routes/inquiries';
export const dynamic = 'force-dynamic';

export default async function AdminInquiresPage() {
  let items = [] as Awaited<ReturnType<typeof listInquiries>>;
  try { items = await listInquiries(); } catch {}

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Inquiries</h1>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">No inquiries yet.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Business Type</th>
                <th className="p-3">Message</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i._id} className="border-t">
                  <td className="p-3">{i.name || '—'}</td>
                  <td className="p-3">{i.phone || '—'}</td>
                  <td className="p-3">{i.businessType || '—'}</td>
                  <td className="p-3 max-w-[420px] truncate" title={i.message || ''}>
                    {i.message || '—'}
                  </td>
                  <td className="p-3">
                    {i.createdAt ? new Date(i.createdAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
