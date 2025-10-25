/**
 * Centralized API client with mock mode support
 * Handles authentication, error handling, and request/response interceptors
 */

import { normalizeToUTCString } from './timezone-utils';

interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
}

class ApiError extends Error {
  status: number;
  details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseURL: string;
  private mockMode: boolean;
  private token: string | null = null;

  constructor() {
    // Determine the correct API base URL based on environment
    const getApiUrl = () => {
      // Check if we're in production by looking at the hostname
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname.includes('vercel.app') || hostname.includes('avella') || hostname !== 'localhost') {
          return process.env.NEXT_PUBLIC_API_BASE || 'https://avella-backend-production.up.railway.app/api';
        }
      }
      
      // Fallback to environment variable or localhost
      return process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';
    };
    
    this.baseURL = getApiUrl();
    
    this.mockMode = process.env.NEXT_PUBLIC_MOCK === 'true' || 
                   (typeof window !== 'undefined' && localStorage.getItem('mock_mode') === 'true');
    
    // Debug logging
    console.log('API Client initialized:', {
      baseURL: this.baseURL,
      mockMode: this.mockMode,
      NODE_ENV: process.env.NODE_ENV,
      hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
      isVercel: typeof window !== 'undefined' ? window.location.hostname.includes('vercel.app') : false,
      NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
      localStorage_mock_mode: typeof window !== 'undefined' ? localStorage.getItem('mock_mode') : 'N/A'
    });
    
    // Initialize token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token') || localStorage.getItem('access_token');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Add tenant ID if available
    if (typeof window !== 'undefined') {
      const tenantId = localStorage.getItem('current_tenant_id');
      console.log('API Headers - Tenant ID from localStorage:', tenantId);
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
        console.log('API Headers - X-Tenant-ID header set to:', tenantId);
      } else {
        console.warn('API Headers - No tenant ID found in localStorage - API calls may fail');
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.detail || errorData.message || 'Request failed',
        response.status,
        errorData
      );
    }

    const data = await response.json();
    
    // Apply timezone normalization to response data
    const normalizedData = this.normalizeTimestampsInResponse(data);
    
    return { data: normalizedData, success: true };
  }

  /**
   * Recursively normalize timestamps in API response data
   * This ensures all time strings have proper timezone markers
   */
  private normalizeTimestampsInResponse(data: any): any {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => this.normalizeTimestampsInResponse(item));
    }
    
    if (typeof data === 'object') {
      const normalized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Check if this is a timestamp field
        if (this.isTimestampField(key, value)) {
          normalized[key] = normalizeToUTCString(value as string);
          console.log(`🕐 Normalized timestamp field ${key}:`, {
            original: value,
            normalized: normalized[key]
          });
        } else {
          normalized[key] = this.normalizeTimestampsInResponse(value);
        }
      }
      return normalized;
    }
    
    return data;
  }

  /**
   * Check if a field contains a timestamp value
   */
  private isTimestampField(key: string, value: any): boolean {
    if (typeof value !== 'string') return false;
    
    // Common timestamp field names
    const timestampFields = [
      'start_time', 'end_time', 'created_at', 'updated_at', 
      'date', 'time', 'timestamp', 'scheduled_at', 'appointment_time'
    ];
    
    // Check if field name suggests it's a timestamp
    const isTimestampFieldName = timestampFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    );
    
    // Check if value looks like a timestamp (ISO format)
    const isTimestampValue = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
    
    return isTimestampFieldName && isTimestampValue;
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error instanceof ApiError) {
      return { data: null, success: false, error: error.message };
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return { data: null, success: false, error: 'Network error. Please check your connection.' };
    }

    return { data: null, success: false, error: error.message || 'An unexpected error occurred' };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = this.getHeaders();
    console.log('API GET request:', {
      endpoint,
      mockMode: this.mockMode,
      baseURL: this.baseURL,
      fullURL: `${this.baseURL}${endpoint}`,
      headers: {
        'X-Tenant-ID': headers['X-Tenant-ID'],
        'Authorization': headers['Authorization'] ? 'Bearer ***' : 'None'
      }
    });

    if (this.mockMode) {
      console.log('Using mock data for:', endpoint);
      return this.getMockData<T>(endpoint);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      console.log('API response:', {
        endpoint,
        status: response.status,
        ok: response.ok
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API error:', {
        endpoint,
        error: error
      });
      return await this.handleError(error);
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const headers = this.getHeaders();
    console.log('API POST request:', {
      endpoint,
      mockMode: this.mockMode,
      baseURL: this.baseURL,
      fullURL: `${this.baseURL}${endpoint}`,
      data,
      headers: {
        'X-Tenant-ID': headers['X-Tenant-ID'],
        'Authorization': headers['Authorization'] ? 'Bearer ***' : 'None'
      }
    });

    if (this.mockMode) {
      console.log('Using mock data for:', endpoint);
      return this.getMockData<T>(endpoint, 'POST', data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      console.log('API response:', {
        endpoint,
        status: response.status,
        ok: response.ok
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API error:', {
        endpoint,
        error: error
      });
      return await this.handleError(error);
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    if (this.mockMode) {
      return this.getMockData<T>(endpoint, 'PUT', data);
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: data ? JSON.stringify(data) : undefined,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    if (this.mockMode) {
      return this.getMockData<T>(endpoint, 'DELETE');
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return await this.handleError(error);
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('access_token');
      }
    }
  }

  setTenantId(tenantId: string | null) {
    if (typeof window !== 'undefined') {
      if (tenantId) {
        localStorage.setItem('current_tenant_id', tenantId);
        console.log('API Client: Tenant ID set to', tenantId);
      } else {
        localStorage.removeItem('current_tenant_id');
        console.log('API Client: Tenant ID removed');
      }
    }
  }

  getCurrentTenantId(): string | null {
    if (typeof window !== 'undefined') {
      const tenantId = localStorage.getItem('current_tenant_id');
      console.log('API Client: Current tenant ID from localStorage:', tenantId);
      return tenantId;
    }
    return null;
  }

  private async getMockData<T>(endpoint: string, method: string = 'GET', data?: any): Promise<ApiResponse<T>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock data based on endpoint
    const mockData = this.getMockDataForEndpoint<T>(endpoint, method, data);
    
    return {
      data: mockData,
      success: true,
    };
  }

  private getMockDataForEndpoint<T>(endpoint: string, method: string, data?: any): T {
    // Auth endpoints
    if (endpoint.includes('/auth/login')) {
      return {
        access_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        user: {
          id: '1',
          email: data?.email || 'user@example.com',
          name: 'John Doe',
          role: 'barber',
        }
      } as T;
    }

    if (endpoint.includes('/auth/me')) {
      return {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'barber',
      } as T;
    }

    if (endpoint.includes('/auth/register')) {
      return {
        message: 'Registration successful',
        user: {
          id: '1',
          email: data?.email || 'user@example.com',
          name: data?.name || 'John Doe',
          role: 'barber',
        }
      } as T;
    }

    // Dashboard endpoints
    if (endpoint.includes('/dashboard/stats')) {
      return {
        totalBookings: 45,
        todayBookings: 8,
        totalRevenue: 12500,
        activeClients: 23,
        upcomingAppointments: 12,
      } as T;
    }

    if (endpoint.includes('/bookings')) {
      return [
        {
          id: '1',
          clientName: 'John Smith',
          service: 'Haircut',
          date: '2024-01-15',
          time: '10:00',
          status: 'confirmed',
          barber: 'Mike Johnson',
        },
        {
          id: '2',
          clientName: 'Jane Doe',
          service: 'Beard Trim',
          date: '2024-01-15',
          time: '11:30',
          status: 'pending',
          barber: 'Mike Johnson',
        },
      ] as T;
    }

    if (endpoint.includes('/clients')) {
      return [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+1234567890',
          totalBookings: 5,
          lastVisit: '2024-01-10',
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+1234567891',
          totalBookings: 3,
          lastVisit: '2024-01-12',
        },
      ] as T;
    }

    if (endpoint.includes('/barbers')) {
      return [
        {
          id: '1',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          phone: '+1234567892',
          specialties: ['Haircut', 'Beard Trim'],
          isActive: true,
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          phone: '+1234567893',
          specialties: ['Haircut', 'Styling'],
          isActive: true,
        },
      ] as T;
    }

    if (endpoint.includes('/services')) {
      return [
        {
          id: '1',
          name: 'Haircut',
          description: 'Professional haircut service',
          duration: 30,
          price: 25.00,
          isActive: true,
        },
        {
          id: '2',
          name: 'Beard Trim',
          description: 'Professional beard trimming',
          duration: 15,
          price: 15.00,
          isActive: true,
        },
      ] as T;
    }

    if (endpoint.includes('/appointments')) {
      // Handle POST requests for creating appointments
      if (method === 'POST') {
        return {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as T;
      }
      
      // Handle GET requests for fetching appointments
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return [
        {
          id: '1',
          start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
          end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).toISOString(),
          customer: {
            name: 'John Smith',
            phone: '+1234567890',
            email: 'john@example.com'
          },
          service: {
            name: 'Haircut'
          },
          barber: {
            name: 'Mike Johnson'
          },
          barber_id: '1',
          service_id: '1',
          status: 'confirmed',
          notes: 'Regular haircut appointment'
        },
        {
          id: '2',
          start_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30).toISOString(),
          end_time: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0).toISOString(),
          customer: {
            name: 'Jane Doe',
            phone: '+1234567891',
            email: 'jane@example.com'
          },
          service: {
            name: 'Beard Trim'
          },
          barber: {
            name: 'Mike Johnson'
          },
          barber_id: '1',
          service_id: '2',
          status: 'confirmed',
          notes: 'Beard trimming service'
        },
        {
          id: '3',
          start_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 0).toISOString(),
          end_time: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 14, 30).toISOString(),
          customer: {
            name: 'Bob Wilson',
            phone: '+1234567892',
            email: 'bob@example.com'
          },
          service: {
            name: 'Haircut'
          },
          barber: {
            name: 'Sarah Wilson'
          },
          barber_id: '2',
          service_id: '1',
          status: 'pending',
          notes: 'First time customer'
        }
      ] as T;
    }

    if (endpoint.includes('/tenants/my')) {
      return [
        {
          id: '1',
          name: 'Downtown Barbershop',
          address: '123 Main St, City, State',
          phone: '+1234567890',
          email: 'info@downtownbarbers.com',
          isActive: true,
          timezone: 'America/New_York',
        },
      ] as T;
    }

    // Admin endpoints
    if (endpoint.includes('/admin/metrics')) {
      return {
        totalUsers: 150,
        totalTenants: 25,
        totalBookings: 1250,
        systemHealth: 'healthy',
        uptime: '99.9%',
      } as T;
    }

    // Default mock response
    return { message: 'Mock data response' } as T;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiResponse, ApiError };
