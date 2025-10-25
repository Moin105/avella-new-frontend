'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Calendar, Users, DollarSign, Clock, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  totalRevenue: number;
  activeClients: number;
  upcomingAppointments: number;
}

interface UpcomingAppointment {
  id: string;
  clientName: string;
  service: string;
  startTime: string;
  status: string;
  barber: string;
}

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Helper function to get color based on change value
  const getChangeColor = (change: string) => {
    const isPositive = change.startsWith('+');
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchStats = async () => {
    try {
      console.log('Loading dashboard stats...');
      const response = await apiClient.get('/appointments');
      console.log('Appointments response:', response);
      if (response.success) {
        const appointments = response.data as any[];
        const stats = calculateDashboardStats(appointments);
        setStats(stats);
        console.log('Dashboard stats calculated:', stats);
      } else {
        console.error('Appointments API error:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchUpcomingAppointments = async () => {
    try {
      console.log('Loading upcoming appointments...');
      const response = await apiClient.get('/appointments');
      console.log('Appointments response:', response);
      if (response.success) {
        const appointments = response.data as any[];
        const upcoming = getUpcomingAppointments(appointments);
        setUpcomingAppointments(upcoming);
        console.log('Upcoming appointments calculated:', upcoming);
      } else {
        console.error('Appointments API error:', response.error);
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const calculateDashboardStats = (appointments: any[]): DashboardStats => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Total bookings
    const totalBookings = appointments.length;

    // Today's bookings
    const todayBookings = appointments.filter(apt => {
      if (!apt.start_time) return false;
      const aptDate = new Date(apt.start_time);
      return aptDate >= today && aptDate < tomorrow;
    }).length;

    // Total revenue (sum of confirmed/completed appointments)
    const totalRevenue = appointments
      .filter(apt => apt.status === 'confirmed' || apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    // Active clients (unique clients)
    const clientIds = new Set(
      appointments
        .filter(apt => apt.client_id)
        .map(apt => apt.client_id)
    );
    const activeClients = clientIds.size;

    // Upcoming appointments (next 7 days)
    const upcomingAppointments = appointments.filter(apt => {
      if (!apt.start_time) return false;
      const aptDate = new Date(apt.start_time);
      return aptDate >= now && aptDate <= weekFromNow && 
             (apt.status === 'confirmed' || apt.status === 'pending');
    }).length;

    return {
      totalBookings,
      todayBookings,
      totalRevenue,
      activeClients,
      upcomingAppointments
    };
  };

  const getUpcomingAppointments = (appointments: any[]): UpcomingAppointment[] => {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return appointments
      .filter(apt => {
        if (!apt.start_time) return false;
        const aptDate = new Date(apt.start_time);
        return aptDate >= now && aptDate <= weekFromNow && 
               (apt.status === 'confirmed' || apt.status === 'pending');
      })
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10) // Limit to 10 most recent
      .map(apt => ({
        id: apt.id || '',
        clientName: apt.customer?.name || 'Unknown',
        service: apt.service?.name || 'Unknown Service',
        startTime: apt.start_time,
        status: apt.status || 'pending',
        barber: apt.barber?.name || 'Unknown Barber'
      }));
  };

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      await Promise.all([
        fetchStats(),
        fetchUpcomingAppointments()
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-booking':
        router.push('/dashboard/calendar');
        break;
      case 'add-client':
        router.push('/dashboard/clients');
        break;
      case 'view-calendar':
        router.push('/dashboard/calendar');
        break;
      case 'view-reports':
        router.push('/dashboard/reports');
        break;
      default:
        break;
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline" 
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
            <p className={`text-xs ${getChangeColor('+2 from last month')}`}>
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayBookings || 0}</div>
            <p className={`text-xs ${getChangeColor('+1 from yesterday')}`}>
              +1 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className={`text-xs ${getChangeColor('+12% from last month')}`}>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
            <p className={`text-xs ${getChangeColor('+3 new this week')}`}>
              +3 new this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>
              Your next scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.startTime);
                  const isToday = appointmentDate.toDateString() === new Date().toDateString();
                  const isTomorrow = appointmentDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                  
                  let timeText = '';
                  if (isToday) {
                    timeText = `Today at ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  } else if (isTomorrow) {
                    timeText = `Tomorrow at ${appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  } else {
                    timeText = appointmentDate.toLocaleDateString() + ' at ' + appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'confirmed': return 'bg-green-500';
                      case 'pending': return 'bg-yellow-500';
                      case 'cancelled': return 'bg-red-500';
                      default: return 'bg-gray-500';
                    }
                  };

                  const getStatusVariant = (status: string) => {
                    switch (status) {
                      case 'confirmed': return 'secondary';
                      case 'pending': return 'outline';
                      case 'cancelled': return 'destructive';
                      default: return 'outline';
                    }
                  };

                  return (
                    <div key={appointment.id} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 ${getStatusColor(appointment.status)} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{appointment.clientName} - {appointment.service}</p>
                        <p className="text-xs text-muted-foreground">{timeText}</p>
                        <p className="text-xs text-muted-foreground">Barber: {appointment.barber}</p>
                      </div>
                      <Badge variant={getStatusVariant(appointment.status) as any}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('new-booking')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                New Booking
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('add-client')}
              >
                <Users className="mr-2 h-4 w-4" />
                Add Client
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('view-calendar')}
              >
                <Activity className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => handleQuickAction('view-reports')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
