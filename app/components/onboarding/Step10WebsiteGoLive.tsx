'use client';

import React, { useState } from 'react';
import { Globe, Calendar, CheckCircle, AlertCircle, ExternalLink, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

interface Step10WebsiteGoLiveProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step10WebsiteGoLive: React.FC<Step10WebsiteGoLiveProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [websiteSettings, setWebsiteSettings] = useState({
    enableWebsite: data?.websiteSettings?.enableWebsite || true,
    websiteSlug: data?.websiteSettings?.websiteSlug || '',
    websiteTitle: data?.websiteSettings?.websiteTitle || '',
    websiteDescription: data?.websiteSettings?.websiteDescription || '',
    websiteColor: data?.websiteSettings?.websiteColor || '#3B82F6',
    enableOnlineBooking: data?.websiteSettings?.enableOnlineBooking || true,
    enableCustomerPortal: data?.websiteSettings?.enableCustomerPortal || true,
    goLiveDate: data?.goLiveDate || new Date().toISOString().split('T')[0],
    enableMaintenanceMode: data?.enableMaintenanceMode || false,
    maintenanceMessage: data?.maintenanceMessage || 'We are currently updating our system. Please check back later.'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setWebsiteSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSlugChange = (value: string) => {
    // Clean the slug in real-time
    const cleanedSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '') // Remove invalid characters
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    setWebsiteSettings(prev => ({
      ...prev,
      websiteSlug: cleanedSlug
    }));
    setErrors(prev => ({
      ...prev,
      websiteSlug: ''
    }));
  };

  const generateWebsiteSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setWebsiteSettings(prev => ({
      ...prev,
      websiteTitle: value,
      websiteSlug: generateWebsiteSlug(value)
    }));
  };

  const generateWebsite = async () => {
    setIsGeneratingWebsite(true);
    try {
      // This would typically call an API to generate the website
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful generation
      setWebsiteSettings(prev => ({
        ...prev,
        enableWebsite: true
      }));
    } catch (error) {
      console.error('Error generating website:', error);
    } finally {
      setIsGeneratingWebsite(false);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (websiteSettings.enableWebsite) {
      if (!websiteSettings.websiteSlug.trim()) {
        newErrors.websiteSlug = 'Website slug is required';
      } else if (!/^[a-z0-9-]+$/.test(websiteSettings.websiteSlug)) {
        newErrors.websiteSlug = 'Website slug can only contain lowercase letters, numbers, and hyphens. Please remove special characters.';
      } else if (websiteSettings.websiteSlug.startsWith('-') || websiteSettings.websiteSlug.endsWith('-')) {
        newErrors.websiteSlug = 'Website slug cannot start or end with a hyphen';
      } else if (websiteSettings.websiteSlug.length < 3) {
        newErrors.websiteSlug = 'Website slug must be at least 3 characters long';
      }

      if (!websiteSettings.websiteTitle.trim()) {
        newErrors.websiteTitle = 'Website title is required';
      }

      if (!websiteSettings.websiteDescription.trim()) {
        newErrors.websiteDescription = 'Website description is required';
      }
    }

    if (!websiteSettings.goLiveDate) {
      newErrors.goLiveDate = 'Go-live date is required';
    } else if (new Date(websiteSettings.goLiveDate) < new Date()) {
      newErrors.goLiveDate = 'Go-live date cannot be earlier than today';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        websiteSettings,
        goLiveDate: websiteSettings.goLiveDate,
        enableMaintenanceMode: websiteSettings.enableMaintenanceMode,
        maintenanceMessage: websiteSettings.maintenanceMessage
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Website & Go-Live</h2>
        <p className="text-gray-600">Configure your website and set your go-live date</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Website Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableWebsite">Enable Website</Label>
                <p className="text-sm text-gray-500">Create a website for your business</p>
              </div>
              <Switch
                id="enableWebsite"
                checked={websiteSettings.enableWebsite}
                onCheckedChange={(checked) => handleInputChange('enableWebsite', checked)}
              />
            </div>

            {websiteSettings.enableWebsite && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="websiteTitle">Website Title *</Label>
                  <Input
                    id="websiteTitle"
                    value={websiteSettings.websiteTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Enter website title"
                    className={errors.websiteTitle ? 'border-red-500' : ''}
                  />
                  {errors.websiteTitle && (
                    <p className="text-sm text-red-600">{errors.websiteTitle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteSlug">Website URL *</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">avella.ai/</span>
                    <Input
                      id="websiteSlug"
                      value={websiteSettings.websiteSlug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="your-business-name"
                      className={errors.websiteSlug ? 'border-red-500' : ''}
                    />
                  </div>
                  {errors.websiteSlug && (
                    <p className="text-sm text-red-600">{errors.websiteSlug}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteDescription">Website Description *</Label>
                  <Textarea
                    id="websiteDescription"
                    value={websiteSettings.websiteDescription}
                    onChange={(e) => handleInputChange('websiteDescription', e.target.value)}
                    placeholder="Describe your business and services..."
                    rows={3}
                    className={errors.websiteDescription ? 'border-red-500' : ''}
                  />
                  {errors.websiteDescription && (
                    <p className="text-sm text-red-600">{errors.websiteDescription}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="websiteColor">Brand Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="websiteColor"
                      type="color"
                      value={websiteSettings.websiteColor}
                      onChange={(e) => handleInputChange('websiteColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={websiteSettings.websiteColor}
                      onChange={(e) => handleInputChange('websiteColor', e.target.value)}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableOnlineBooking">Enable Online Booking</Label>
                    <p className="text-sm text-gray-500">Allow customers to book online</p>
                  </div>
                  <Switch
                    id="enableOnlineBooking"
                    checked={websiteSettings.enableOnlineBooking}
                    onCheckedChange={(checked) => handleInputChange('enableOnlineBooking', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableCustomerPortal">Enable Customer Portal</Label>
                    <p className="text-sm text-gray-500">Allow customers to manage their bookings</p>
                  </div>
                  <Switch
                    id="enableCustomerPortal"
                    checked={websiteSettings.enableCustomerPortal}
                    onCheckedChange={(checked) => handleInputChange('enableCustomerPortal', checked)}
                  />
                </div>

                <Button
                  onClick={generateWebsite}
                  disabled={isGeneratingWebsite}
                  className="w-full"
                >
                  {isGeneratingWebsite ? 'Generating Website...' : 'Generate Website'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Go-Live Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goLiveDate">Go-Live Date *</Label>
              <Input
                id="goLiveDate"
                type="date"
                value={websiteSettings.goLiveDate}
                onChange={(e) => handleInputChange('goLiveDate', e.target.value)}
                className={errors.goLiveDate ? 'border-red-500' : ''}
              />
              {errors.goLiveDate && (
                <p className="text-sm text-red-600">{errors.goLiveDate}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableMaintenanceMode">Enable Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Show maintenance message before go-live</p>
              </div>
              <Switch
                id="enableMaintenanceMode"
                checked={websiteSettings.enableMaintenanceMode}
                onCheckedChange={(checked) => handleInputChange('enableMaintenanceMode', checked)}
              />
            </div>

            {websiteSettings.enableMaintenanceMode && (
              <div className="space-y-2">
                <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                <Textarea
                  id="maintenanceMessage"
                  value={websiteSettings.maintenanceMessage}
                  onChange={(e) => handleInputChange('maintenanceMessage', e.target.value)}
                  placeholder="Enter maintenance message..."
                  rows={3}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext}>
          Complete Setup
          <CheckCircle className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step10WebsiteGoLive;
