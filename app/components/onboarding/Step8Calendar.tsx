'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle, AlertCircle, Settings, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';

interface Step8CalendarProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step8Calendar: React.FC<Step8CalendarProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [calendarSettings, setCalendarSettings] = useState({
    enableGoogleCalendar: data?.calendarSettings?.enableGoogleCalendar || false,
    enableOutlookCalendar: data?.calendarSettings?.enableOutlookCalendar || false,
    googleCalendarId: data?.calendarSettings?.googleCalendarId || '',
    outlookCalendarId: data?.calendarSettings?.outlookCalendarId || '',
    syncDirection: data?.calendarSettings?.syncDirection || 'both',
    autoSync: data?.calendarSettings?.autoSync || true,
    syncInterval: data?.calendarSettings?.syncInterval || 15,
    enableConflictResolution: data?.calendarSettings?.enableConflictResolution || true,
    conflictResolution: data?.calendarSettings?.conflictResolution || 'avella_priority'
  });

  const [googleConnected, setGoogleConnected] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const syncDirections = [
    { value: 'avella_to_calendar', label: 'Avella to Calendar (One-way)' },
    { value: 'calendar_to_avella', label: 'Calendar to Avella (One-way)' },
    { value: 'both', label: 'Two-way Sync' }
  ];

  const conflictResolutions = [
    { value: 'avella_priority', label: 'Avella Priority (Avella wins)' },
    { value: 'calendar_priority', label: 'Calendar Priority (Calendar wins)' },
    { value: 'manual', label: 'Manual Resolution' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setCalendarSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const connectGoogleCalendar = async () => {
    try {
      // This would typically open a popup or redirect to Google OAuth
      // For now, we'll simulate the connection
      setGoogleConnected(true);
      setCalendarSettings(prev => ({
        ...prev,
        enableGoogleCalendar: true
      }));
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
    }
  };

  const connectOutlookCalendar = async () => {
    try {
      // This would typically open a popup or redirect to Microsoft OAuth
      // For now, we'll simulate the connection
      setOutlookConnected(true);
      setCalendarSettings(prev => ({
        ...prev,
        enableOutlookCalendar: true
      }));
    } catch (error) {
      console.error('Error connecting to Outlook Calendar:', error);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (calendarSettings.enableGoogleCalendar && !googleConnected) {
      newErrors.googleCalendar = 'Please connect to Google Calendar';
    }

    if (calendarSettings.enableOutlookCalendar && !outlookConnected) {
      newErrors.outlookCalendar = 'Please connect to Outlook Calendar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        calendarSettings
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Calendar className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Calendar Integration</h2>
        <p className="text-gray-600">Connect your existing calendars for seamless scheduling</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Google Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableGoogleCalendar">Enable Google Calendar</Label>
                <p className="text-sm text-gray-500">Sync with your Google Calendar</p>
              </div>
              <Switch
                id="enableGoogleCalendar"
                checked={calendarSettings.enableGoogleCalendar}
                onCheckedChange={(checked) => handleInputChange('enableGoogleCalendar', checked)}
              />
            </div>

            {calendarSettings.enableGoogleCalendar && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Connection Status</span>
                    <div className="flex items-center mt-1">
                      {googleConnected ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-600">Not Connected</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={googleConnected ? "outline" : "default"}
                    onClick={connectGoogleCalendar}
                    disabled={googleConnected}
                  >
                    {googleConnected ? 'Connected' : 'Connect Google'}
                  </Button>
                </div>

                {errors.googleCalendar && (
                  <p className="text-sm text-red-600">{errors.googleCalendar}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Outlook Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableOutlookCalendar">Enable Outlook Calendar</Label>
                <p className="text-sm text-gray-500">Sync with your Outlook Calendar</p>
              </div>
              <Switch
                id="enableOutlookCalendar"
                checked={calendarSettings.enableOutlookCalendar}
                onCheckedChange={(checked) => handleInputChange('enableOutlookCalendar', checked)}
              />
            </div>

            {calendarSettings.enableOutlookCalendar && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Connection Status</span>
                    <div className="flex items-center mt-1">
                      {outlookConnected ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-600">Not Connected</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant={outlookConnected ? "outline" : "default"}
                    onClick={connectOutlookCalendar}
                    disabled={outlookConnected}
                  >
                    {outlookConnected ? 'Connected' : 'Connect Outlook'}
                  </Button>
                </div>

                {errors.outlookCalendar && (
                  <p className="text-sm text-red-600">{errors.outlookCalendar}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Sync Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="syncDirection">Sync Direction</Label>
              <Select 
                value={calendarSettings.syncDirection} 
                onValueChange={(value) => handleInputChange('syncDirection', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syncDirections.map(direction => (
                    <SelectItem key={direction.value} value={direction.value}>
                      {direction.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoSync">Auto Sync</Label>
                <p className="text-sm text-gray-500">Automatically sync changes</p>
              </div>
              <Switch
                id="autoSync"
                checked={calendarSettings.autoSync}
                onCheckedChange={(checked) => handleInputChange('autoSync', checked)}
              />
            </div>

            {calendarSettings.autoSync && (
              <div className="space-y-2">
                <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                <Input
                  id="syncInterval"
                  type="number"
                  value={calendarSettings.syncInterval}
                  onChange={(e) => handleInputChange('syncInterval', parseInt(e.target.value))}
                  min="5"
                  max="60"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Conflict Resolution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableConflictResolution">Enable Conflict Resolution</Label>
                <p className="text-sm text-gray-500">Handle scheduling conflicts automatically</p>
              </div>
              <Switch
                id="enableConflictResolution"
                checked={calendarSettings.enableConflictResolution}
                onCheckedChange={(checked) => handleInputChange('enableConflictResolution', checked)}
              />
            </div>

            {calendarSettings.enableConflictResolution && (
              <div className="space-y-2">
                <Label htmlFor="conflictResolution">Conflict Resolution Method</Label>
                <Select 
                  value={calendarSettings.conflictResolution} 
                  onValueChange={(value) => handleInputChange('conflictResolution', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conflictResolutions.map(resolution => (
                      <SelectItem key={resolution.value} value={resolution.value}>
                        {resolution.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default Step8Calendar;
