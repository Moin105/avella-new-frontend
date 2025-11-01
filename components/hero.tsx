"use client"

import { Button } from "@/components/ui/button"
import { Phone, PlayCircle } from "lucide-react"
import { ContactForm } from "@/components/contact-form"
import { RequestDemoModal } from "@/components/request-demo-modal"
import { useState } from "react"

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

        <div className="container mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI-Powered Reception & Booking
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
                Never miss a booking again
              </h1>

              <p className="text-xl sm:text-2xl text-muted-foreground mb-10 text-balance leading-relaxed">
                Voice AI that answers calls, manages requests, and books appointments for doctors' offices, restaurants,
                barbers & salons, residential buildings, service trades, reception teams, and dry cleaners—24/7.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
                <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto" onClick={() => setDemoOpen(true)}>
                  <Phone className="mr-2 h-5 w-5" />
                  Request a Demo
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto bg-transparent">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
