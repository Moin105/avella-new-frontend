'use client';

import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';

interface Step11PlanBillingProps {
  data: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const Step11PlanBilling: React.FC<Step11PlanBillingProps> = ({ data, onUpdate, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    plan: {
      tier: data?.plan?.tier || 'Starter',
      setupFeeApproved: data?.plan?.setupFeeApproved || false,
      monthly: data?.plan?.monthly || 0,
      paymentMethod: data?.plan?.paymentMethod || 'card',
      terms: data?.plan?.terms || 'NET0'
    }
  });

  const [errors, setErrors] = useState<any>({});

  const planTiers = [
    { value: 'Starter', label: 'Starter', price: 0, description: 'Basic features for small businesses' },
    { value: 'Pro', label: 'Pro', price: 300, description: 'Advanced features for growing businesses' },
    { value: 'Multi-Location', label: 'Multi-Location', price: 500, description: 'Enterprise features for multiple locations' }
  ];

  const paymentMethods = [
    { value: 'card', label: 'Credit Card' },
    { value: 'ach', label: 'ACH/Bank Transfer' },
    { value: 'invoice', label: 'Invoice (Net Terms)' }
  ];

  const termsOptions = [
    { value: 'NET0', label: 'Net 0 (Due on receipt)' },
    { value: 'NET15', label: 'Net 15 (Due in 15 days)' },
    { value: 'NET30', label: 'Net 30 (Due in 30 days)' }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      plan: {
        ...prev.plan,
        [field]: value
      }
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.plan.tier) {
      newErrors.tier = 'Please select a plan tier';
    }

    if (formData.plan.monthly < 0) {
      newErrors.monthly = 'Monthly amount cannot be negative';
    }

    if (!formData.plan.paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    if (formData.plan.paymentMethod === 'invoice' && !formData.plan.terms) {
      newErrors.terms = 'Please select payment terms for invoice';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onUpdate({
        plan: formData.plan
      });
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CreditCard className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Plan & Billing</h2>
        <p className="text-gray-600">Choose your plan and billing preferences</p>
      </div>

      <div className="space-y-6">
        {/* Plan Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Plan Selection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planTiers.map((tier) => (
                <div
                  key={tier.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.plan.tier === tier.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('tier', tier.value)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{tier.label}</h3>
                    {formData.plan.tier === tier.value && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                  <p className="text-lg font-bold">
                    ${tier.price}/month
                  </p>
                </div>
              ))}
            </div>
            {errors.tier && (
              <p className="text-sm text-red-600">{errors.tier}</p>
            )}
          </CardContent>
        </Card>

        {/* Setup Fee */}
        <Card>
          <CardHeader>
            <CardTitle>Setup Fee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="setupFeeApproved"
                checked={formData.plan.setupFeeApproved}
                onCheckedChange={(checked) => handleInputChange('setupFeeApproved', checked)}
              />
              <Label htmlFor="setupFeeApproved">
                Setup Fee Approved
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Setup fee approval is required for plan activation
            </p>
          </CardContent>
        </Card>

        {/* Monthly Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Amount ($)</Label>
              <Input
                id="monthly"
                type="number"
                value={formData.plan.monthly}
                onChange={(e) => handleInputChange('monthly', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.01"
                className={errors.monthly ? 'border-red-500' : ''}
              />
              {errors.monthly && (
                <p className="text-sm text-red-600">{errors.monthly}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.plan.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
              >
                <SelectTrigger className={errors.paymentMethod ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>

            {formData.plan.paymentMethod === 'invoice' && (
              <div className="space-y-2">
                <Label htmlFor="terms">Payment Terms</Label>
                <Select
                  value={formData.plan.terms}
                  onValueChange={(value) => handleInputChange('terms', value)}
                >
                  <SelectTrigger className={errors.terms ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {termsOptions.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms}</p>
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

export default Step11PlanBilling;

