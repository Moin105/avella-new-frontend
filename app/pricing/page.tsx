import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Pricing } from "@/components/pricing"
import { CTA } from "@/components/cta"

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="container mx-auto text-center max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">Flexible pricing for every team</h1>
          <p className="text-lg text-muted-foreground text-balance">
            Choose the plan that matches your call volume and growth goals. Our team will tailor a package to fit your
            business perfectly.
          </p>
        </div>
      </section>
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
