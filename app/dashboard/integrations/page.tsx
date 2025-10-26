'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { 
  Link, 
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
  Calendar,
  MessageSquare,
  CreditCard,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';

interface ConfigData {
  client_id?: string;
  client_secret?: string;
  api_key?: string;
  webhook_url?: string;
  account_sid?: string;
  auth_token?: string;
  phone_number?: string;
  publishable_key?: string;
  secret_key?: string;
  [key: string]: any;
}

const IntegrationsPage = () => {
  const { currentTenant } = useTenant();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [configData, setConfigData] = useState<ConfigData>({});

  const availableIntegrations = [
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sync appointments with Google Calendar',
      icon: Calendar,
      category: 'Calendar',
      status: 'available',
      features: ['Two-way sync', 'Automatic updates', 'Conflict detection']
    },
    {
      id: 'microsoft_calendar',
      name: 'Microsoft Calendar',
      description: 'Sync appointments with Microsoft Outlook',
      icon: Calendar,
      category: 'Calendar',
      status: 'available',
      features: ['Outlook integration', 'Office 365 sync', 'Team scheduling']
    },
    {
      id: 'twilio',
      name: 'Twilio SMS',
      description: 'Send SMS notifications and reminders',
      icon: MessageSquare,
      category: 'Communication',
      status: 'connected',
      features: ['SMS reminders', 'Appointment confirmations', 'Two-way messaging']
    },
    {
      id: 'stripe',
      name: 'Stripe Payments',
      description: 'Process online payments securely',
      icon: CreditCard,
      category: 'Payment',
      status: 'available',
      features: ['Card payments', 'Refunds', 'Subscription billing']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Accept PayPal payments',
      icon: CreditCard,
      category: 'Payment',
      status: 'available',
      features: ['PayPal checkout', 'Recurring payments', 'International support']
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing and automation',
      icon: Mail,
      category: 'Marketing',
      status: 'available',
      features: ['Email campaigns', 'Automation', 'Customer segmentation']
    },
    {
      id: 'retell_ai',
      name: 'Retell AI',
      description: 'AI-powered voice assistant for bookings',
      icon: Phone,
      category: 'AI',
      status: 'connected',
      features: ['Voice bookings', 'Natural language', '24/7 availability']
    },
    {
      id: 'website_widget',
      name: 'Website Widget',
      description: 'Embed booking widget on your website',
      icon: Globe,
      category: 'Website',
      status: 'available',
      features: ['Embeddable widget', 'Custom styling', 'Mobile responsive']
    }
  ];

  useEffect(() => {
    if (currentTenant) {
      loadIntegrations();
    }
  }, [currentTenant]);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/integrations');
      if (response.success) {
        setIntegrations(response.data as any[]);
      }
    } catch (error) {
      console.error('Error loading integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (integration: any) => {
    setSelectedIntegration(integration);
    setConfigData({});
    setShowConfigModal(true);
  };

  const handleDisconnect = async (integrationId: string) => {
    try {
      const response = await apiClient.delete(`/integrations/${integrationId}`);
      if (response.success) {
        setIntegrations(integrations.filter(i => i.id !== integrationId));
      }
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const handleConfigure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post('/integrations', {
        integration_id: selectedIntegration.id,
        config: configData
      });
      if (response.success) {
        setIntegrations([...integrations, response.data]);
        setShowConfigModal(false);
        setSelectedIntegration(null);
      }
    } catch (error) {
      console.error('Error configuring integration:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Calendar': return 'bg-blue-100 text-blue-800';
      case 'Communication': return 'bg-green-100 text-green-800';
      case 'Payment': return 'bg-purple-100 text-purple-800';
      case 'Marketing': return 'bg-orange-100 text-orange-800';
      case 'AI': return 'bg-pink-100 text-pink-800';
      case 'Website': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect with third-party services to enhance your business</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {availableIntegrations.map((integration) => {
          const Icon = integration.icon;
          const isConnected = integration.status === 'connected';
          const connectedIntegration = integrations.find(i => i.integration_id === integration.id);
          
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge className={getCategoryColor(integration.category)}>
                        {integration.category}
                      </Badge>
                    </div>
                  </div>
                  {getStatusIcon(integration.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{integration.description}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Features:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {integration.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  {getStatusBadge(integration.status)}
                  <div className="flex space-x-2">
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(connectedIntegration?.id)}
                        >
                          Disconnect
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConnect(integration)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(integration)}
                      >
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showConfigModal} onOpenChange={setShowConfigModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Configure {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              Set up your {selectedIntegration?.name} integration
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfigure} className="space-y-4">
            {selectedIntegration?.id === 'google_calendar' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client ID</Label>
                  <Input
                    id="client_id"
                    value={configData.client_id || ''}
                    onChange={(e) => setConfigData({...configData, client_id: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client_secret">Client Secret</Label>
                  <Input
                    id="client_secret"
                    type="password"
                    value={configData.client_secret || ''}
                    onChange={(e) => setConfigData({...configData, client_secret: e.target.value})}
                    required
                  />
                </div>
              </>
            )}
            
            {selectedIntegration?.id === 'twilio' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="account_sid">Account SID</Label>
                  <Input
                    id="account_sid"
                    value={configData.account_sid || ''}
                    onChange={(e) => setConfigData({...configData, account_sid: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth_token">Auth Token</Label>
                  <Input
                    id="auth_token"
                    type="password"
                    value={configData.auth_token || ''}
                    onChange={(e) => setConfigData({...configData, auth_token: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    value={configData.phone_number || ''}
                    onChange={(e) => setConfigData({...configData, phone_number: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            {selectedIntegration?.id === 'stripe' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="publishable_key">Publishable Key</Label>
                  <Input
                    id="publishable_key"
                    value={configData.publishable_key || ''}
                    onChange={(e) => setConfigData({...configData, publishable_key: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret_key">Secret Key</Label>
                  <Input
                    id="secret_key"
                    type="password"
                    value={configData.secret_key || ''}
                    onChange={(e) => setConfigData({...configData, secret_key: e.target.value})}
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowConfigModal(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Connect
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationsPage;
