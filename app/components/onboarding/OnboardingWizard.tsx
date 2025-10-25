'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { processOnboardingPayload } from '../../lib/onboardingNormalizer';
import { 
  Building, 
  Users, 
  Clock, 
  Settings, 
  Scissors, 
  UserCheck, 
  Phone, 
  Calendar, 
  Shield, 
  Globe,
  CreditCard,
  CheckCircle,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

// Import all step components
import Step1BusinessBasics from './Step1BusinessBasics';
import Step2Contacts from './Step2Contacts';
import Step3Hours from './Step3Hours';
import Step4BookingRules from './Step4BookingRules';
import Step5ServicesEnhanced from './Step5ServicesEnhanced';
import Step6StaffEnhanced from './Step6StaffEnhanced';
import Step7PhoneRouting from './Step7PhoneRouting';
import Step8Calendar from './Step8Calendar';
import Step9ConsentTemplates from './Step9ConsentTemplates';
import Step10WebsiteGoLive from './Step10WebsiteGoLive';
import Step11PlanBilling from './Step11PlanBilling';

interface OnboardingWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showFinalReview, setShowFinalReview] = useState(false);
  const { user } = useAuth();

  // Determine the correct API base URL based on environment
  const getApiUrl = () => {
    // Check if we're in production by looking at the hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname.includes('vercel.app') || hostname.includes('avella') || hostname !== 'localhost') {
        return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'https://avella-backend-production.up.railway.app'}/api`;
      }
    }
    
    // Fallback to environment variable or localhost
    return `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/api`;
  };
  
  const API_URL = getApiUrl();
  
  // Debug logging for production
  console.log('OnboardingWizard API URL Detection:', {
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    detectedApiUrl: API_URL,
    isVercel: typeof window !== 'undefined' ? window.location.hostname.includes('vercel.app') : false
  });

  const steps = [
    { id: 1, title: 'Business Basics', icon: Building, component: Step1BusinessBasics },
    { id: 2, title: 'Contacts', icon: Users, component: Step2Contacts },
    { id: 3, title: 'Hours', icon: Clock, component: Step3Hours },
    { id: 4, title: 'Booking Rules', icon: Settings, component: Step4BookingRules },
    { id: 5, title: 'Services', icon: Scissors, component: Step5ServicesEnhanced },
    { id: 6, title: 'Staff', icon: UserCheck, component: Step6StaffEnhanced },
    { id: 7, title: 'Phone Routing', icon: Phone, component: Step7PhoneRouting },
    { id: 8, title: 'Calendar', icon: Calendar, component: Step8Calendar },
    { id: 9, title: 'Consent & Templates', icon: Shield, component: Step9ConsentTemplates },
    { id: 10, title: 'Website & Go-Live', icon: Globe, component: Step10WebsiteGoLive },
    { id: 11, title: 'Plan & Billing', icon: CreditCard, component: Step11PlanBilling }
  ];

  // Load existing draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const response = await fetch(`${API_URL}/onboarding/draft`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (response.ok) {
        const draft = await response.json();
        setFormData(draft.data || {});
        toast({
          title: "Draft Loaded",
          description: "Your previous progress has been restored.",
        });
      }
    } catch (error) {
      console.log('No existing draft found');
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      // Normalize the data for draft saving
      const { payload: normalizedData } = processOnboardingPayload(formData);
      const draftData = {
        ...normalizedData,
        status: 'draft'
      };

      const response = await fetch(`${API_URL}/onboarding/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(draftData)
      });

      if (response.ok) {
        toast({
          title: "Draft Saved",
          description: "Your progress has been saved successfully.",
        });
      } else {
        throw new Error('Failed to save draft');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save your progress. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStepUpdate = (updatedData: any) => {
    setFormData((prev: any) => ({
      ...prev,
      ...updatedData
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowFinalReview(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProvision = async () => {
    setLoading(true);
    try {
      // Process and normalize the form data
      const { payload: finalData, isValid, errors } = processOnboardingPayload(formData);
      
      // Debug logging
      console.log('Original form data:', formData);
      console.log('Normalized payload:', finalData);
      
      // Validate before sending
      if (!isValid) {
        console.error('Validation errors:', errors);
        toast({
          variant: "destructive",
          title: "Validation Errors",
          description: `Please fix the following issues: ${errors.join(', ')}`,
        });
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/onboarding/provision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "✅ Tenant Successfully Created!",
          description: `Barbershop "${result?.tenant?.legalName || 'New Tenant'}" has been created and owner invited via email.`,
        });
        
        // Small delay to ensure toast shows before closing
        setTimeout(() => {
          // Close wizard and refresh data
          if (onComplete) {
            onComplete();
          }
          if (onClose) {
            onClose();
          }
        }, 1500);
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Provisioning failed');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Provisioning Failed",
        description: error.message || "Failed to provision your tenant. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const runReadinessCheck = () => {
    const issues = [];

    // Check required fields
    if (!formData.tenant?.legalName) issues.push('Business legal name is required');
    if (!formData.tenant?.phone) issues.push('Business phone is required');
    if (!formData.tenant?.email) issues.push('Business email is required');
    if (!formData.contacts?.owner?.name) issues.push('Owner contact is required');
    if (!formData.services || formData.services.length === 0) issues.push('At least one service is required');
    if (!formData.staff || formData.staff.length === 0) issues.push('At least one staff member is required');
    if (!formData.websiteSettings?.websiteSlug) issues.push('Website slug is required');

    return issues;
  };

  const clearDraft = () => {
    localStorage.removeItem('onboarding_draft');
  };

  const CurrentStepComponent = steps[currentStep - 1]?.component;

  if (showFinalReview) {
    const issues = runReadinessCheck();
    const isReady = issues.length === 0;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Review</h2>
            <p className="text-gray-600">Review your information before going live</p>
          </div>

          <div className="p-6">
            {issues.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Issues to Fix:</h3>
                <ul className="list-disc list-inside text-red-700">
                  {issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {isReady && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">All requirements met! Ready to go live.</span>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => setShowFinalReview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Edit
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={saveDraft}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  onClick={handleProvision}
                  disabled={loading || !isReady}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? 'Creating...' : 'Go Live!'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Business Setup</h1>
              <p className="text-gray-600">Complete your business configuration</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="p-6">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-shrink-0">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white' 
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium whitespace-nowrap ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 flex-shrink-0 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Current Step Content */}
      <div className="bg-white rounded-lg shadow-lg">
        {CurrentStepComponent && (
          <CurrentStepComponent
            data={formData}
            onUpdate={handleStepUpdate}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
      </div>

    </div>
  );
};

export default OnboardingWizard;