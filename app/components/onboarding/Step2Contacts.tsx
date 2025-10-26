'use client';

import React, { useState } from 'react';
import { Users, Phone, Mail, MapPin, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Step2ContactsProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step2Contacts: React.FC<Step2ContactsProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    owner: {
      name: data?.contacts?.owner?.name || '',
      email: data?.contacts?.owner?.email || '',
      phone: data?.contacts?.owner?.phone || '',
      mobile: data?.contacts?.owner?.mobile || data?.contacts?.owner?.phone || '',
      title: data?.contacts?.owner?.title || 'Owner',
      role: 'owner',
      preferredContact: data?.contacts?.owner?.preferredContact || 'email'
    },
    emergency: {
      name: data?.contacts?.emergency?.name || '',
      email: data?.contacts?.emergency?.email || '',
      phone: data?.contacts?.emergency?.phone || '',
      relationship: data?.contacts?.emergency?.relationship || ''
    },
    redirect: {
      name: data?.contacts?.redirect?.name || data?.contacts?.owner?.name || '',
      email: data?.contacts?.redirect?.email || data?.contacts?.owner?.email || '',
      phone: data?.contacts?.redirect?.phone || data?.contacts?.owner?.phone || ''
    },
    billing: {
      name: data?.contacts?.billing?.name || data?.contacts?.owner?.name || '',
      email: data?.contacts?.billing?.email || data?.contacts?.owner?.email || '',
      phone: data?.contacts?.billing?.phone || data?.contacts?.owner?.phone || ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
    setErrors(prev => ({
      ...prev,
      [`${section}_${field}`]: ''
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Owner validation
    if (!formData.owner.name.trim()) {
      newErrors.owner_name = 'Owner name is required';
    }
    if (!formData.owner.email.trim()) {
      newErrors.owner_email = 'Owner email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.owner.email)) {
      newErrors.owner_email = 'Please enter a valid email address';
    }
    if (!formData.owner.phone.trim()) {
      newErrors.owner_phone = 'Owner phone is required';
    }
    
    // Mobile validation - must be in E.164 format if provided
    if (formData.owner.mobile && !/^\+[1-9]\d{1,14}$/.test(formData.owner.mobile)) {
      newErrors.owner_mobile = 'Mobile number must be in E.164 format (e.g., +1234567890)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        contacts: formData
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
        <p className="text-gray-600">Primary contacts for your business</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Owner Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Business Owner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="owner_name">Full Name *</Label>
              <Input
                id="owner_name"
                value={formData.owner.name}
                onChange={(e) => handleInputChange('owner', 'name', e.target.value)}
                placeholder="Enter full name"
                className={errors.owner_name ? 'border-red-500' : ''}
              />
              {errors.owner_name && (
                <p className="text-sm text-red-600">{errors.owner_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_email">Email *</Label>
              <Input
                id="owner_email"
                type="email"
                value={formData.owner.email}
                onChange={(e) => handleInputChange('owner', 'email', e.target.value)}
                placeholder="owner@example.com"
                className={errors.owner_email ? 'border-red-500' : ''}
              />
              {errors.owner_email && (
                <p className="text-sm text-red-600">{errors.owner_email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_phone">Phone *</Label>
              <Input
                id="owner_phone"
                value={formData.owner.phone}
                onChange={(e) => handleInputChange('owner', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={errors.owner_phone ? 'border-red-500' : ''}
              />
              {errors.owner_phone && (
                <p className="text-sm text-red-600">{errors.owner_phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_mobile">Mobile</Label>
              <Input
                id="owner_mobile"
                value={formData.owner.mobile}
                onChange={(e) => handleInputChange('owner', 'mobile', e.target.value)}
                placeholder="+1234567890"
                className={errors.owner_mobile ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500">Enter in E.164 format (e.g., +1234567890)</p>
              {errors.owner_mobile && (
                <p className="text-sm text-red-600">{errors.owner_mobile}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_title">Title</Label>
              <Input
                id="owner_title"
                value={formData.owner.title}
                onChange={(e) => handleInputChange('owner', 'title', e.target.value)}
                placeholder="Owner, Manager, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_preferredContact">Preferred Contact Method</Label>
              <select
                id="owner_preferredContact"
                value={formData.owner.preferredContact}
                onChange={(e) => handleInputChange('owner', 'preferredContact', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_name">Full Name</Label>
              <Input
                id="emergency_name"
                value={formData.emergency.name}
                onChange={(e) => handleInputChange('emergency', 'name', e.target.value)}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_email">Email</Label>
              <Input
                id="emergency_email"
                type="email"
                value={formData.emergency.email}
                onChange={(e) => handleInputChange('emergency', 'email', e.target.value)}
                placeholder="emergency@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_phone">Phone</Label>
              <Input
                id="emergency_phone"
                value={formData.emergency.phone}
                onChange={(e) => handleInputChange('emergency', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_relationship">Relationship</Label>
              <Input
                id="emergency_relationship"
                value={formData.emergency.relationship}
                onChange={(e) => handleInputChange('emergency', 'relationship', e.target.value)}
                placeholder="e.g., Manager, Partner"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Redirect Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Redirect Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="redirect_name">Name</Label>
              <Input
                id="redirect_name"
                value={formData.redirect.name}
                onChange={(e) => handleInputChange('redirect', 'name', e.target.value)}
                placeholder="Contact person name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect_email">Email</Label>
              <Input
                id="redirect_email"
                type="email"
                value={formData.redirect.email}
                onChange={(e) => handleInputChange('redirect', 'email', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect_phone">Phone</Label>
              <Input
                id="redirect_phone"
                value={formData.redirect.phone}
                onChange={(e) => handleInputChange('redirect', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect_title">Title</Label>
              <Input
                id="redirect_title"
                value={formData.redirect.name}
                onChange={(e) => handleInputChange('redirect', 'name', e.target.value)}
                placeholder="Contact Person"
              />
            </div>
          </CardContent>
        </Card>

        {/* Billing Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Billing Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="billing_name">Name</Label>
              <Input
                id="billing_name"
                value={formData.billing.name}
                onChange={(e) => handleInputChange('billing', 'name', e.target.value)}
                placeholder="Billing contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_email">Email</Label>
              <Input
                id="billing_email"
                type="email"
                value={formData.billing.email}
                onChange={(e) => handleInputChange('billing', 'email', e.target.value)}
                placeholder="billing@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_phone">Phone</Label>
              <Input
                id="billing_phone"
                value={formData.billing.phone}
                onChange={(e) => handleInputChange('billing', 'phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step2Contacts;
