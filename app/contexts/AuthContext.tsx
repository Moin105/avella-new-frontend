'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/me');
      
      if (response.success) {
        setUser(response.data as User);
        setIsAuthenticated(true);
        
        // Restore tenant ID from localStorage if available
        const savedTenantId = apiClient.getCurrentTenantId();
        if (savedTenantId) {
          console.log('AuthContext: Restored tenant ID from localStorage:', savedTenantId);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.success) {
        const { access_token, user: userData } = response.data as { access_token: string; user: User };
        apiClient.setToken(access_token);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Fetch tenant information immediately after login
        try {
          const tenantResponse = await apiClient.get('/tenants/my');
          if (tenantResponse.success && (tenantResponse.data as any[]).length > 0) {
            const firstTenant = (tenantResponse.data as any[])[0];
            apiClient.setTenantId(firstTenant.id);
            console.log('AuthContext: Set tenant ID after login:', firstTenant.id);
          }
        } catch (tenantError) {
          console.error('Failed to fetch tenant after login:', tenantError);
        }
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.success) {
        // Auto-login after registration
        const loginResult = await login(userData.email, userData.password);
        if (loginResult.success) {
          return { success: true };
        } else {
          return { success: false, error: loginResult.error };
        }
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    apiClient.setToken(null);
    apiClient.setTenantId(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const forgotPassword = async (email: string) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: 'Failed to send reset email' };
    }
  };

  const resetPassword = async (token: string, newPassword: string, confirmPassword: string) => {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: response.success, error: response.error };
    } catch (error) {
      return { success: false, error: 'Password reset failed' };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
