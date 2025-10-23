'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Download, Calendar, TrendingUp, Users, Building2, Activity } from 'lucide-react';

interface MetricsData {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  totalCustomers: number;
  totalTenants: number;
  systemUptime: number;
  bookingTrends: Array<{
    date: string;
    bookings: number;
    revenue: number;
  }>;
  tenantMetrics: Array<{
    tenantId: string;
    tenantName: string;
    bookings: number;
    revenue: number;
    activeUsers: number;
  }>;
}

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [period, setPeriod] = useState<string>('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [selectedTenant, period]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/metrics?tenant=${selectedTenant}&period=${period}`);
      if (response.success) {
        setMetrics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportMetrics = async () => {
    try {
      const response = await apiClient.get(`/admin/metrics/export?tenant=${selectedTenant}&period=${period}`, {
        responseType: 'blob'
      });
      
      if (response.success) {
        const blob = new Blob([response.data], { type: 'application/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `metrics-${selectedTenant}-${period}days.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export metrics:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Metrics</h1>
          <p className="text-muted-foreground">
            Performance and usage analytics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              <SelectItem value="tenant1">Tenant 1</SelectItem>
              <SelectItem value="tenant2">Tenant 2</SelectItem>
            </SelectContent>
          </Select>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportMetrics} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalBookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics?.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCustomers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.systemUptime || 99.9}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Metrics */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Booking Trends</CardTitle>
            <CardDescription>
              Daily booking volume over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends</CardTitle>
            <CardDescription>
              Daily revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenant Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Tenant Performance</CardTitle>
          <CardDescription>
            Individual tenant metrics and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics?.tenantMetrics?.map((tenant) => (
              <div key={tenant.tenantId} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{tenant.tenantName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {tenant.activeUsers} active users
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Bookings</p>
                    <p className="font-semibold">{tenant.bookings}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-semibold">${tenant.revenue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
