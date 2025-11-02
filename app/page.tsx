import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import LogoMarquee from "@/components/LogoMarquee"
import ROIIndustryCalculator from "@/components/ROIIndustryCalculator"
import { HowItWorks } from "@/components/how-it-works"
import { Features } from "@/components/features"
import { Integrations } from "@/components/integrations"
import { Pricing } from "@/components/pricing"
import { UseCases } from "@/components/use-cases"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <LogoMarquee />
      <HowItWorks />
      <Features />
      <Integrations />
      <Pricing />
      <UseCases />
      <section id="roi-calculator" className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Calculate your return on investment
          </h2>
          <p className="text-lg text-muted-foreground text-balance max-w-3xl mx-auto">
            Adjust a few assumptions to see how quickly Avella AI pays for itself in your business.
          </p>
        </div>
        <ROIIndustryCalculator />
      </section>
      <CTA />
      <Footer />
    </main>
  )
}
