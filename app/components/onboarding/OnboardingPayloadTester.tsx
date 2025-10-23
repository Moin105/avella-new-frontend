'use client';

import React, { useState } from 'react';
import { processOnboardingPayload } from '../../lib/onboardingNormalizer';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const OnboardingPayloadTester: React.FC = () => {
  const [testData, setTestData] = useState({
    tenant: {
      legalName: 'Test Barbershop',
      brandName: 'Test Brand',
      timezone: 'America/New_York',
      phone: '+1 (555) 123-4567',
      email: 'test@example.com',
      address: {
        city: 'New York',
        state: 'NY',
        country: 'United States'
      }
    },
    contacts: {
      owner: {
        name: 'John Doe',
        title: 'Owner',
        email: 'john@example.com',
        mobile: '+1234567890',
        preferredContact: 'email'
      },
      redirect: {
        name: 'Jane Smith',
        title: 'Manager',
        email: 'jane@example.com',
        phone: '+1234567891'
      },
      billing: {
        name: 'Bob Wilson',
        title: 'Accountant',
        email: 'bob@example.com',
        phone: '+1234567892',
        address: '123 Main St, New York, NY'
      }
    },
    businessHours: [
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'friday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { day: 'saturday', isOpen: true, openTime: '10:00', closeTime: '16:00' },
      { day: 'sunday', isOpen: false, openTime: '09:00', closeTime: '17:00' }
    ],
    bookingRules: {
      minimumNoticeHours: 2,
      maximumAdvanceDays: 60,
      allowSameDayBooking: false,
      cancellationPolicy: '24_hours',
      noShowFeeType: 'none',
      noShowFeeValue: 0
    },
    services: [
      {
        name: 'Haircut',
        duration: 30,
        price: 25,
        category: 'Hair'
      },
      {
        name: 'Beard Trim',
        duration: 20,
        price: 15,
        category: 'Beard'
      }
    ],
    staff: [
      {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1234567893',
        role: 'barber',
        specialties: ['Haircuts', 'Beard Trims'],
        isActive: true
      }
    ],
    phoneSettings: {
      businessPhone: '+1 (555) 123-4567',
      action: 'keep',
      afterHours: 'ai',
      onCall: '+1234567894'
    },
    calendarSettings: {
      provider: 'google'
    },
    consentSettings: {
      enableSMS: true,
      enableDataCollection: true
    },
    websiteSettings: {
      websiteSlug: 'test-barbershop'
    },
    goLiveDate: '2025-12-01'
  });

  const [result, setResult] = useState<any>(null);

  const testNormalization = () => {
    const { payload, isValid, errors } = processOnboardingPayload(testData);
    setResult({ payload, isValid, errors });
  };

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Onboarding Payload Tester</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(testData, null, 2)}
            </pre>
            <Button onClick={testNormalization} className="mt-4">
              Test Normalization
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Normalized Result</CardTitle>
          </CardHeader>
          <CardContent>
            {result && (
              <div className="space-y-4">
                <div className={`p-3 rounded ${result.isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>Status:</strong> {result.isValid ? 'Valid' : 'Invalid'}
                </div>
                
                {result.errors && result.errors.length > 0 && (
                  <div className="bg-red-50 p-3 rounded">
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside mt-2">
                      {result.errors.map((error: string, index: number) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OnboardingPayloadTester;
