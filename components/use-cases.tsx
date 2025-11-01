export function UseCases() {
  const useCases = [
    {
      title: "Doctors' Offices & Clinics",
      description: "Triage calls, route urgent requests, and keep provider schedules full without overloading staff.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zm0 2c-2.21 0-4 1.79-4 4v6h8v-6c0-2.21-1.79-4-4-4zm6-6h2m-1-1v2m-14-2H3m1-1v2"
          />
        </svg>
      ),
    },
    {
      title: "Restaurants & Hospitality",
      description: "Manage reservations, waitlists, and catering inquiries with instant confirmations and updates.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 3h16M4 9h16M9 21h6m-9-6h12l1-6H4l1 6z"
          />
        </svg>
      ),
    },
    {
      title: "Barbers & Salons",
      description: "Fill chairs, coordinate stylists, and personalize visits with client preferences at the ready.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: "Residential Buildings",
      description: "Provide residents with on-demand assistance, maintenance scheduling, and amenity reservations.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 21h16V7l-8-4-8 4v14zm8-10v10m4-6h4m-16 0h4"
          />
        </svg>
      ),
    },
    {
      title: "Service Trades",
      description: "Dispatch crews, coordinate field visits, and confirm jobs for plumbers, electricians, and contractors.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7h18M5 7l1 12h12l1-12M10 11h4m-5 4h6"
          />
        </svg>
      ),
    },
    {
      title: "Reception Teams",
      description: "Give front desks superpowers with overflow support, call routing, and smart follow-ups.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 9a5 5 0 0110 0v2h1a3 3 0 013 3v4h-4v-2H7v2H3v-4a3 3 0 013-3h1V9z"
          />
        </svg>
      ),
    },
    {
      title: "Dry Cleaners",
      description: "Streamline drop-off scheduling, delivery routes, and customer updates without missing a call.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4h16l-2 14H6L4 4zm4 4h8m-7 4h6"
          />
        </svg>
      ),
    },
    {
      title: "Other Industries",
      description:
        "Have phones, bookings, or inbound requests to juggle? We’ll tailor the agent to your workflow—real estate, gyms, auto shops, legal, education, nonprofits, and more. Tell us your process and we’ll map it end-to-end.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v12m6-6H6"
          />
        </svg>
      ),
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Built for Every Team that Picks Up the Phone
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            From healthcare to hospitality and property management, Avella AI adapts to the workflows of your industry.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
            >
              <div className="bg-primary/10 rounded-lg p-3 w-fit mb-4 text-primary">{useCase.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
