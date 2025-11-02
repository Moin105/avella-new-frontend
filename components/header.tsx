"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { RequestDemoModal } from "@/components/request-demo-modal"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const NAV_LINKS = [
  { id: "how-it-works", href: "#how-it-works", label: "How It Works" },
  { id: "features", href: "#features", label: "Features" },
  { id: "integrations", href: "#integrations", label: "Integrations" },
  { id: "pricing", href: "#pricing", label: "Pricing" },
  { id: "roi-calculator", href: "#roi-calculator", label: "ROI Calculator" },
] as const

type NavLink = (typeof NAV_LINKS)[number]

export function Header() {
  const router = useRouter()
  const [demoOpen, setDemoOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visibleEntries.length > 0) {
          setActiveSection(visibleEntries[0].target.id)
        }
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: [0.2, 0.4, 0.6],
      },
    )

    NAV_LINKS.forEach((link) => {
      const element = document.getElementById(link.id)
      if (element) {
        observer.observe(element)
      }
    })

    const handleHashChange = () => {
      const currentHash = window.location.hash.replace("#", "")
      if (currentHash) {
        setActiveSection(currentHash)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      observer.disconnect()
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, link: NavLink) => {
    event.preventDefault()

    if (window.location.pathname === "/") {
      const element = document.getElementById(link.id)
      if (element) {
        window.history.replaceState(null, "", link.href)
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      return
    }

    router.push(`/${link.href}`)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group" aria-label="Avella AI home">
              <Image src="/avella-logo-icon.png" alt="Avella AI" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                Avella AI
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={(event) => handleNavClick(event, link)}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    activeSection === link.id
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={activeSection === link.id ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/contact"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => setDemoOpen(true)}>
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </header>

      <RequestDemoModal open={demoOpen} onOpenChange={setDemoOpen} />
    </>
  )
}
