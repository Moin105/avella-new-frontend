"use client"

import { Button } from "@/components/ui/button"
import { Phone, PlayCircle } from "lucide-react"
import { RequestDemoModal } from "@/components/request-demo-modal"
import { useState } from "react"

export function CTA() {
  const [demoOpen, setDemoOpen] = useState(false)

  return (
    <>
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-12 sm:p-16 border border-primary/20">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
              Ready to transform your business?
            </h2>
            <p className="text-xl text-muted-foreground mb-10 text-balance max-w-2xl mx-auto">
              Join leading clinics, restaurants, salons, property managers, service pros, reception teams, and dry
              cleaners using Avella AI to deliver seamless customer experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto" onClick={() => setDemoOpen(true)}>
                <Phone className="mr-2 h-5 w-5" />
                Request a Demo
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 h-12 w-full sm:w-auto bg-transparent">
                <PlayCircle className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required • Setup in minutes • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
