import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>

          <div className="prose prose-lg max-w-none space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At Avella AI ("we," "our," or "us"), we are committed to protecting your privacy and ensuring the
                security of your personal information. This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our voice AI appointment booking and CRM services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Information We Collect</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Name, email address, and phone number</li>
                <li>Business name and address</li>
                <li>Appointment details and scheduling preferences</li>
                <li>Client information you input into our CRM system</li>
                <li>Payment information (processed securely through third-party providers)</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Voice Data</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our voice AI system processes voice calls to book appointments. Voice recordings are temporarily stored
                for quality assurance and service improvement purposes, then automatically deleted after 90 days unless
                required for legal compliance.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use our services, we automatically collect:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Device information and IP address</li>
                <li>Browser type and operating system</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Provide, maintain, and improve our voice AI and CRM services</li>
                <li>Process and manage appointments</li>
                <li>Send appointment reminders and notifications</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Analyze usage patterns and optimize our services</li>
                <li>Detect and prevent fraud or security issues</li>
                <li>Comply with legal obligations</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell your personal information. We may share your information with:
              </p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>
                  <strong>Service Providers:</strong> Third-party vendors who perform services on our behalf
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with mergers, acquisitions, or asset sales
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly authorize us to share information
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption,
                secure servers, and regular security audits. However, no method of transmission over the internet is
                100% secure, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Rights and Choices</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You have the right to:</p>
              <ul className="space-y-2 text-muted-foreground list-disc pl-6">
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Restrict or object to certain processing activities</li>
                <li>Data portability (receive your data in a structured format)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at privacy@avella.ai.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with
                legal obligations. Voice recordings are automatically deleted after 90 days. Account information is
                retained until you request deletion or close your account.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                information from children under 13. If you believe we have collected information from a child under 13,
                please contact us immediately.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence.
                We ensure appropriate safeguards are in place to protect your information in accordance with this
                Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by
                posting the new Privacy Policy on this page and updating the "Last updated" date. Your continued use of
                our services after changes constitutes acceptance of the updated policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  <strong>Email:</strong> privacy@avella.ai
                </p>
                <p className="text-muted-foreground">
                  <strong>Phone:</strong> 1-800-AVELLA-AI
                </p>
                <p className="text-muted-foreground">
                  <strong>Address:</strong> 123 AI Boulevard, San Francisco, CA 94102
                </p>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-foreground mb-2">Questions about your data?</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We're here to help. Contact our privacy team for any questions about how we handle your information.
              </p>
              <a href="/contact" className="inline-flex items-center text-primary hover:underline font-medium">
                Contact Privacy Team →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
