"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/app/lib/api"
import { BUSINESS_TYPE_OPTIONS } from "@/lib/business-types"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // Submit to backend API using apiClient
      const response = await apiClient.post('/leads', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        business_name: formData.businessName,
        business_type: formData.businessType,
        message: formData.message,
        source: 'contact_form'
      })

      if (response.success) {
        // Reset form on success
        setFormData({
          name: "",
          email: "",
          phone: "",
          businessName: "",
          businessType: "",
          message: "",
        })
        alert('Thank you for your interest! We will contact you soon.')
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('There was an error submitting your form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md p-6 rounded-2xl bg-card border border-border shadow-lg">
      <h3 className="text-xl font-semibold text-foreground mb-4">Get Started Today</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            placeholder="Your name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone</Label>
          <Input
            id="contact-phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-name">Business Name</Label>
          <Input
            id="business-name"
            placeholder="Your business or organization name"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="business-type">Business Type</Label>
          <Select
            value={formData.businessType}
            onValueChange={(value) => setFormData({ ...formData, businessType: value })}
            required
          >
            <SelectTrigger id="business-type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {BUSINESS_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Additional Information (Optional)</Label>
          <Textarea
            id="message"
            placeholder="Tell us about your needs..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={3}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  )
}
