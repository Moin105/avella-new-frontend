import { Bot, Users, BarChart3, Clock, Shield, Zap } from "lucide-react"

export function Features() {
  const features = [
    {
      icon: Bot,
      title: "Voice AI Assistant",
      description:
        "Natural-sounding AI that handles calls, answers questions, and books appointments just like your best receptionist.",
    },
    {
      icon: Users,
      title: "Complete CRM",
      description:
        "Track client history, preferences, and visit patterns. Build stronger relationships with automated follow-ups.",
    },
    {
      icon: BarChart3,
      title: "Business Analytics",
      description:
        "Real-time insights into bookings, revenue, peak hours, and client retention to grow your business smarter.",
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description:
        "AI optimizes your calendar, prevents double-bookings, and sends automatic reminders to reduce no-shows.",
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description:
        "Bank-level encryption and HIPAA-compliant data handling. Your clients' information is always protected.",
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description:
        "Get started in minutes, not weeks. Simple integration with your existing phone system and calendar.",
    },
  ]

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Everything you need to run your salon
          </h2>
          <p className="text-xl text-muted-foreground text-balance">
            Powerful features designed specifically for barbershops and salons. Focus on your craft, let AI handle the
            rest.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
