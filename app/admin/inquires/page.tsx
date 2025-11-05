'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import {
  Building2,
  CalendarClock,
  Loader2,
  Mail,
  Phone,
  RefreshCcw,
  Search,
  Tag,
  MessageCircle,
  CheckCircle2,
  Archive,
} from 'lucide-react';

interface Inquiry {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  business_name?: string | null;
  subject?: string | null;
  message?: string | null;
  status?: 'new' | 'reviewed' | 'responded' | 'archived';
  source?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  viewed_at?: string | null;
}

type InquiryStatus = NonNullable<Inquiry['status']>;

const statusLabels: Record<InquiryStatus, string> = {
  new: 'New',
  reviewed: 'Reviewed',
  responded: 'Responded',
  archived: 'Archived',
};

const statusStyles: Record<InquiryStatus, string> = {
  new: 'bg-red-100 text-red-700 border border-red-200',
  reviewed: 'bg-amber-100 text-amber-800 border border-amber-200',
  responded: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  archived: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

const getFullName = (inquiry: Inquiry) => {
  const first = inquiry.first_name || '';
  const last = inquiry.last_name || '';
  const fullName = `${first} ${last}`.trim();
  return fullName || 'Unnamed contact';
};

const normalizeStatus = (status?: Inquiry['status']): InquiryStatus => {
  if (!status) return 'new';
  if (['reviewed', 'responded', 'archived'].includes(status)) {
    return status as InquiryStatus;
  }
  return 'new';
};

export default function InquiresPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InquiryStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Inquiry[]>('/admin/inquiries/');
      if (response.success && Array.isArray(response.data)) {
        setInquiries(response.data);
      } else {
        throw new Error(response.error || 'Failed to load inquiries');
      }
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
      setError('Unable to load inquiries from the server. Please try again.');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('admin_inquiries_last_viewed', new Date().toISOString());
    }
  }, []);

  const handleStatusChange = async (inquiryId: string, status: InquiryStatus) => {
    try {
      setUpdatingId(inquiryId);
      const response = await apiClient.put(`/admin/inquiries/${inquiryId}/status/`, { status });
      if (!response.success) {
        throw new Error(response.error || 'Unable to update inquiry status');
      }
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.id === inquiryId
            ? {
                ...inquiry,
                status,
                updated_at: new Date().toISOString(),
                viewed_at: inquiry.viewed_at || new Date().toISOString(),
              }
            : inquiry
        )
      );
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      setError('Unable to update the inquiry right now. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const markAllAsReviewed = async () => {
    try {
      const response = await apiClient.post('/admin/inquiries/mark-read/');
      if (!response.success) {
        throw new Error(response.error || 'Unable to mark inquiries as viewed');
      }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('admin_inquiries_last_viewed', new Date().toISOString());
      }
      setInquiries(prev =>
        prev.map(inquiry =>
          inquiry.status === 'new' && !inquiry.viewed_at
            ? { ...inquiry, viewed_at: new Date().toISOString() }
            : inquiry
        )
      );
    } catch (err) {
      console.error('Failed to mark inquiries as viewed:', err);
    }
  };

  const filteredInquiries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return inquiries.filter(inquiry => {
      const matchesStatus = statusFilter === 'all' ? true : normalizeStatus(inquiry.status) === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        getFullName(inquiry),
        inquiry.email,
        inquiry.phone,
        inquiry.business_name,
        inquiry.subject,
        inquiry.message,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [inquiries, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const totals = inquiries.reduce(
      (acc, inquiry) => {
        const status = normalizeStatus(inquiry.status);
        acc.total += 1;
        acc[status] += 1;
        return acc;
      },
      { total: 0, new: 0, reviewed: 0, responded: 0, archived: 0 } as Record<InquiryStatus | 'total', number>
    );

    return totals;
  }, [inquiries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inquires</h1>
          <p className="text-muted-foreground">
            Review and respond to messages submitted through the contact form.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchInquiries} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="ghost" onClick={markAllAsReviewed}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark all as viewed
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Connection issue</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All submissions from the contact form</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Tag className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responded}</div>
            <p className="text-xs text-muted-foreground">Contacts with follow-up</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Archived</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.archived}</div>
            <p className="text-xs text-muted-foreground">Closed or resolved submissions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter &amp; Search</CardTitle>
          <CardDescription>Find contact submissions by name, email, business, or subject</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-9"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | InquiryStatus)}>
            <SelectTrigger className="w-full md:w-56">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredInquiries.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No contact submissions match the current filters.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const status = normalizeStatus(inquiry.status);
            const createdAt = formatDateTime(inquiry.created_at);
            const updatedAt = formatDateTime(inquiry.updated_at);
            return (
              <Card key={inquiry.id} className="border-border/70">
                <CardContent className="space-y-4 p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-semibold text-foreground">{getFullName(inquiry)}</h3>
                        <Badge className={statusStyles[status]}>{statusLabels[status]}</Badge>
                        {inquiry.source && (
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {inquiry.source.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Submitted {createdAt}
                        {updatedAt !== '—' && updatedAt !== createdAt && ` • Updated ${updatedAt}`}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {status !== 'responded' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(inquiry.id, 'responded')}
                          disabled={updatingId === inquiry.id}
                        >
                          {updatingId === inquiry.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                          )}
                          Mark as responded
                        </Button>
                      )}
                      {status !== 'archived' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(inquiry.id, 'archived')}
                          disabled={updatingId === inquiry.id}
                        >
                          <Archive className="mr-2 h-4 w-4" /> Archive
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{inquiry.email || 'No email provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{inquiry.phone || 'No phone provided'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{inquiry.business_name || 'No business listed'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        <span>Last updated: {updatedAt}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>Subject: {inquiry.subject || 'General inquiry'}</span>
                      </div>
                    </div>
                  </div>

                  {inquiry.message && (
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                      {inquiry.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
