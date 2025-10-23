'use client';

import React, { useState } from 'react';
import { Building, MapPin, Phone, Mail, Globe, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Step1BusinessBasicsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step1BusinessBasics: React.FC<Step1BusinessBasicsProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    legalName: data?.tenant?.legalName || '',
    brandName: data?.tenant?.brandName || '',
    timezone: data?.tenant?.timezone || 'America/New_York',
    phone: data?.tenant?.phone || '',
    email: data?.tenant?.email || '',
    address: {
      city: data?.tenant?.address?.city || '',
      state: data?.tenant?.address?.state || '',
      country: data?.tenant?.address?.country || 'United States'
    }
  });

  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.legalName.trim()) {
      newErrors.legalName = 'Legal business name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.address.state.trim()) {
      newErrors.state = 'State is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        tenant: {
          legalName: formData.legalName,
          brandName: formData.brandName,
          timezone: formData.timezone,
          phone: formData.phone,
          email: formData.email,
          address: formData.address
        }
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Building className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Business Basics</h2>
        <p className="text-gray-600">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="legalName">Legal Business Name *</Label>
          <Input
            id="legalName"
            value={formData.legalName}
            onChange={(e) => handleInputChange('legalName', e.target.value)}
            placeholder="Enter legal business name"
            className={errors.legalName ? 'border-red-500' : ''}
          />
          {errors.legalName && (
            <p className="text-sm text-red-600">{errors.legalName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="brandName">Brand Name (Optional)</Label>
          <Input
            id="brandName"
            value={formData.brandName}
            onChange={(e) => handleInputChange('brandName', e.target.value)}
            placeholder="Enter brand name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Business Phone *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Business Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="business@example.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone *</Label>
          <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={formData.address.city}
            onChange={(e) => handleAddressChange('city', e.target.value)}
            placeholder="Enter city"
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && (
            <p className="text-sm text-red-600">{errors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.address.state}
            onChange={(e) => handleAddressChange('state', e.target.value)}
            placeholder="Enter state"
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && (
            <p className="text-sm text-red-600">{errors.state}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.address.country}
            onChange={(e) => handleAddressChange('country', e.target.value)}
            placeholder="Enter country"
          />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack} disabled={true}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} disabled={loading}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step1BusinessBasics;
