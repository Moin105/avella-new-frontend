'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertTriangle, RotateCcw, Eye, Filter, Search, Clock, AlertCircle, XCircle } from 'lucide-react';

interface ErrorEvent {
  id: string;
  tenantId: string;
  tenantName: string;
  integration: string;
  errorType: string;
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'resolved';
  retryCount: number;
  lastRetry: string;
}

export default function ErrorCenter() {
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [filters, setFilters] = useState({
    tenantId: 'all',
    integration: 'all',
    severity: 'all',
    status: 'all'
  });
  const [selectedError, setSelectedError] = useState<ErrorEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadErrors();
  }, [filters]);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.tenantId !== 'all') params.append('tenant_id', filters.tenantId);
      if (filters.integration !== 'all') params.append('integration', filters.integration);
      if (filters.severity !== 'all') params.append('severity', filters.severity);
      if (filters.status !== 'all') params.append('status', filters.status);

      const response = await apiClient.get(`/admin/events/failed?${params.toString()}`);
      if (response.success) {
        setErrors(response.data);
      }
    } catch (error) {
      console.error('Error loading failed events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReplay = async (eventId: string) => {
    if (!confirm('Replay this failed event?')) return;

    try {
      const response = await apiClient.post(`/admin/events/replay/${eventId}`);
      if (response.success) {
        loadErrors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error replaying event:', error);
    }
  };

  const handleAcknowledge = async (eventId: string) => {
    try {
      const response = await apiClient.post(`/admin/events/acknowledge/${eventId}`);
      if (response.success) {
        loadErrors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error acknowledging event:', error);
    }
  };

  const handleResolve = async (eventId: string) => {
    try {
      const response = await apiClient.post(`/admin/events/resolve/${eventId}`);
      if (response.success) {
        loadErrors(); // Refresh the list
      }
    } catch (error) {
      console.error('Error resolving event:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'low': return <Clock className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredErrors = errors.filter(error => {
    if (searchTerm && !error.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const errorStats = {
    total: errors.length,
    new: errors.filter(e => e.status === 'new').length,
    acknowledged: errors.filter(e => e.status === 'acknowledged').length,
    resolved: errors.filter(e => e.status === 'resolved').length,
    critical: errors.filter(e => e.severity === 'critical').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Error Center</h1>
          <p className="text-muted-foreground">
            Monitor and manage system errors and failed events
          </p>
        </div>
        <Button onClick={loadErrors} disabled={loading} variant="outline">
          <RotateCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorStats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorStats.new}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{errorStats.acknowledged}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <XCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{errorStats.resolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorStats.critical}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search errors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tenant</label>
              <Select value={filters.tenantId} onValueChange={(value) => setFilters(prev => ({ ...prev, tenantId: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tenants</SelectItem>
                  <SelectItem value="tenant1">Tenant 1</SelectItem>
                  <SelectItem value="tenant2">Tenant 2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Integration</label>
              <Select value={filters.integration} onValueChange={(value) => setFilters(prev => ({ ...prev, integration: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Integrations</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Severity</label>
              <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error List */}
      <Card>
        <CardHeader>
          <CardTitle>Failed Events</CardTitle>
          <CardDescription>
            {filteredErrors.length} errors found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredErrors.map((error) => (
              <div key={error.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSeverityIcon(error.severity)}
                    <span className="font-medium">{error.integration}</span>
                    <Badge className={getSeverityColor(error.severity)}>
                      {error.severity}
                    </Badge>
                    <Badge className={getStatusColor(error.status)}>
                      {error.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedError(error)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {error.status === 'new' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(error.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    {error.status === 'acknowledged' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolve(error.id)}
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReplay(error.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Replay
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground mb-2">
                  {error.message}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tenant: {error.tenantName}</span>
                  <span>Retry Count: {error.retryCount}</span>
                  <span>Last Retry: {error.lastRetry}</span>
                  <span>Timestamp: {error.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Error Details</span>
                <Button variant="outline" onClick={() => setSelectedError(null)}>
                  Close
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Error ID</label>
                  <p className="text-sm text-muted-foreground">{selectedError.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tenant</label>
                  <p className="text-sm text-muted-foreground">{selectedError.tenantName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Integration</label>
                  <p className="text-sm text-muted-foreground">{selectedError.integration}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Error Type</label>
                  <p className="text-sm text-muted-foreground">{selectedError.errorType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Severity</label>
                  <Badge className={getSeverityColor(selectedError.severity)}>
                    {selectedError.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Badge className={getStatusColor(selectedError.status)}>
                    {selectedError.status}
                  </Badge>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Message</label>
                <p className="text-sm text-muted-foreground mt-1">{selectedError.message}</p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedError(null)}>
                  Close
                </Button>
                <Button onClick={() => handleReplay(selectedError.id)}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Replay Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
