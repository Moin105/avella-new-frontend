export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Our physicians love that Avella AI can capture every call, collect intake details, and escalate urgent cases instantly. Patients get answers fast and our staff can finally breathe.",
      author: "Dr. Alicia Nguyen",
      role: "Practice Director, Crescent Medical Clinic",
      location: "Houston, TX",
    },
    {
      quote:
        "Dinner rush used to overwhelm the team. Now Avella manages reservations, large-party requests, and waitlist updates without missing a beat.",
      author: "Marco Rivera",
      role: "General Manager, Lumen Bistro",
      location: "Chicago, IL",
    },
    {
      quote:
        "We support thousands of residents, vendors, and deliveries. Avella handles it all—maintenance scheduling, amenity bookings, and after-hours triage—while keeping our brand voice intact.",
      author: "Jordan Blake",
      role: "Operations Lead, Skyline Residences",
      location: "Seattle, WA",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Trusted by Customer-Obsessed Teams Everywhere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            See what business owners are saying about Avella AI
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <svg className="w-8 h-8 text-primary/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
