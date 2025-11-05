"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const NAV_LINKS = [
  { id: "how-it-works", href: "#how-it-works", label: "How It Works", type: "section" },
  { id: "features", href: "#features", label: "Features", type: "section" },
  { id: "integrations", href: "#integrations", label: "Integrations", type: "section" },
  { id: "pricing", href: "/pricing", label: "Pricing", type: "route" },
  { id: "roi-calculator", href: "#roi-calculator", label: "ROI Calculator", type: "section" },
] as const

type NavLink = (typeof NAV_LINKS)[number]

const SECTION_LINKS = NAV_LINKS.filter((link) => link.type === "section")

export function Header() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection(null)
    }
  }, [pathname])

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

    SECTION_LINKS.forEach((link) => {
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

    if (link.type === "section") {
      if (window.location.pathname === "/") {
        const element = document.getElementById(link.id)
        if (element) {
          window.history.replaceState(null, "", link.href)
          element.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        return
      }

      router.push(`/${link.href}`)
      const element = document.getElementById(link.id)
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      return
    }

    router.push(link.href)
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
                    link.type === "section"
                      ? activeSection === link.id
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                      : pathname === link.href
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-current={
                    link.type === "section"
                      ? activeSection === link.id
                        ? "page"
                        : undefined
                      : pathname === link.href
                        ? "page"
                        : undefined
                  }
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
              <Button size="sm" asChild>
                <a
                  href="https://calendly.com/avellabooking-info/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Book Demo
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
