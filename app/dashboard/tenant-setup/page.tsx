'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '../../contexts/TenantContext';
import { Building, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';

const TenantSetupPage = () => {
  const router = useRouter();
  const { createTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tenantData, setTenantData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await createTenant(tenantData);
      
      if (result.success) {
        // Redirect to dashboard after successful tenant creation
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to create tenant');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center space-x-2">
            <Building className="h-6 w-6" />
            <span>Setup Your Business</span>
          </CardTitle>
          <CardDescription>
            Create your business profile to get started with Avella AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={tenantData.name}
                  onChange={(e) => setTenantData({...tenantData, name: e.target.value})}
                  placeholder="Enter your business name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={tenantData.address}
                  onChange={(e) => setTenantData({...tenantData, address: e.target.value})}
                  placeholder="Enter your business address"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={tenantData.phone}
                    onChange={(e) => setTenantData({...tenantData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={tenantData.email}
                    onChange={(e) => setTenantData({...tenantData, email: e.target.value})}
                    placeholder="Enter business email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={tenantData.website}
                  onChange={(e) => setTenantData({...tenantData, website: e.target.value})}
                  placeholder="Enter website URL (optional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  value={tenantData.description}
                  onChange={(e) => setTenantData({...tenantData, description: e.target.value})}
                  placeholder="Describe your business (optional)"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Skip for Now
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Business'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantSetupPage;
