'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

interface TestResult {
  success: boolean;
  data: any;
  error?: string;
  status: 'success' | 'error';
}

const TestAPIsPage = () => {
  const { currentTenant } = useTenant();
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string, name: string) => {
    try {
      console.log(`Testing ${name} API: ${endpoint}`);
      const response = await apiClient.get(endpoint);
      console.log(`${name} API response:`, response);
      
      setResults(prev => ({
        ...prev,
        [name]: {
          success: response.success,
          data: response.data,
          error: response.error,
          status: response.success ? 'success' : 'error'
        }
      }));
    } catch (error) {
      console.error(`${name} API error:`, error);
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          data: null,
          error: String(error),
          status: 'error'
        }
      }));
    }
  };

  const testAllAPIs = async () => {
    setLoading(true);
    setResults({});
    
    console.log('=== Testing All APIs ===');
    console.log('Current Tenant:', currentTenant);
    console.log('API Client Tenant ID:', apiClient.getCurrentTenantId());
    
    await Promise.all([
      testAPI('/appointments', 'Appointments'),
      testAPI('/services', 'Services'),
      testAPI('/barbers', 'Barbers'),
      testAPI('/dashboard/stats', 'Dashboard Stats')
    ]);
    
    setLoading(false);
  };

  const testSingleAPI = (endpoint: string, name: string) => {
    testAPI(endpoint, name);
  };

  useEffect(() => {
    if (currentTenant) {
      console.log('Tenant available, ready to test APIs');
    }
  }, [currentTenant]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Test Page</h1>
        <p className="text-muted-foreground">Test all APIs to debug fetching issues</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Current Tenant:</strong> {currentTenant ? currentTenant.name : 'None'}
            </div>
            <div>
              <strong>Tenant ID:</strong> {currentTenant ? currentTenant.id : 'None'}
            </div>
            <div>
              <strong>API Client Tenant ID:</strong> {apiClient.getCurrentTenantId() || 'None'}
            </div>
            <div>
              <strong>Authentication:</strong> {typeof window !== 'undefined' && localStorage.getItem('token') ? 'Logged In' : 'Not Logged In'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={testAllAPIs} 
              disabled={loading || !currentTenant}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test All APIs'}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSingleAPI('/appointments', 'Appointments')}
                disabled={loading}
              >
                Test Appointments
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSingleAPI('/services', 'Services')}
                disabled={loading}
              >
                Test Services
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSingleAPI('/barbers', 'Barbers')}
                disabled={loading}
              >
                Test Barbers
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => testSingleAPI('/dashboard/stats', 'Stats')}
                disabled={loading}
              >
                Test Stats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(results).map(([name, result]: [string, any]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {name}
                <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                  {result.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Success:</strong> {result.success ? 'Yes' : 'No'}
                </div>
                {result.error && (
                  <div>
                    <strong>Error:</strong> 
                    <pre className="text-xs bg-red-50 p-2 rounded mt-1">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                )}
                {result.data && (
                  <div>
                    <strong>Data Count:</strong> {Array.isArray(result.data) ? result.data.length : 'Not an array'}
                  </div>
                )}
                {result.data && (
                  <div>
                    <strong>Sample Data:</strong>
                    <pre className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-32 overflow-auto">
                      {JSON.stringify(Array.isArray(result.data) ? result.data.slice(0, 2) : result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {Object.keys(results).length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Click "Test All APIs" to start testing</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestAPIsPage;
