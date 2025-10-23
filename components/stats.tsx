export function Stats() {
  const stats = [
    {
      value: "95%",
      label: "Booking Success Rate",
      description: "Calls converted to appointments",
    },
    {
      value: "24/7",
      label: "Always Available",
      description: "Never miss a booking opportunity",
    },
    {
      value: "3x",
      label: "More Bookings",
      description: "Average increase in monthly appointments",
    },
    {
      value: "<30s",
      label: "Average Call Time",
      description: "Fast, efficient booking experience",
    },
  ]

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-base sm:text-lg font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
