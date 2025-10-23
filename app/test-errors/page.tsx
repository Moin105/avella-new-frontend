'use client';

import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { AlertTriangle, Bug, Zap, Database, Globe, Server } from 'lucide-react';

export default function TestErrorHandling() {
  const [errors, setErrors] = useState<string[]>([]);

  const triggerError = (type: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setErrors(prev => [...prev, `${timestamp}: ${type} error triggered`]);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Error Handling Demo</h1>
          <p className="text-muted-foreground">
            Test various error scenarios and see how the application handles them
          </p>
        </div>

        {/* Error Triggers */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <span>Client Errors</span>
              </CardTitle>
              <CardDescription>
                Test client-side error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => triggerError('JavaScript')}
                variant="outline"
                className="w-full"
              >
                JavaScript Error
              </Button>
              <Button 
                onClick={() => triggerError('TypeScript')}
                variant="outline"
                className="w-full"
              >
                TypeScript Error
              </Button>
              <Button 
                onClick={() => triggerError('React')}
                variant="outline"
                className="w-full"
              >
                React Error
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Network Errors</span>
              </CardTitle>
              <CardDescription>
                Test network and API error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => triggerError('Network')}
                variant="outline"
                className="w-full"
              >
                Network Error
              </Button>
              <Button 
                onClick={() => triggerError('API Timeout')}
                variant="outline"
                className="w-full"
              >
                API Timeout
              </Button>
              <Button 
                onClick={() => triggerError('Server Error')}
                variant="outline"
                className="w-full"
              >
                Server Error
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>System Errors</span>
              </CardTitle>
              <CardDescription>
                Test system-level error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={() => triggerError('Database')}
                variant="outline"
                className="w-full"
              >
                Database Error
              </Button>
              <Button 
                onClick={() => triggerError('Authentication')}
                variant="outline"
                className="w-full"
              >
                Auth Error
              </Button>
              <Button 
                onClick={() => triggerError('Permission')}
                variant="outline"
                className="w-full"
              >
                Permission Error
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Error Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Error Log</span>
              </span>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {errors.length} errors
                </Badge>
                <Button 
                  onClick={clearErrors}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Track and monitor error occurrences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No errors triggered yet. Click the buttons above to test error handling.
              </div>
            ) : (
              <div className="space-y-2">
                {errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Current system status and health metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Frontend</span>
                  </div>
                  <Badge variant="secondary">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Backend API</span>
                  </div>
                  <Badge variant="secondary">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="secondary">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">AI Services</span>
                  </div>
                  <Badge variant="outline">Degraded</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Statistics</CardTitle>
              <CardDescription>
                Error tracking and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Total Errors</span>
                  <span className="font-medium">{errors.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Error Rate</span>
                  <span className="font-medium">0.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="font-medium">99.9%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Last Error</span>
                  <span className="font-medium">
                    {errors.length > 0 ? errors[errors.length - 1].split(': ')[0] : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
