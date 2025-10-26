'use client';

import React, { useState } from 'react';
import { Shield, FileText, Mail, Phone, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';

interface Step9ConsentTemplatesProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step9ConsentTemplates: React.FC<Step9ConsentTemplatesProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [consentSettings, setConsentSettings] = useState({
    enableConsent: data?.consentSettings?.enableConsent || true,
    consentText: data?.consentSettings?.consentText || 'By booking an appointment, you agree to our terms of service and privacy policy.',
    requireConsent: data?.consentSettings?.requireConsent || true,
    enableDataCollection: data?.consentSettings?.enableDataCollection || true,
    dataCollectionText: data?.consentSettings?.dataCollectionText || 'We collect your contact information to provide appointment services and send you reminders.',
    enableMarketing: data?.consentSettings?.enableMarketing || false,
    marketingText: data?.consentSettings?.marketingText || 'We may send you promotional offers and updates about our services.',
    enableSMS: data?.consentSettings?.enableSMS || true,
    smsText: data?.consentSettings?.smsText || 'We may send you appointment reminders and updates via SMS.',
    enableEmail: data?.consentSettings?.enableEmail || true,
    emailText: data?.consentSettings?.emailText || 'We may send you appointment confirmations and updates via email.'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setConsentSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (consentSettings.enableConsent && !consentSettings.consentText.trim()) {
      newErrors.consentText = 'Consent text is required';
    }

    if (consentSettings.enableDataCollection && !consentSettings.dataCollectionText.trim()) {
      newErrors.dataCollectionText = 'Data collection text is required';
    }

    if (consentSettings.enableMarketing && !consentSettings.marketingText.trim()) {
      newErrors.marketingText = 'Marketing text is required';
    }

    if (consentSettings.enableSMS && !consentSettings.smsText.trim()) {
      newErrors.smsText = 'SMS text is required';
    }

    if (consentSettings.enableEmail && !consentSettings.emailText.trim()) {
      newErrors.emailText = 'Email text is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        consentSettings
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Consent & Templates</h2>
        <p className="text-gray-600">Configure consent forms and communication templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              General Consent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableConsent">Enable Consent Forms</Label>
                <p className="text-sm text-gray-500">Show consent forms to customers</p>
              </div>
              <Switch
                id="enableConsent"
                checked={consentSettings.enableConsent}
                onCheckedChange={(checked) => handleInputChange('enableConsent', checked)}
              />
            </div>

            {consentSettings.enableConsent && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="requireConsent">Require Consent</Label>
                    <p className="text-sm text-gray-500">Make consent mandatory for booking</p>
                  </div>
                  <Switch
                    id="requireConsent"
                    checked={consentSettings.requireConsent}
                    onCheckedChange={(checked) => handleInputChange('requireConsent', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consentText">Consent Text *</Label>
                  <Textarea
                    id="consentText"
                    value={consentSettings.consentText}
                    onChange={(e) => handleInputChange('consentText', e.target.value)}
                    placeholder="Enter consent text..."
                    rows={3}
                    className={errors.consentText ? 'border-red-500' : ''}
                  />
                  {errors.consentText && (
                    <p className="text-sm text-red-600">{errors.consentText}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Data Collection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableDataCollection">Enable Data Collection Notice</Label>
                <p className="text-sm text-gray-500">Inform customers about data collection</p>
              </div>
              <Switch
                id="enableDataCollection"
                checked={consentSettings.enableDataCollection}
                onCheckedChange={(checked) => handleInputChange('enableDataCollection', checked)}
              />
            </div>

            {consentSettings.enableDataCollection && (
              <div className="space-y-2">
                <Label htmlFor="dataCollectionText">Data Collection Text *</Label>
                <Textarea
                  id="dataCollectionText"
                  value={consentSettings.dataCollectionText}
                  onChange={(e) => handleInputChange('dataCollectionText', e.target.value)}
                  placeholder="Enter data collection notice..."
                  rows={3}
                  className={errors.dataCollectionText ? 'border-red-500' : ''}
                />
                {errors.dataCollectionText && (
                  <p className="text-sm text-red-600">{errors.dataCollectionText}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Marketing Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableMarketing">Enable Marketing Consent</Label>
                <p className="text-sm text-gray-500">Allow customers to opt-in to marketing</p>
              </div>
              <Switch
                id="enableMarketing"
                checked={consentSettings.enableMarketing}
                onCheckedChange={(checked) => handleInputChange('enableMarketing', checked)}
              />
            </div>

            {consentSettings.enableMarketing && (
              <div className="space-y-2">
                <Label htmlFor="marketingText">Marketing Text *</Label>
                <Textarea
                  id="marketingText"
                  value={consentSettings.marketingText}
                  onChange={(e) => handleInputChange('marketingText', e.target.value)}
                  placeholder="Enter marketing consent text..."
                  rows={3}
                  className={errors.marketingText ? 'border-red-500' : ''}
                />
                {errors.marketingText && (
                  <p className="text-sm text-red-600">{errors.marketingText}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              SMS Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableSMS">Enable SMS Consent</Label>
                <p className="text-sm text-gray-500">Allow customers to opt-in to SMS</p>
              </div>
              <Switch
                id="enableSMS"
                checked={consentSettings.enableSMS}
                onCheckedChange={(checked) => handleInputChange('enableSMS', checked)}
              />
            </div>

            {consentSettings.enableSMS && (
              <div className="space-y-2">
                <Label htmlFor="smsText">SMS Text *</Label>
                <Textarea
                  id="smsText"
                  value={consentSettings.smsText}
                  onChange={(e) => handleInputChange('smsText', e.target.value)}
                  placeholder="Enter SMS consent text..."
                  rows={3}
                  className={errors.smsText ? 'border-red-500' : ''}
                />
                {errors.smsText && (
                  <p className="text-sm text-red-600">{errors.smsText}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableEmail">Enable Email Consent</Label>
                <p className="text-sm text-gray-500">Allow customers to opt-in to email</p>
              </div>
              <Switch
                id="enableEmail"
                checked={consentSettings.enableEmail}
                onCheckedChange={(checked) => handleInputChange('enableEmail', checked)}
              />
            </div>

            {consentSettings.enableEmail && (
              <div className="space-y-2">
                <Label htmlFor="emailText">Email Text *</Label>
                <Textarea
                  id="emailText"
                  value={consentSettings.emailText}
                  onChange={(e) => handleInputChange('emailText', e.target.value)}
                  placeholder="Enter email consent text..."
                  rows={3}
                  className={errors.emailText ? 'border-red-500' : ''}
                />
                {errors.emailText && (
                  <p className="text-sm text-red-600">{errors.emailText}</p>
                )}
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
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Step9ConsentTemplates;
