import { Card } from "@/components/ui/card";
import { Shield, FileText } from "lucide-react";

const sections = [
  {
    title: "1. Information We Collect",
    content:
      "We collect personal information you provide directly: name, email address, phone number, delivery address, and payment details. We also automatically collect certain information when you visit our site, including IP address, browser type, device information, and browsing behaviour.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to process and fulfil orders, communicate with you about your purchases, provide customer support, improve our products and services, send marketing communications (with your consent), and comply with legal obligations.",
  },
  {
    title: "3. Payment Processing",
    content:
      "Payment transactions are processed through secure third-party payment gateways (M-Pesa, bank transfers). We do not store full payment card or M-Pesa PIN details on our servers.",
  },
  {
    title: "4. Data Sharing & Disclosure",
    content:
      "We do not sell your personal information. We may share data with trusted third-party service providers who assist in operating our business (delivery partners, payment processors, IT service providers), provided they agree to keep your information confidential.",
  },
  {
    title: "5. Data Retention",
    content:
      "We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain data as required by law or for legitimate business purposes.",
  },
  {
    title: "6. Your Rights",
    content:
      "You have the right to access, correct, update, or delete your personal information. You may opt out of marketing communications at any time. To exercise these rights, contact us at heidaniells@gmail.com.",
  },
  {
    title: "7. Security",
    content:
      "We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes SSL encryption, firewalls, and access controls.",
  },
  {
    title: "8. Cookies",
    content:
      "We use cookies and similar tracking technologies to enhance your browsing experience, analyse site traffic, and understand where our visitors come from. You can control cookie preferences through your browser settings.",
  },
  {
    title: "9. Third-Party Links",
    content:
      "Our website may contain links to third-party sites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.",
  },
  {
    title: "10. Children's Privacy",
    content:
      "Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has provided us with personal data, please contact us immediately.",
  },
  {
    title: "11. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.",
  },
  {
    title: "12. Contact Us",
    content:
      "If you have any questions about this Privacy Policy or our data practices, please contact us at heidaniells@gmail.com, call +254 111 321 211, or visit our physical location in Roasters, Next to Naivasha Mountain Mall.",
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-transparent" />
        <div className="container relative z-10 max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Privacy Policy
            </h1>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Last updated: July 2026
            </p>
          </div>

          <Card className="p-6 md:p-8 border-border/70">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/30">
              <FileText className="w-4 h-4 text-accent" />
              <p className="text-xs text-foreground/40">
                Your privacy matters to us. Please read this policy carefully.
              </p>
            </div>
            <div className="space-y-6">
              {sections.map((section, i) => (
                <div key={i}>
                  <h2 className="text-sm md:text-base font-bold text-foreground mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-foreground/60 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
