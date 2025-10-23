'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Clock, Settings, Phone, Mail, Calendar, Activity, Building2 } from 'lucide-react';

interface IntegrationHealth {
  tenantId: string;
  tenantName: string;
  integrations: Array<{
    name: string;
    type: string;
    status: 'connected' | 'degraded' | 'broken' | 'disconnected';
    lastSync: string;
    errorCount: number;
    responseTime: number;
  }>;
}

export default function IntegrationHealth() {
  const [healthData, setHealthData] = useState<IntegrationHealth[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadHealthData();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [selectedTenant, autoRefresh]);

  useEffect(() => {
    loadHealthData();
  }, [selectedTenant]);

  const loadHealthData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/admin/integrations/health?tenant=${selectedTenant}`);
      if (response.success) {
        setHealthData(response.data);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'connected': return <CheckCircle className="text-green-500" />;
      case 'degraded': return <AlertCircle className="text-yellow-500" />;
      case 'broken': return <XCircle className="text-red-500" />;
      default: return <Clock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch(type) {
      case 'phone': return <Phone className="w-5 h-5" />;
      case 'email': return <Mail className="w-5 h-5" />;
      case 'calendar': return <Calendar className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  const getOverallHealth = () => {
    if (healthData.length === 0) return 'unknown';
    
    const allIntegrations = healthData.flatMap(tenant => tenant.integrations);
    if (allIntegrations.length === 0) return 'unknown';
    
    const connectedCount = allIntegrations.filter(i => i.status === 'connected').length;
    const totalCount = allIntegrations.length;
    
    if (connectedCount === totalCount) return 'healthy';
    if (connectedCount > totalCount / 2) return 'degraded';
    return 'critical';
  };

  const overallHealth = getOverallHealth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Health</h1>
          <p className="text-muted-foreground">
            Monitor the status of all system integrations
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
          <Button onClick={loadHealthData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Overall System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {overallHealth === 'healthy' && <CheckCircle className="w-8 h-8 text-green-500" />}
              {overallHealth === 'degraded' && <AlertCircle className="w-8 h-8 text-yellow-500" />}
              {overallHealth === 'critical' && <XCircle className="w-8 h-8 text-red-500" />}
              {overallHealth === 'unknown' && <Clock className="w-8 h-8 text-gray-500" />}
              <div>
                <h3 className="text-lg font-semibold">
                  {overallHealth === 'healthy' && 'All Systems Operational'}
                  {overallHealth === 'degraded' && 'Some Issues Detected'}
                  {overallHealth === 'critical' && 'Critical Issues Detected'}
                  {overallHealth === 'unknown' && 'Status Unknown'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {overallHealth === 'healthy' && 'All integrations are working properly'}
                  {overallHealth === 'degraded' && 'Some integrations may have issues'}
                  {overallHealth === 'critical' && 'Multiple integrations are down'}
                  {overallHealth === 'unknown' && 'Unable to determine system status'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={overallHealth === 'healthy' ? 'default' : 'destructive'}>
                {overallHealth.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenant Integration Status */}
      <div className="space-y-4">
        {healthData.map((tenant) => (
          <Card key={tenant.tenantId}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>{tenant.tenantName}</span>
                </div>
                <Badge variant="outline">
                  {tenant.integrations.length} integrations
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tenant.integrations.map((integration, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getIntegrationIcon(integration.type)}
                        <span className="font-medium">{integration.name}</span>
                      </div>
                      {getStatusIcon(integration.status)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className={getStatusColor(integration.status)}>
                          {integration.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm">{integration.lastSync}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Response Time</span>
                        <span className="text-sm">{integration.responseTime}ms</span>
                      </div>
                      
                      {integration.errorCount > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Errors</span>
                          <span className="text-sm text-red-600">{integration.errorCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Integration Types Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Types Summary</CardTitle>
          <CardDescription>
            Overview of integration types and their health status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {['Phone', 'Email', 'Calendar', 'SMS'].map((type) => {
              const typeIntegrations = healthData.flatMap(tenant => 
                tenant.integrations.filter(i => i.type === type.toLowerCase())
              );
              const connectedCount = typeIntegrations.filter(i => i.status === 'connected').length;
              const totalCount = typeIntegrations.length;
              
              return (
                <div key={type} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{type}</span>
                    <Badge variant={connectedCount === totalCount ? 'default' : 'destructive'}>
                      {connectedCount}/{totalCount}
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${totalCount > 0 ? (connectedCount / totalCount) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
