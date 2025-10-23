import { Phone, Brain, Calendar, CheckCircle } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      icon: Phone,
      title: "Client Calls",
      description: "Your client calls your business number, any time of day or night.",
    },
    {
      icon: Brain,
      title: "AI Answers",
      description: "Avella AI picks up instantly and has a natural conversation about their needs.",
    },
    {
      icon: Calendar,
      title: "Books Appointment",
      description: "AI checks your calendar, finds the perfect time, and confirms the booking.",
    },
    {
      icon: CheckCircle,
      title: "You Get Notified",
      description: "Appointment appears in your calendar with all client details and preferences.",
    },
  ]

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">How it works</h2>
          <p className="text-xl text-muted-foreground text-balance">
            Simple, seamless, and automatic. Your clients get instant service while you focus on what you do best.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
