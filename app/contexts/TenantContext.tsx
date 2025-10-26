'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { useAuth } from './AuthContext';

interface Tenant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  timezone?: string;
}

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  loading: boolean;
  fetchTenants: () => Promise<void>;
  createTenant: (tenantData: any) => Promise<{ success: boolean; error?: string; tenant?: Tenant }>;
  updateTenant: (tenantId: string, updateData: any) => Promise<{ success: boolean; error?: string; tenant?: Tenant }>;
  switchTenant: (tenant: Tenant) => void;
  initializeDefaultServices: () => Promise<{ success: boolean; error?: string }>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Fetch tenants when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchTenants();
    } else if (!isAuthenticated && !authLoading) {
      setTenants([]);
      setCurrentTenant(null);
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  // Set tenant ID in localStorage when current tenant changes
  useEffect(() => {
    console.log('TenantContext - Current tenant changed:', currentTenant);
    if (currentTenant) {
      apiClient.setTenantId(currentTenant.id);
      console.log('TenantContext - Setting tenant ID to:', currentTenant.id);
    }
    // Note: We don't clear tenant ID here to avoid interfering with AuthContext
  }, [currentTenant]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/tenants/my');
      
      if (response.success) {
        setTenants(response.data as Tenant[]);
        
        // Auto-select first tenant if available and no current tenant
        if ((response.data as Tenant[]).length > 0 && !currentTenant) {
          setCurrentTenant((response.data as Tenant[])[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async (tenantData: any) => {
    try {
      const response = await apiClient.post('/tenants', tenantData);
      
      if (response.success) {
        const newTenant = response.data as Tenant;
        setTenants(prev => [...prev, newTenant]);
        
        // Set as current tenant if it's the first one
        if (tenants.length === 0) {
          setCurrentTenant(newTenant);
        }
        
        return { success: true, tenant: newTenant };
      } else {
        return { success: false, error: response.error || 'Failed to create tenant' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to create tenant' };
    }
  };

  const updateTenant = async (tenantId: string, updateData: any) => {
    try {
      const response = await apiClient.put(`/tenants/${tenantId}`, updateData);
      
      if (response.success) {
        const updatedTenant = response.data as Tenant;
        setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
        
        if (currentTenant?.id === tenantId) {
          setCurrentTenant(updatedTenant);
        }
        
        return { success: true, tenant: updatedTenant };
      } else {
        return { success: false, error: response.error || 'Failed to update tenant' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to update tenant' };
    }
  };

  const switchTenant = (tenant: Tenant) => {
    setCurrentTenant(tenant);
  };

  const initializeDefaultServices = async () => {
    try {
      const response = await apiClient.post('/services/initialize-default');
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: 'Failed to initialize services' };
    }
  };

  const value = {
    tenants,
    currentTenant,
    loading,
    fetchTenants,
    createTenant,
    updateTenant,
    switchTenant,
    initializeDefaultServices,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
