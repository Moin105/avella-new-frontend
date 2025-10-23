'use client';

import React from 'react';
import { ClipboardList, CheckCircle, AlertCircle, Clock, Users, Phone, Calendar, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

interface InternalInstructionsProps {
  formData: any;
}

const InternalInstructions: React.FC<InternalInstructionsProps> = ({ formData }) => {
  const getReadinessStatus = () => {
    const issues = [];
    
    // Check required fields
    if (!formData.tenant?.legalName) issues.push('Business legal name is required');
    if (!formData.tenant?.phone) issues.push('Business phone is required');
    if (!formData.tenant?.email) issues.push('Business email is required');
    if (!formData.contacts?.owner?.name) issues.push('Owner contact is required');
    if (!formData.services || formData.services.length === 0) issues.push('At least one service is required');
    if (!formData.staff || formData.staff.length === 0) issues.push('At least one staff member is required');
    if (!formData.websiteSettings?.websiteSlug) issues.push('Website slug is required');
    
    return {
      isReady: issues.length === 0,
      issues
    };
  };

  const readiness = getReadinessStatus();

  const steps = [
    {
      id: 1,
      title: 'Intake & Ticketing',
      icon: ClipboardList,
      description: 'Create a Setup Ticket in Avella AI CRM',
      tasks: [
        'Tag: new-tenant, owner: CSM',
        'Attach completed onboarding form and any CSVs',
        'Record Go-Live Target Date',
        'Confirm availability with client'
      ]
    },
    {
      id: 2,
      title: 'Tenant Provisioning',
      icon: Users,
      description: 'Create tenant and assign plan',
      tasks: [
        'Create tenant with legal/brand name, timezone, phone, email, address',
        'Assign plan (setup fee + monthly)',
        'Enable billing profile (card/ACH/invoice terms)',
        'Add Owner, Redirect/Operations, and Billing contacts as users with roles'
      ]
    },
    {
      id: 3,
      title: 'Catalog & Staff',
      icon: Users,
      description: 'Build services and create staff',
      tasks: [
        'Build Services from checklist; apply default duration/price set',
        'Add add-ons if requested',
        'Create Staff (min 2, up to 5 per form)',
        'Set roles and feature access',
        'Map services to each staff'
      ]
    },
    {
      id: 4,
      title: 'Hours, Rules, Policies',
      icon: Clock,
      description: 'Configure business operations',
      tasks: [
        'Configure business hours and holiday closures',
        'Set booking rules (lead times, same-day cutoff, overlap policy)',
        'Add cancellation/no-show/deposit policies',
        'Verify client-facing policy text'
      ]
    },
    {
      id: 5,
      title: 'Phone & Call Flow',
      icon: Phone,
      description: 'Setup phone system',
      tasks: [
        'If Porting: collect carrier info, recent bill PDF, LOA signer',
        'Submit port order; set temporary DID',
        'During hours → routing (ring group/AI/IVR)',
        'After hours → AI capture→SMS / voicemail→SMS / on-call',
        'If call recording enabled, confirm retention policy'
      ]
    },
    {
      id: 6,
      title: 'Calendar & Integrations',
      icon: Calendar,
      description: 'Connect calendar systems',
      tasks: [
        'Provider order: Avella AI CRM → Google → Microsoft → None',
        'Send per-staff OAuth links',
        'Verify freeBusy sync and event read scope',
        'Connect payments (public keys only)',
        'Store secrets via OAuth/secure vault'
      ]
    },
    {
      id: 7,
      title: 'Notifications',
      icon: AlertCircle,
      description: 'Setup communication',
      tasks: [
        'Turn on SMS + email',
        'Load default templates (confirmation, 24h, 2h, cancellation)',
        'Insert reschedule/cancel links',
        'Send test booking to client\'s phone and owner email'
      ]
    },
    {
      id: 8,
      title: 'Web & Links',
      icon: Globe,
      description: 'Setup website integration',
      tasks: [
        'Generate booking URL/slug',
        'Send embed/button instructions for client website',
        'Send social bio instructions'
      ]
    },
    {
      id: 9,
      title: 'QA — Go-Live Checklist',
      icon: CheckCircle,
      description: 'Final testing',
      tasks: [
        'Test booking created & appears on correct staff calendar',
        'Client receives confirmation SMS/email with correct time zone',
        'Reschedule link works; cancellation triggers policy logic',
        'Phone routing works both during and after hours',
        'Services show proper durations/prices; add-ons functional',
        'Staff permissions correct; non-owners cannot access billing',
        'Data import (if any) completed; SMS consent flags respected'
      ]
    },
    {
      id: 10,
      title: 'Handoff',
      icon: Users,
      description: 'Client handoff',
      tasks: [
        'Send "Welcome/Go-Live" email with:',
        '  - Booking link',
        '  - Support hours',
        '  - How to edit services/staff',
        '  - Billing dates',
        'Create 30-day check-in task in CRM'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <ClipboardList className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Internal Onboarding Instructions</h2>
        <p className="text-gray-600">Avella Team Only - Follow these steps after receiving completed form</p>
      </div>

      {/* Readiness Check */}
      <Card className={readiness.isReady ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <CardHeader>
          <CardTitle className="flex items-center">
            {readiness.isReady ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            Readiness Check
          </CardTitle>
        </CardHeader>
        <CardContent>
          {readiness.isReady ? (
            <div className="text-green-700">
              <p className="font-semibold">✅ Ready for Provisioning</p>
              <p className="text-sm">All required fields are completed.</p>
            </div>
          ) : (
            <div className="text-red-700">
              <p className="font-semibold">❌ Missing Required Fields</p>
              <ul className="list-disc list-inside text-sm mt-2">
                {readiness.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <Card key={step.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full mr-3 text-sm font-semibold">
                  {step.id}
                </div>
                <div>
                  <div className="flex items-center">
                    <step.icon className="h-5 w-5 mr-2" />
                    {step.title}
                  </div>
                  <p className="text-sm text-gray-600 font-normal">{step.description}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {step.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm">{task}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Default Settings (if left blank):</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Lead time: 2h • Max horizon: 60d</li>
              <li>• Same-day off • Cancel window: 24h</li>
              <li>• No-show fee: None</li>
              <li>• After-hours: AI capture → SMS callback</li>
              <li>• SMS enabled: On</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">CSV Import Templates:</h4>
            <div className="space-y-2">
              <div>
                <Badge variant="outline">Services.csv</Badge>
                <code className="text-xs ml-2">service_name,duration_min,price</code>
              </div>
              <div>
                <Badge variant="outline">Staff.csv</Badge>
                <code className="text-xs ml-2">full_name,email,role</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalInstructions;
