'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  User,
  Building2,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  BarChart3,
  Plus,
  MoreHorizontal,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { getBusinessTypeLabel } from '@/lib/business-types';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  business_type?: string;
  number_of_chairs?: number;
  message?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  assigned_to?: string;
  follow_up_date?: string;
  last_contacted?: string;
  conversion_date?: string;
  created_at: string;
  updated_at: string;
}

interface LeadStats {
  total_leads: number;
  new_leads: number;
  contacted_leads: number;
  qualified_leads: number;
  converted_leads: number;
  lost_leads: number;
  conversion_rate: number;
  avg_response_time_hours?: number;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  };

  const formatSource = (value?: string | null) => {
    if (!value) return 'Unknown source';
    return value
      .split(/[_-]+/)
      .filter(Boolean)
      .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  };

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/leads');
      if (response.success) {
        setLeads(response.data as Lead[]);
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      // Set mock data for development
      setLeads([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '(555) 123-4567',
          business_name: 'Elite Barbershop',
          business_type: 'barbershop',
          number_of_chairs: 3,
          message: 'Looking for a comprehensive booking system for my barbershop.',
          source: 'contact_form',
          status: 'new',
          priority: 'high',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '(555) 987-6543',
          business_name: 'Beauty Haven Salon',
          business_type: 'salon',
          number_of_chairs: 5,
          message: 'Interested in AI voice booking for my salon.',
          source: 'contact_form',
          status: 'contacted',
          priority: 'medium',
          assigned_to: 'Admin User',
          last_contacted: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/leads/stats');
      if (response.success) {
        setStats(response.data as LeadStats);
      }
    } catch (error) {
      console.error('Failed to fetch lead stats:', error);
      // Set mock data for development
      setStats({
        total_leads: 25,
        new_leads: 8,
        contacted_leads: 12,
        qualified_leads: 3,
        converted_leads: 2,
        lost_leads: 0,
        conversion_rate: 8.0,
        avg_response_time_hours: 2.5
      });
    }
  };

  const updateLeadStatus = async (leadId: string, status: string, notes?: string) => {
    try {
      const response = await apiClient.put(`/admin/leads/${leadId}/status`, {
        status,
        notes
      });
      if (response.success) {
        fetchLeads();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update lead status:', error);
    }
  };

  const assignLead = async (leadId: string, assignedTo: string) => {
    try {
      const response = await apiClient.put(`/admin/leads/${leadId}/assign`, {
        assigned_to: assignedTo
      });
      if (response.success) {
        fetchLeads();
      }
    } catch (error) {
      console.error('Failed to assign lead:', error);
    }
  };

  const deleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const response = await apiClient.delete(`/admin/leads/${leadId}`);
      if (response.success) {
        fetchLeads();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete lead:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.business_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <h1 className="text-3xl font-bold">Leads Management</h1>
          <p className="text-muted-foreground">
            Manage and track leads from contact form submissions
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_leads}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.new_leads} new this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversion_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.converted_leads} converted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_leads}</div>
              <p className="text-xs text-muted-foreground">
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avg_response_time_hours ? `${stats.avg_response_time_hours.toFixed(1)}h` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                Time to first contact
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads List */}
      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{lead.name}</h3>
                      <Badge className={getStatusColor(lead.status)}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </Badge>
                      <Badge className={getPriorityColor(lead.priority)}>
                        {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                    {lead.business_name && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Building2 className="w-4 h-4 mr-1" />
                        {lead.business_name}
                      </p>
                    )}
                    {lead.business_type && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Briefcase className="w-4 h-4 mr-1" />
                        {getBusinessTypeLabel(lead.business_type)}
                      </p>
                    )}
                    {lead.phone && (
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {lead.phone}
                      </p>
                    )}
                    {lead.assigned_to && (
                      <p className="text-sm text-muted-foreground">
                        Assigned to: {lead.assigned_to}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedLead(lead);
                      setShowLeadModal(true);
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLead(lead);
                      setShowEditModal(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'contacted')}>
                        Mark as Contacted
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'qualified')}>
                        Mark as Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'converted')}>
                        Mark as Converted
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'lost')}>
                        Mark as Lost
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-600"
                      >
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {lead.message && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-start">
                    <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    {lead.message}
                  </p>
                </div>
              )}
              
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>Created: {new Date(lead.created_at).toLocaleDateString()}</span>
                  {lead.last_contacted && (
                    <span>Last contacted: {new Date(lead.last_contacted).toLocaleDateString()}</span>
                  )}
                </div>
                <span>Source: {lead.source}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leads found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No leads have been submitted yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={showLeadModal}
        onOpenChange={(open) => {
          setShowLeadModal(open);
          if (!open) {
            setSelectedLead(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedLead?.name ?? 'Lead details'}</DialogTitle>
            <DialogDescription>
              {selectedLead ? `Lead submitted via ${formatSource(selectedLead.source)}` : 'Review lead submission details.'}
            </DialogDescription>
          </DialogHeader>

          {selectedLead && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={getStatusColor(selectedLead.status)}>
                  {selectedLead.status.charAt(0).toUpperCase() + selectedLead.status.slice(1)}
                </Badge>
                <Badge className={getPriorityColor(selectedLead.priority)}>
                  {selectedLead.priority.charAt(0).toUpperCase() + selectedLead.priority.slice(1)}
                </Badge>
                {selectedLead.assigned_to && (
                  <Badge variant="outline">Assigned to {selectedLead.assigned_to}</Badge>
                )}
              </div>

              <section className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Contact</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd className="text-right font-medium break-all">{selectedLead.email}</dd>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd className="text-right font-medium">{selectedLead.phone}</dd>
                    </div>
                  )}
                  {selectedLead.business_name && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Business Name</dt>
                      <dd className="text-right font-medium">{selectedLead.business_name}</dd>
                    </div>
                  )}
                  {selectedLead.business_type && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Business Type</dt>
                      <dd className="text-right font-medium">{getBusinessTypeLabel(selectedLead.business_type)}</dd>
                    </div>
                  )}
                </dl>
              </section>

              {(selectedLead.message || selectedLead.notes) && (
                <section className="space-y-3">
                  {selectedLead.message && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase">Message</h4>
                      <p className="rounded-md bg-muted p-3 text-sm text-muted-foreground whitespace-pre-line">
                        {selectedLead.message}
                      </p>
                    </div>
                  )}
                  {selectedLead.notes && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase">Internal Notes</h4>
                      <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground whitespace-pre-line">
                        {selectedLead.notes}
                      </p>
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase">Timeline</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="text-right font-medium">
                      {formatDateTime(selectedLead.created_at) ?? '—'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd className="text-right font-medium">
                      {formatDateTime(selectedLead.updated_at) ?? '—'}
                    </dd>
                  </div>
                  {selectedLead.last_contacted && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Last Contacted</dt>
                      <dd className="text-right font-medium">
                        {formatDateTime(selectedLead.last_contacted) ?? '—'}
                      </dd>
                    </div>
                  )}
                  {selectedLead.follow_up_date && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Follow Up</dt>
                      <dd className="text-right font-medium">
                        {formatDateTime(selectedLead.follow_up_date) ?? '—'}
                      </dd>
                    </div>
                  )}
                  {selectedLead.conversion_date && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Conversion Date</dt>
                      <dd className="text-right font-medium">
                        {formatDateTime(selectedLead.conversion_date) ?? '—'}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
