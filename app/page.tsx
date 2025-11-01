import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import LogoMarquee from "@/components/LogoMarquee"
import ROIIndustryCalculator from "@/components/ROIIndustryCalculator"
import { TabbedSections } from "@/components/tabbed-sections"
import { UseCases } from "@/components/use-cases"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <LogoMarquee />
      <TabbedSections />
      <UseCases />
      <section id="roi-calculator" className="py-16 md:py-24">
        <ROIIndustryCalculator />
      </section>
      <CTA />
      <Footer />
    </main>
  )
}
