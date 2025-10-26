import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">About Avella AI</h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            Transforming how barbershops and salons manage appointments with intelligent voice AI technology.
          </p>

          <div className="prose prose-lg max-w-none">
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Avella AI, we believe that every barbershop and salon deserves access to cutting-edge technology that
                helps them grow their business. Our mission is to eliminate missed appointments and streamline client
                management through intelligent voice AI that works 24/7.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Why We Built Avella AI</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We noticed that barbershops and salons were losing thousands of dollars every month due to missed calls
                and no-shows. Business owners were spending hours on the phone booking appointments instead of focusing
                on what they do best—serving their clients.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                That's why we created Avella AI—a voice AI assistant that handles appointment bookings, sends reminders,
                and manages your client database automatically. Now, your business never misses an opportunity, even
                when you're busy with clients or after hours.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Technology</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Avella AI uses advanced natural language processing and machine learning to understand your clients'
                needs and book appointments accurately. Our AI is trained specifically for the beauty and grooming
                industry, understanding terminology, services, and scheduling nuances unique to barbershops and salons.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Natural conversation flow that feels human</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>24/7 availability with no downtime</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Seamless integration with your existing systems</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Automatic client database management</span>
                </li>
              </ul>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Team</h2>
              <p className="text-muted-foreground leading-relaxed">
                We're a team of AI engineers, product designers, and industry experts passionate about helping small
                businesses thrive. With backgrounds in artificial intelligence, customer service, and the beauty
                industry, we understand both the technology and the unique challenges faced by barbershops and salons.
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Transform Your Business?</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Join hundreds of barbershops and salons already using Avella AI to grow their business.
              </p>
              <a
                href="/#contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Request a Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
