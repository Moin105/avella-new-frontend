"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Pricing } from "@/components/pricing"
import { Integrations } from "@/components/integrations"
import { useEffect, useState } from "react"

const SECTION_TABS = ["how-it-works", "features", "integrations", "pricing"] as const

export function TabbedSections() {
  const [activeTab, setActiveTab] = useState("how-it-works")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && SECTION_TABS.includes(hash as (typeof SECTION_TABS)[number])) {
        setActiveTab(hash)
      } else if (hash === "roi-calculator") {
        document.getElementById("roi-calculator")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  const handleTabChange = (value: string) => {
    if (value === "roi-calculator") {
      document.getElementById("roi-calculator")?.scrollIntoView({ behavior: "smooth", block: "start" })
      window.history.replaceState(null, "", "#roi-calculator")
      return
    }

    setActiveTab(value)
    window.history.replaceState(null, "", `#${value}`)
  }

  return (
    <section id="sections" className="py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 mb-12">
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="roi-calculator">ROI Calculator</TabsTrigger>
          </TabsList>
          <TabsContent value="how-it-works">
            <HowItWorks />
          </TabsContent>
          <TabsContent value="features">
            <Features />
          </TabsContent>
          <TabsContent value="integrations">
            <Integrations />
          </TabsContent>
          <TabsContent value="pricing">
            <Pricing />
          </TabsContent>
          <TabsContent value="roi-calculator" className="hidden" />
        </Tabs>
      </div>
    </section>
  )
}
