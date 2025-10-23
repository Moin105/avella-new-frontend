'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const DebugPage = () => {
  const { currentTenant, tenants } = useTenant();
  const [localStorageTenantId, setLocalStorageTenantId] = useState<string | null>(null);
  const [apiTenantId, setApiTenantId] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage directly
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('current_tenant_id');
      setLocalStorageTenantId(stored);
    }

    // Check API client tenant ID
    const tenantId = apiClient.getCurrentTenantId();
    setApiTenantId(tenantId);
  }, [currentTenant]);

  const refreshData = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('current_tenant_id');
      setLocalStorageTenantId(stored);
    }
    const tenantId = apiClient.getCurrentTenantId();
    setApiTenantId(tenantId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Debug Information</h1>
        <p className="text-muted-foreground">Check tenant ID and localStorage status</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tenant Context</CardTitle>
            <CardDescription>Current tenant from context</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Current Tenant:</strong> {currentTenant ? currentTenant.name : 'None'}</p>
              <p><strong>Tenant ID:</strong> {currentTenant ? currentTenant.id : 'None'}</p>
              <p><strong>Total Tenants:</strong> {tenants.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
            <CardDescription>Tenant ID stored in localStorage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Stored Tenant ID:</strong> {localStorageTenantId || 'None'}</p>
              <p><strong>API Client Tenant ID:</strong> {apiTenantId || 'None'}</p>
              <Button onClick={refreshData} size="sm">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tenants</CardTitle>
          <CardDescription>Available tenants in context</CardDescription>
        </CardHeader>
        <CardContent>
          {tenants.length > 0 ? (
            <div className="space-y-2">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="p-3 border rounded-md">
                  <p><strong>Name:</strong> {tenant.name}</p>
                  <p><strong>ID:</strong> {tenant.id}</p>
                  <p><strong>Email:</strong> {tenant.email}</p>
                  <p><strong>Active:</strong> {tenant.isActive ? 'Yes' : 'No'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No tenants available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPage;
