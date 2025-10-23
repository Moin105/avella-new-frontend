'use client';

import React, { useState, useEffect } from 'react';
import { useTenant } from '../../contexts/TenantContext';
import { apiClient } from '../../lib/api';
import { 
  Settings, 
  Save,
  Building,
  MapPin,
  Phone,
  Mail,
  Clock,
  Globe,
  Shield,
  Bell,
  CreditCard,
  Users
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

const SettingsPage = () => {
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    business: {
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      timezone: 'America/New_York',
      currency: 'USD'
    },
    notifications: {
      email_notifications: true,
      sms_notifications: true,
      appointment_reminders: true,
      marketing_emails: false
    },
    booking: {
      advance_booking_days: 30,
      cancellation_hours: 24,
      auto_confirm: false,
      require_phone: true
    },
    payment: {
      stripe_enabled: false,
      paypal_enabled: false,
      cash_enabled: true,
      deposit_required: false,
      deposit_percentage: 0
    }
  });

  useEffect(() => {
    if (currentTenant) {
      loadSettings();
    }
  }, [currentTenant]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings');
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await apiClient.put('/settings', settings);
      if (response.success) {
        // Show success message
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessSettings = (field, value) => {
    setSettings({
      ...settings,
      business: {
        ...settings.business,
        [field]: value
      }
    });
  };

  const updateNotificationSettings = (field, value) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [field]: value
      }
    });
  };

  const updateBookingSettings = (field, value) => {
    setSettings({
      ...settings,
      booking: {
        ...settings.booking,
        [field]: value
      }
    });
  };

  const updatePaymentSettings = (field, value) => {
    setSettings({
      ...settings,
      payment: {
        ...settings.payment,
        [field]: value
      }
    });
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Business Information</span>
              </CardTitle>
              <CardDescription>
                Update your business details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={settings.business.name}
                    onChange={(e) => updateBusinessSettings('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.business.phone}
                    onChange={(e) => updateBusinessSettings('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.business.address}
                  onChange={(e) => updateBusinessSettings('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.business.email}
                    onChange={(e) => updateBusinessSettings('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={settings.business.website}
                    onChange={(e) => updateBusinessSettings('website', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.business.description}
                  onChange={(e) => updateBusinessSettings('description', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.email_notifications}
                  onCheckedChange={(checked) => updateNotificationSettings('email_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.sms_notifications}
                  onCheckedChange={(checked) => updateNotificationSettings('sms_notifications', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Send automatic appointment reminders
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.appointment_reminders}
                  onCheckedChange={(checked) => updateNotificationSettings('appointment_reminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Emails</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive marketing and promotional emails
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.marketing_emails}
                  onCheckedChange={(checked) => updateNotificationSettings('marketing_emails', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Booking Settings</span>
              </CardTitle>
              <CardDescription>
                Configure your booking preferences and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="advance_booking">Advance Booking (days)</Label>
                  <Input
                    id="advance_booking"
                    type="number"
                    value={settings.booking.advance_booking_days}
                    onChange={(e) => updateBookingSettings('advance_booking_days', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cancellation_hours">Cancellation Notice (hours)</Label>
                  <Input
                    id="cancellation_hours"
                    type="number"
                    value={settings.booking.cancellation_hours}
                    onChange={(e) => updateBookingSettings('cancellation_hours', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Confirm Appointments</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically confirm new appointments
                  </p>
                </div>
                <Switch
                  checked={settings.booking.auto_confirm}
                  onCheckedChange={(checked) => updateBookingSettings('auto_confirm', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Phone Number</Label>
                  <p className="text-sm text-muted-foreground">
                    Make phone number mandatory for bookings
                  </p>
                </div>
                <Switch
                  checked={settings.booking.require_phone}
                  onCheckedChange={(checked) => updateBookingSettings('require_phone', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment Settings</span>
              </CardTitle>
              <CardDescription>
                Configure payment methods and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Stripe Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Stripe payment processing
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.stripe_enabled}
                    onCheckedChange={(checked) => updatePaymentSettings('stripe_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>PayPal Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable PayPal payment processing
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.paypal_enabled}
                    onCheckedChange={(checked) => updatePaymentSettings('paypal_enabled', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Cash Payments</Label>
                    <p className="text-sm text-muted-foreground">
                      Accept cash payments
                    </p>
                  </div>
                  <Switch
                    checked={settings.payment.cash_enabled}
                    onCheckedChange={(checked) => updatePaymentSettings('cash_enabled', checked)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Deposit</Label>
                  <p className="text-sm text-muted-foreground">
                    Require a deposit for bookings
                  </p>
                </div>
                <Switch
                  checked={settings.payment.deposit_required}
                  onCheckedChange={(checked) => updatePaymentSettings('deposit_required', checked)}
                />
              </div>
              {settings.payment.deposit_required && (
                <div className="space-y-2">
                  <Label htmlFor="deposit_percentage">Deposit Percentage</Label>
                  <Input
                    id="deposit_percentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payment.deposit_percentage}
                    onChange={(e) => updatePaymentSettings('deposit_percentage', parseFloat(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
