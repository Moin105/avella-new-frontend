"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Features } from "@/components/features"
import { HowItWorks } from "@/components/how-it-works"
import { Pricing } from "@/components/pricing"
import { Integrations } from "@/components/integrations"
import { useEffect, useState } from "react"

export function TabbedSections() {
  const [activeTab, setActiveTab] = useState("how-it-works")

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && ["how-it-works", "features", "integrations", "pricing"].includes(hash)) {
        setActiveTab(hash)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [])

  return (
    <section id="sections" className="py-12 px-4 sm:px-6 lg:px-8 scroll-mt-16">
      <div className="container mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12">
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
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
        </Tabs>
      </div>
    </section>
  )
}
