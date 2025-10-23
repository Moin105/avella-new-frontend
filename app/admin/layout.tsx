'use client';

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, LogOut, User, Home, BarChart3, Zap, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigationItems = [
    { href: '/admin', label: 'Dashboard', icon: Home },
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
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
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
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent hover:shadow-sm'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
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
