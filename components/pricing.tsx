import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check, Phone } from "lucide-react"

export function Pricing() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Pricing tailored to your business
          </h2>
          <p className="text-xl text-muted-foreground text-balance">
            Every barbershop and salon is unique. We create custom pricing based on your specific needs, team size, and
            call volume.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-2xl bg-card border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-4">What's Included</h3>
              <ul className="space-y-4">
                {[
                  "24/7 Voice AI receptionist",
                  "Unlimited appointment bookings",
                  "Unified messaging inbox",
                  "Business analytics dashboard",
                  "SMS & email reminders",
                  "Calendar integrations",
                  "Multi-location support",
                  "Dedicated account manager",
                  "Priority support",
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 flex flex-col justify-center items-center text-center">
              <Phone className="h-16 w-16 text-primary mb-6" />
              <h3 className="text-2xl font-bold text-foreground mb-4">Custom Pricing</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Our pricing is based on your business size, number of locations, and expected call volume. Most of our
                clients see ROI within the first month.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link href="/contact">Contact Us for Pricing</Link>
              </Button>
            </div>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-muted/50 border border-border">
            <p className="text-center text-muted-foreground">
              <strong className="text-foreground">Money-back guarantee:</strong> Try Avella AI risk-free for 30 days. If
              you're not completely satisfied, we'll refund your money—no questions asked.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
