'use client';

import React, { useState } from 'react';
import { Clock, Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';

interface Step3HoursProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

const Step3Hours: React.FC<Step3HoursProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [businessHours, setBusinessHours] = useState<BusinessHours[]>(
    data?.businessHours || [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
      { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' }
    ]
  );

  const [timezone, setTimezone] = useState(data?.timezone || 'America/New_York');

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Phoenix', label: 'Arizona Time (MST)' },
    { value: 'America/Anchorage', label: 'Alaska Time (AKST)' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)' }
  ];

  const updateDayHours = (index: number, field: keyof BusinessHours, value: any) => {
    setBusinessHours(prev => prev.map((day, i) => 
      i === index ? { ...day, [field]: value } : day
    ));
  };

  const validateForm = () => {
    // Check if at least one day is open
    const hasOpenDay = businessHours.some(day => day.isOpen);
    if (!hasOpenDay) {
      alert('Please set at least one day as open');
      return false;
    }

    // Check if open days have valid times
    for (const day of businessHours) {
      if (day.isOpen) {
        if (!day.openTime || !day.closeTime) {
          alert(`Please set opening and closing times for ${day.day}`);
          return false;
        }
        if (day.openTime >= day.closeTime) {
          alert(`${day.day}: Opening time must be before closing time`);
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        businessHours,
        timezone
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Clock className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
        <p className="text-gray-600">Set your operating hours for each day</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
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

        <Card>
          <CardHeader>
            <CardTitle>Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessHours.map((day, index) => (
              <div key={day.day} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="w-24">
                  <span className="font-medium capitalize">{day.day}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`open-${index}`}
                    checked={day.isOpen}
                    onCheckedChange={(checked) => updateDayHours(index, 'isOpen', checked)}
                  />
                  <Label htmlFor={`open-${index}`}>Open</Label>
                </div>

                {day.isOpen && (
                  <div className="flex items-center space-x-2">
                    <Input
                      type="time"
                      value={day.openTime}
                      onChange={(e) => updateDayHours(index, 'openTime', e.target.value)}
                      className="w-32"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={day.closeTime}
                      onChange={(e) => updateDayHours(index, 'closeTime', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}

                {!day.isOpen && (
                  <span className="text-gray-500">Closed</span>
                )}
              </div>
            ))}
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

export default Step3Hours;
