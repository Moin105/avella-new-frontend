import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { AuthProvider } from "./contexts/AuthContext"
import { TenantProvider } from "./contexts/TenantContext"
import { Toaster } from "./components/ui/toaster"

export const metadata: Metadata = {
  title: "Avella AI - Voice AI Appointment Booking for Barbershops & Salons",
  description:
    "Transform your barbershop or salon with AI-powered appointment booking and CRM. Never miss a booking again with 24/7 voice AI assistance.",
  generator: "v0.app",
  icons: {
    icon: [{ url: "/avella-logo-icon.png", type: "image/png" }],
    apple: "/avella-logo-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <TenantProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Toaster />
            <Analytics />
          </TenantProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
