import { Calendar, MessageSquare, Database, Smartphone } from "lucide-react"

export function Integrations() {
  const integrations = [
    {
      icon: Calendar,
      name: "Calendar Apps",
      description: "Google Calendar, Outlook, Apple Calendar, and more",
    },
    {
      icon: MessageSquare,
      name: "Messaging",
      description: "SMS, WhatsApp, email notifications and reminders",
    },
    {
      icon: Database,
      name: "Existing Systems",
      description: "Import your current client database seamlessly",
    },
    {
      icon: Smartphone,
      name: "Phone Systems",
      description: "Works with any phone line or VoIP system",
    },
  ]

  return (
    <section id="integrations" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
            Seamless integrations with your existing tools
          </h2>
          <p className="text-xl text-muted-foreground text-balance">
            Avella AI works with the tools you already use. No need to change your workflow—we adapt to you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 max-w-5xl mx-auto">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <integration.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{integration.name}</h3>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20">
          <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Easy Migration</h3>
          <p className="text-muted-foreground text-center leading-relaxed">
            Worried about switching systems? Our team handles the entire migration process for you. We'll import your
            existing client data, set up all integrations, and train your team while your business keeps running.
          </p>
        </div>
      </div>
    </section>
  )
}
