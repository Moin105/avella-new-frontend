"use client"

import type React from "react"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { SignInModal } from "@/components/sign-in-modal"
import { RequestDemoModal } from "@/components/request-demo-modal"
import { useState } from "react"

export function Header() {
  const [signInOpen, setSignInOpen] = useState(false)
  const [demoOpen, setDemoOpen] = useState(false)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault()
    window.location.hash = hash
    const element = document.getElementById("sections")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image src="/avella-logo-icon.png" alt="Avella AI" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">Avella AI</span>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <a
                href="#integrations"
                onClick={(e) => handleNavClick(e, "integrations")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Integrations
              </a>
              <a
                href="#features"
                onClick={(e) => handleNavClick(e, "features")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={(e) => handleNavClick(e, "how-it-works")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                onClick={(e) => handleNavClick(e, "pricing")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => setSignInOpen(true)}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => setDemoOpen(true)}>
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <SignInModal open={signInOpen} onOpenChange={setSignInOpen} />
      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
