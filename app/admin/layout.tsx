'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2, LogOut, User, Home, BarChart3, Zap, AlertTriangle, Users, Inbox } from 'lucide-react';
import { Button } from '../components/ui/button';
import { apiClient } from '../lib/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface InquirySummary {
  created_at?: string;
  status?: string;
  viewed_at?: string | null;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [newInquiryCount, setNewInquiryCount] = useState(0);

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/leads', label: 'Leads', icon: Users },
    { href: '/admin/inquires', label: 'Inquires', icon: Inbox },
    { href: '/admin/metrics', label: 'Metrics', icon: BarChart3 },
    { href: '/admin/integrations', label: 'Integrations', icon: Zap },
    { href: '/admin/error-center', label: 'Error Center', icon: AlertTriangle },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && isAuthenticated && user?.role !== 'master_admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let isMounted = true;

    const parseDate = (value?: string | null) => {
      if (!value) return null;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? null : date;
    };

    const fetchInquiryCount = async () => {
      try {
        const response = await apiClient.get<InquirySummary[]>('/admin/inquiries');
        if (!isMounted || !response.success || !Array.isArray(response.data)) {
          return;
        }

        const inquiries = response.data;
        const lastViewedRaw = window.localStorage.getItem('admin_inquiries_last_viewed');
        const lastViewed = parseDate(lastViewedRaw);

        const count = inquiries.reduce((total, inquiry) => {
          const createdAt = parseDate(inquiry.created_at);
          const viewedAt = parseDate(inquiry.viewed_at ?? null);
          const status = (inquiry.status || '').toLowerCase();

          if (!lastViewed) {
            return status === 'new' && !viewedAt ? total + 1 : total;
          }

          if (createdAt && createdAt > lastViewed) {
            return total + 1;
          }

          if (!viewedAt && status === 'new') {
            return total + 1;
          }

          return total;
        }, 0);

        setNewInquiryCount(count);
      } catch (error) {
        console.error('Failed to refresh inquiry count:', error);
      }
    };

    if (pathname.startsWith('/admin/inquires')) {
      window.localStorage.setItem('admin_inquiries_last_viewed', new Date().toISOString());
      setNewInquiryCount(0);
    } else {
      fetchInquiryCount();
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'admin_inquiries_last_viewed' || event.key === 'admin_inquiries_last_updated') {
        if (pathname.startsWith('/admin/inquires')) {
          setNewInquiryCount(0);
        } else {
          fetchInquiryCount();
        }
      }
    };

    window.addEventListener('storage', handleStorage);

    const interval = window.setInterval(() => {
      if (!pathname.startsWith('/admin/inquires')) {
        fetchInquiryCount();
      }
    }, 60000);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorage);
      window.clearInterval(interval);
    };
  }, [pathname]);

  if (loading) {
    return (
      <div className="h-screen bg-background flex">
        {/* Sidebar - Fixed */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          <div className="p-6 flex-shrink-0">
            <h2 className="text-xl font-semibold">Avella AI Admin</h2>
          </div>
          <nav className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm'
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.href === '/admin/inquires' && newInquiryCount > 0 && (
                      <span className="inline-flex min-w-[1.5rem] h-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
                        {newInquiryCount > 99 ? '99+' : newInquiryCount}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </nav>
          <div className="flex-shrink-0 p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Loading...</p>
                <p className="text-xs text-muted-foreground truncate">Please wait</p>
              </div>
            </div>
          </div>
        </div>
        {/* Main content area with loading */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'master_admin') {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - Fixed */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 flex-shrink-0">
            <h2 className="text-xl font-semibold">Avella AI Admin</h2>
          </div>
        <nav className="flex-1 px-4 pb-4 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.href === '/admin/inquires' && newInquiryCount > 0 && (
                    <span className="inline-flex min-w-[1.5rem] h-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-semibold text-white">
                      {newInquiryCount > 99 ? '99+' : newInquiryCount}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        </nav>
          
        {/* User info - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <header className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name || 'Admin'}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || 'Admin'}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
        </div>
        </header>

        {/* Main content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
      </div>
    </div>
  );
}
