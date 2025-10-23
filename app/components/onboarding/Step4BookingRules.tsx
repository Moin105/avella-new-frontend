'use client';

import React, { useState } from 'react';
import { Settings, Clock, Calendar, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Switch } from '../ui/switch';

interface Step4BookingRulesProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step4BookingRules: React.FC<Step4BookingRulesProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [bookingRules, setBookingRules] = useState({
    advanceBookingDays: data?.bookingRules?.advanceBookingDays || 30,
    minimumNoticeHours: data?.bookingRules?.minimumNoticeHours || 24,
    maximumAdvanceDays: data?.bookingRules?.maximumAdvanceDays || 90,
    slotDuration: data?.bookingRules?.slotDuration || 30,
    bufferTime: data?.bookingRules?.bufferTime || 15,
    allowSameDayBooking: data?.bookingRules?.allowSameDayBooking || false,
    allowOnlineBooking: data?.bookingRules?.allowOnlineBooking || true,
    requireDeposit: data?.bookingRules?.requireDeposit || false,
    depositAmount: data?.bookingRules?.depositAmount || 0,
    cancellationPolicy: data?.bookingRules?.cancellationPolicy || '24_hours',
    maxBookingsPerDay: data?.bookingRules?.maxBookingsPerDay || 20
  });

  const [errors, setErrors] = useState<any>({});

  const handleInputChange = (field: string, value: any) => {
    setBookingRules(prev => ({
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

    if (bookingRules.advanceBookingDays < 1) {
      newErrors.advanceBookingDays = 'Must be at least 1 day';
    }

    if (bookingRules.minimumNoticeHours < 1) {
      newErrors.minimumNoticeHours = 'Must be at least 1 hour';
    }

    if (bookingRules.maximumAdvanceDays < bookingRules.advanceBookingDays) {
      newErrors.maximumAdvanceDays = 'Must be greater than advance booking days';
    }

    if (bookingRules.slotDuration < 15) {
      newErrors.slotDuration = 'Must be at least 15 minutes';
    }

    if (bookingRules.bufferTime < 0) {
      newErrors.bufferTime = 'Cannot be negative';
    }

    if (bookingRules.requireDeposit && bookingRules.depositAmount <= 0) {
      newErrors.depositAmount = 'Deposit amount must be greater than 0';
    }

    if (bookingRules.maxBookingsPerDay < 1) {
      newErrors.maxBookingsPerDay = 'Must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        bookingRules
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Booking Rules</h2>
        <p className="text-gray-600">Configure how customers can book appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Booking Windows
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="advanceBookingDays">Advance Booking (Days)</Label>
              <Input
                id="advanceBookingDays"
                type="number"
                value={bookingRules.advanceBookingDays}
                onChange={(e) => handleInputChange('advanceBookingDays', parseInt(e.target.value))}
                min="1"
                className={errors.advanceBookingDays ? 'border-red-500' : ''}
              />
              {errors.advanceBookingDays && (
                <p className="text-sm text-red-600">{errors.advanceBookingDays}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimumNoticeHours">Minimum Notice (Hours)</Label>
              <Input
                id="minimumNoticeHours"
                type="number"
                value={bookingRules.minimumNoticeHours}
                onChange={(e) => handleInputChange('minimumNoticeHours', parseInt(e.target.value))}
                min="1"
                className={errors.minimumNoticeHours ? 'border-red-500' : ''}
              />
              {errors.minimumNoticeHours && (
                <p className="text-sm text-red-600">{errors.minimumNoticeHours}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumAdvanceDays">Maximum Advance (Days)</Label>
              <Input
                id="maximumAdvanceDays"
                type="number"
                value={bookingRules.maximumAdvanceDays}
                onChange={(e) => handleInputChange('maximumAdvanceDays', parseInt(e.target.value))}
                min="1"
                className={errors.maximumAdvanceDays ? 'border-red-500' : ''}
              />
              {errors.maximumAdvanceDays && (
                <p className="text-sm text-red-600">{errors.maximumAdvanceDays}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Time Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="slotDuration">Slot Duration (Minutes)</Label>
              <Select 
                value={bookingRules.slotDuration.toString()} 
                onValueChange={(value) => handleInputChange('slotDuration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bufferTime">Buffer Time (Minutes)</Label>
              <Input
                id="bufferTime"
                type="number"
                value={bookingRules.bufferTime}
                onChange={(e) => handleInputChange('bufferTime', parseInt(e.target.value))}
                min="0"
                className={errors.bufferTime ? 'border-red-500' : ''}
              />
              {errors.bufferTime && (
                <p className="text-sm text-red-600">{errors.bufferTime}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBookingsPerDay">Max Bookings Per Day</Label>
              <Input
                id="maxBookingsPerDay"
                type="number"
                value={bookingRules.maxBookingsPerDay}
                onChange={(e) => handleInputChange('maxBookingsPerDay', parseInt(e.target.value))}
                min="1"
                className={errors.maxBookingsPerDay ? 'border-red-500' : ''}
              />
              {errors.maxBookingsPerDay && (
                <p className="text-sm text-red-600">{errors.maxBookingsPerDay}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowSameDayBooking">Allow Same-Day Booking</Label>
                <p className="text-sm text-gray-500">Let customers book for today</p>
              </div>
              <Switch
                id="allowSameDayBooking"
                checked={bookingRules.allowSameDayBooking}
                onCheckedChange={(checked) => handleInputChange('allowSameDayBooking', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowOnlineBooking">Allow Online Booking</Label>
                <p className="text-sm text-gray-500">Enable online appointment booking</p>
              </div>
              <Switch
                id="allowOnlineBooking"
                checked={bookingRules.allowOnlineBooking}
                onCheckedChange={(checked) => handleInputChange('allowOnlineBooking', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireDeposit">Require Deposit</Label>
                <p className="text-sm text-gray-500">Collect deposit for bookings</p>
              </div>
              <Switch
                id="requireDeposit"
                checked={bookingRules.requireDeposit}
                onCheckedChange={(checked) => handleInputChange('requireDeposit', checked)}
              />
            </div>

            {bookingRules.requireDeposit && (
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Deposit Amount ($)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={bookingRules.depositAmount}
                  onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value))}
                  min="0"
                  step="0.01"
                  className={errors.depositAmount ? 'border-red-500' : ''}
                />
                {errors.depositAmount && (
                  <p className="text-sm text-red-600">{errors.depositAmount}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              Cancellation Policy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
              <Select 
                value={bookingRules.cancellationPolicy} 
                onValueChange={(value) => handleInputChange('cancellationPolicy', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flexible">Flexible (up to 1 hour before)</SelectItem>
                  <SelectItem value="24_hours">24 hours notice required</SelectItem>
                  <SelectItem value="48_hours">48 hours notice required</SelectItem>
                  <SelectItem value="72_hours">72 hours notice required</SelectItem>
                  <SelectItem value="no_cancellation">No cancellation allowed</SelectItem>
                </SelectContent>
              </Select>
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

export default Step4BookingRules;
