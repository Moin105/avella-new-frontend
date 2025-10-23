"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessType: "",
    numberOfChairs: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("[v0] Contact form:", formData)
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
            placeholder="Your barbershop or salon name"
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
              <SelectItem value="barbershop">Barbershop</SelectItem>
              <SelectItem value="salon">Salon</SelectItem>
              <SelectItem value="both">Both</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="chairs">Number of Chairs/Stylists</Label>
          <Input
            id="chairs"
            type="number"
            placeholder="e.g., 5"
            min="1"
            value={formData.numberOfChairs}
            onChange={(e) => setFormData({ ...formData, numberOfChairs: e.target.value })}
            required
          />
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
        <Button type="submit" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  )
}
