'use client';

import React, { useState } from 'react';
import { apiClient } from './lib/api';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Alert, AlertDescription } from './components/ui/alert';

export default function TestApiConnection() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Auth Me', endpoint: '/auth/me' },
    { name: 'Tenants', endpoint: '/tenants/my' },
    { name: 'Services', endpoint: '/services' },
    { name: 'Barbers', endpoint: '/barbers' },
    { name: 'Appointments', endpoint: '/appointments' },
    { name: 'Admin Metrics', endpoint: '/admin/metrics' },
  ];

  const testAllEndpoints = async () => {
    setLoading(true);
    const testResults: any = {};

    for (const test of testEndpoints) {
      try {
        const response = await apiClient.get(test.endpoint);
        testResults[test.name] = {
          success: response.success,
          data: response.data,
          error: response.error
        };
      } catch (error) {
        testResults[test.name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">API Connection Test</h1>
          <p className="text-muted-foreground">
            Test connection to existing backend APIs
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Backend API Tests</CardTitle>
            <CardDescription>
              Test all available backend endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testAllEndpoints} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test All Endpoints'}
            </Button>
          </CardContent>
        </Card>

        {Object.keys(results).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Results</h2>
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <Card key={name}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className={`text-sm font-medium ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {result.success ? (
                    <div className="text-sm text-muted-foreground">
                      <pre className="bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {result.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Current API configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api'}</div>
              <div><strong>Mock Mode:</strong> {process.env.NEXT_PUBLIC_MOCK === 'true' ? 'Enabled' : 'Disabled'}</div>
              <div><strong>Environment:</strong> {process.env.NODE_ENV}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
