'use client';

import React, { useState } from 'react';
import { apiClient } from '../../lib/api';

const TestApiPage = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDirectFetch = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': 'test-tenant-id'
        }
      });

      const data = await response.json();
      setResult({
        method: 'Direct Fetch',
        status: response.status,
        data: data
      });
    } catch (err) {
      setError(`Direct Fetch Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testApiClient = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get('/health');
      setResult({
        method: 'API Client',
        success: response.success,
        data: response.data,
        error: response.error
      });
    } catch (err) {
      setError(`API Client Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const testBarbersApi = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await apiClient.get('/barbers');
      setResult({
        method: 'Barbers API',
        success: response.success,
        data: response.data,
        error: response.error
      });
    } catch (err) {
      setError(`Barbers API Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">API Test Page</h1>
        <p className="text-muted-foreground">Test different API call methods</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="p-4 border rounded-md hover:bg-accent disabled:opacity-50"
        >
          <h3 className="font-semibold">Test Direct Fetch</h3>
          <p className="text-sm text-muted-foreground">Direct fetch to /api/health</p>
        </button>

        <button
          onClick={testApiClient}
          disabled={loading}
          className="p-4 border rounded-md hover:bg-accent disabled:opacity-50"
        >
          <h3 className="font-semibold">Test API Client</h3>
          <p className="text-sm text-muted-foreground">Using apiClient.get('/health')</p>
        </button>

        <button
          onClick={testBarbersApi}
          disabled={loading}
          className="p-4 border rounded-md hover:bg-accent disabled:opacity-50"
        >
          <h3 className="font-semibold">Test Barbers API</h3>
          <p className="text-sm text-muted-foreground">Using apiClient.get('/barbers')</p>
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Testing API...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-semibold text-red-800">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800">Result</h3>
          <pre className="text-sm text-green-600 mt-2 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestApiPage;
