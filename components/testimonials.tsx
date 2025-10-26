export function Testimonials() {
  const testimonials = [
    {
      quote:
        "Avella AI has completely transformed how we handle appointments. We've seen a 40% reduction in no-shows and our phone lines are finally free!",
      author: "Marcus Johnson",
      role: "Owner, Elite Cuts Barbershop",
      location: "Los Angeles, CA",
    },
    {
      quote:
        "The AI sounds so natural, our clients don't even realize they're talking to a bot. It's like having a full-time receptionist without the overhead.",
      author: "Sarah Chen",
      role: "Manager, Luxe Hair Salon",
      location: "New York, NY",
    },
    {
      quote:
        "We were losing thousands in missed appointments. Avella AI pays for itself within the first month. Best investment we've made.",
      author: "David Rodriguez",
      role: "Owner, The Grooming Lounge",
      location: "Miami, FL",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Trusted by Barbershops & Salons Nationwide
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
