'use client';

import React, { useState } from 'react';
import { Phone, Settings, Volume2, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface Step7PhoneRoutingProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step7PhoneRouting: React.FC<Step7PhoneRoutingProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [phoneSettings, setPhoneSettings] = useState({
    enablePhoneBooking: data?.phoneSettings?.enablePhoneBooking || true,
    businessPhone: data?.phoneSettings?.businessPhone || '',
    routingMethod: data?.phoneSettings?.routingMethod || 'round_robin',
    businessHoursOnly: data?.phoneSettings?.businessHoursOnly || true,
    afterHoursMessage: data?.phoneSettings?.afterHoursMessage || 'Thank you for calling. We are currently closed. Please call back during our business hours or book online.',
    greetingMessage: data?.phoneSettings?.greetingMessage || 'Hello! Thank you for calling. How can I help you today?',
    maxWaitTime: data?.phoneSettings?.maxWaitTime || 300,
    enableVoicemail: data?.phoneSettings?.enableVoicemail || true,
    voicemailMessage: data?.phoneSettings?.voicemailMessage || 'You have reached our voicemail. Please leave your name, phone number, and preferred appointment time, and we will call you back.',
    enableCallRecording: data?.phoneSettings?.enableCallRecording || false
  });

  const [errors, setErrors] = useState<any>({});

  const routingMethods = [
    { value: 'round_robin', label: 'Round Robin (Distribute evenly)' },
    { value: 'least_busy', label: 'Least Busy (Based on current bookings)' },
    { value: 'specific_staff', label: 'Specific Staff Member' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setPhoneSettings(prev => ({
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

    if (phoneSettings.enablePhoneBooking) {
      if (!phoneSettings.businessPhone.trim()) {
        newErrors.businessPhone = 'Business phone number is required';
      } else if (!/^\+?[\d\s\-\(\)]+$/.test(phoneSettings.businessPhone)) {
        newErrors.businessPhone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        phoneSettings
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Phone className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Phone Routing</h2>
        <p className="text-gray-600">Configure how phone calls are handled</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Phone Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enablePhoneBooking">Enable Phone Booking</Label>
                <p className="text-sm text-gray-500">Allow customers to book via phone calls</p>
              </div>
              <Switch
                id="enablePhoneBooking"
                checked={phoneSettings.enablePhoneBooking}
                onCheckedChange={(checked) => handleInputChange('enablePhoneBooking', checked)}
              />
            </div>

            {phoneSettings.enablePhoneBooking && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone Number *</Label>
                  <Input
                    id="businessPhone"
                    value={phoneSettings.businessPhone}
                    onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className={errors.businessPhone ? 'border-red-500' : ''}
                  />
                  {errors.businessPhone && (
                    <p className="text-sm text-red-600">{errors.businessPhone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingMethod">Call Routing Method</Label>
                  <Select 
                    value={phoneSettings.routingMethod} 
                    onValueChange={(value) => handleInputChange('routingMethod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {routingMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="businessHoursOnly">Business Hours Only</Label>
                    <p className="text-sm text-gray-500">Only accept calls during business hours</p>
                  </div>
                  <Switch
                    id="businessHoursOnly"
                    checked={phoneSettings.businessHoursOnly}
                    onCheckedChange={(checked) => handleInputChange('businessHoursOnly', checked)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Volume2 className="w-5 h-5 mr-2" />
              Messages & Greetings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="greetingMessage">Greeting Message</Label>
              <Input
                id="greetingMessage"
                value={phoneSettings.greetingMessage}
                onChange={(e) => handleInputChange('greetingMessage', e.target.value)}
                placeholder="Hello! Thank you for calling..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="afterHoursMessage">After Hours Message</Label>
              <Input
                id="afterHoursMessage"
                value={phoneSettings.afterHoursMessage}
                onChange={(e) => handleInputChange('afterHoursMessage', e.target.value)}
                placeholder="Thank you for calling. We are currently closed..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxWaitTime">Maximum Wait Time (seconds)</Label>
              <Input
                id="maxWaitTime"
                type="number"
                value={phoneSettings.maxWaitTime}
                onChange={(e) => handleInputChange('maxWaitTime', parseInt(e.target.value))}
                min="60"
                max="1800"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Voicemail Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableVoicemail">Enable Voicemail</Label>
                <p className="text-sm text-gray-500">Allow customers to leave voicemails</p>
              </div>
              <Switch
                id="enableVoicemail"
                checked={phoneSettings.enableVoicemail}
                onCheckedChange={(checked) => handleInputChange('enableVoicemail', checked)}
              />
            </div>

            {phoneSettings.enableVoicemail && (
              <div className="space-y-2">
                <Label htmlFor="voicemailMessage">Voicemail Message</Label>
                <Input
                  id="voicemailMessage"
                  value={phoneSettings.voicemailMessage}
                  onChange={(e) => handleInputChange('voicemailMessage', e.target.value)}
                  placeholder="You have reached our voicemail..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recording Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableCallRecording">Enable Call Recording</Label>
                <p className="text-sm text-gray-500">Record calls for quality assurance</p>
              </div>
              <Switch
                id="enableCallRecording"
                checked={phoneSettings.enableCallRecording}
                onCheckedChange={(checked) => handleInputChange('enableCallRecording', checked)}
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

export default Step7PhoneRouting;
