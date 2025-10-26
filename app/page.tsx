import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Stats } from "@/components/stats"
import { TabbedSections } from "@/components/tabbed-sections"
import { UseCases } from "@/components/use-cases"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Stats />
      <TabbedSections />
      <UseCases />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
