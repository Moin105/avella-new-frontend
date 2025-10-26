'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Users, 
  Building2, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Search, 
  Eye, 
  Settings, 
  Phone, 
  Mail, 
  MapPin, 
  Copy, 
  Send,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';

interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  totalBookings: number;
  systemHealth: string;
  uptime: string;
}

interface Tenant {
  id: string;
  business_name?: string; // Primary field name
  businessName?: string; // Alternative property name
  name?: string; // Alternative property name
  owner_name?: string; // Primary field name
  ownerName?: string; // Alternative property name
  owner_email?: string; // Primary field name
  ownerEmail?: string; // Alternative property name
  business_type?: string; // Primary field name
  businessType?: string; // Alternative property name
  created_at?: string; // Primary field name
  createdAt?: string; // Alternative property name
  is_active?: boolean; // Primary field name
  isActive?: boolean; // Alternative property name
  stats?: {
    active_barbers?: number; // Primary field name
    activeBarbers?: number; // Alternative property name
    appointments_this_month?: number; // Primary field name
    appointmentsThisMonth?: number; // Alternative property name
    connected_calendars?: number; // Primary field name
    connectedCalendars?: number; // Alternative property name
    recent_activity?: number; // Primary field name
    recentActivity?: number; // Alternative property name
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTenantModal, setShowAddTenantModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [newTenantCredentials, setNewTenantCredentials] = useState<any>(null);
  const [addingTenant, setAddingTenant] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  const [newTenant, setNewTenant] = useState({
    businessName: '',
    businessType: 'salon',
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    address: '',
    phone: '',
    businessNumber: '',
    website: '',
    timezone: 'America/New_York'
  });

  useEffect(() => {
    fetchStats();
    fetchTenants();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/metrics');
      if (response.success) {
        setStats(response.data as AdminStats);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Set mock data for development
      setStats({
        totalUsers: 150,
        totalTenants: 25,
        totalBookings: 1250,
        systemHealth: 'healthy',
        uptime: '99.9%'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const response = await apiClient.get('/admin/tenants');
      if (response.success) {
        setTenants(response.data as Tenant[]);
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
      // Set mock data for development
      setTenants([
        {
          id: '1',
          business_name: 'The Fade Room',
          owner_name: 'Sarah Johnson',
          owner_email: 'sarah.johnson@example.com',
          business_type: 'barbershop',
          created_at: new Date().toISOString(),
          is_active: true,
          stats: {
            active_barbers: 3,
            appointments_this_month: 156,
            connected_calendars: 2,
            recent_activity: 45
          }
        },
        {
          id: '2',
          business_name: 'Elite Hair Studio',
          owner_name: 'Jane Smith',
          owner_email: 'jane.smith@example.com',
          business_type: 'salon',
          created_at: new Date().toISOString(),
          is_active: true,
          stats: {
            active_barbers: 5,
            appointments_this_month: 203,
            connected_calendars: 4,
            recent_activity: 67
          }
        }
      ]);
    }
  };

  const addTenant = async () => {
    setAddingTenant(true);
    try {
      const response = await apiClient.post('/admin/tenants', newTenant);
      if (response.success) {
        setNewTenantCredentials(response.data);
        setShowAddTenantModal(false);
        setShowCredentialsModal(true);
        fetchTenants();
      }
    } catch (error) {
      console.error('Failed to add tenant:', error);
    } finally {
      setAddingTenant(false);
    }
  };

  const filteredTenants = tenants.filter(tenant => {
    const businessName = tenant.business_name || tenant.businessName || tenant.name || '';
    const ownerName = tenant.owner_name || tenant.ownerName || '';
    const ownerEmail = tenant.owner_email || tenant.ownerEmail || '';
    
    return businessName.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
           ownerName.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
           ownerEmail.toLowerCase().includes((searchTerm || '').toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (showOnboardingWizard) {
    return (
      <OnboardingWizard 
        onComplete={() => setShowOnboardingWizard(false)}
        onClose={() => setShowOnboardingWizard(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Master Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and tenant management
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowOnboardingWizard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Setup New Business
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <Button
          variant={activeView === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveView('overview')}
          className="flex-1"
        >
          Overview
        </Button>
        <Button
          variant={activeView === 'tenants' ? 'default' : 'ghost'}
          onClick={() => setActiveView('tenants')}
          className="flex-1"
        >
          Tenants
        </Button>
        <Button
          variant={activeView === 'system' ? 'default' : 'ghost'}
          onClick={() => setActiveView('system')}
          className="flex-1"
        >
          System
        </Button>
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +5 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalTenants || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +2 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalBookings || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.uptime || '99.9%'}</div>
                <p className="text-xs text-muted-foreground">
                  Uptime
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>
                  Current system health and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">API Server</span>
                    </div>
                    <Badge variant="secondary">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Database</span>
                    </div>
                    <Badge variant="secondary">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AI Services</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">Email Service</span>
                    </div>
                    <Badge variant="outline">Degraded</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Administrative tools and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveView('tenants')}>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Tenants
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowOnboardingWizard(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Setup New Business
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setActiveView('system')}>
                    <Activity className="mr-2 h-4 w-4" />
                    System Health
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Error Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Tenants Tab */}
      {activeView === 'tenants' && (
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
            </div>
            <Button onClick={() => setShowAddTenantModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Tenant
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredTenants.map((tenant) => (
              <Card key={tenant.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{tenant.business_name || tenant.businessName || tenant.name || 'Unnamed Business'}</h3>
                        <p className="text-sm text-muted-foreground">{tenant.owner_name || tenant.ownerName || 'Unknown Owner'}</p>
                        <p className="text-sm text-muted-foreground">{tenant.owner_email || tenant.ownerEmail || 'No email'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{tenant.stats?.active_barbers || tenant.stats?.activeBarbers || 0} barbers</span>
                          <span>{tenant.stats?.appointments_this_month || tenant.stats?.appointmentsThisMonth || 0} bookings</span>
                          <span>{tenant.stats?.connected_calendars || tenant.stats?.connectedCalendars || 0} calendars</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={(tenant.is_active || tenant.isActive) ? 'default' : 'secondary'}>
                            {(tenant.is_active || tenant.isActive) ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(tenant.created_at || tenant.createdAt || new Date()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* System Tab */}
      {activeView === 'system' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Response Time</span>
                  <span className="text-sm font-medium">120ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Throughput</span>
                  <span className="text-sm font-medium">1.2k req/min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="text-sm font-medium text-green-600">0.1%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">SSL Certificate</span>
                  <Badge variant="default">Valid</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Firewall</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Security Scan</span>
                  <span className="text-sm font-medium">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                System Uptime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Last 24h</span>
                  <span className="text-sm font-medium text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last 7d</span>
                  <span className="text-sm font-medium text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last 30d</span>
                  <span className="text-sm font-medium text-green-600">99.7%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Tenant Modal */}
      {showAddTenantModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Tenant</CardTitle>
              <CardDescription>
                Create a new business tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Name *</label>
                  <Input
                    value={newTenant.businessName}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Enter business name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Business Type</label>
                  <Select value={newTenant.businessType} onValueChange={(value) => setNewTenant(prev => ({ ...prev, businessType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon">Salon</SelectItem>
                      <SelectItem value="barbershop">Barbershop</SelectItem>
                      <SelectItem value="spa">Spa</SelectItem>
                      <SelectItem value="clinic">Clinic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner First Name *</label>
                  <Input
                    value={newTenant.ownerFirstName}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, ownerFirstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Last Name *</label>
                  <Input
                    value={newTenant.ownerLastName}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, ownerLastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Email *</label>
                  <Input
                    type="email"
                    value={newTenant.ownerEmail}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Owner Phone *</label>
                  <Input
                    value={newTenant.ownerPhone}
                    onChange={(e) => setNewTenant(prev => ({ ...prev, ownerPhone: e.target.value }))}
                    placeholder="Enter phone"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddTenantModal(false)}>
                  Cancel
                </Button>
                <Button onClick={addTenant} disabled={addingTenant}>
                  {addingTenant ? 'Creating...' : 'Create Tenant'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentialsModal && newTenantCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Tenant Created Successfully</CardTitle>
              <CardDescription>
                Here are the credentials for the new tenant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Admin Credentials</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{newTenantCredentials.email}</span>
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Password:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono">{newTenantCredentials.password}</span>
                      <Button size="sm" variant="outline">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCredentialsModal(false)}>
                  Close
                </Button>
                <Button onClick={() => setShowCredentialsModal(false)}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
