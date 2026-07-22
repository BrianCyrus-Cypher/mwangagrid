import { Card } from "@/components/ui/card";
import { Scale, FileText } from "lucide-react";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using the Mwanga Grid website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.",
  },
  {
    title: "2. Definitions",
    content:
      '"Mwanga Grid," "we," "us," or "our" refers to the business operating this e-commerce platform. "Customer," "you," or "your" refers to the individual or entity purchasing our products or services.',
  },
  {
    title: "3. Products & Services",
    content:
      "We offer solar energy equipment, CCTV surveillance systems, networking hardware, and related installation services. Product descriptions, images, and specifications are provided for informational purposes and may vary from the actual product. We reserve the right to modify or discontinue products without prior notice.",
  },
  {
    title: "4. Pricing & Payment",
    content:
      "All prices are listed in Kenyan Shillings (KES) and inclusive of applicable taxes. Prices are subject to change without notice. Payment must be received in full before order processing begins. Accepted payment methods include M-Pesa, bank transfers, and cash on delivery where available.",
  },
  {
    title: "5. Orders & Acceptance",
    content:
      "Placing an item in your cart or submitting an order does not constitute acceptance of the order. We reserve the right to accept or decline any order for any reason, including product availability, pricing errors, or suspected fraud. You will be notified if your order is cancelled.",
  },
  {
    title: "6. Delivery & Installation",
    content:
      "Delivery timelines are estimates and not guarantees. Free same-day delivery applies within Nairobi for orders placed before 2PM. Nationwide delivery timelines vary by location. Installation services are scheduled at a mutually convenient time and are subject to site assessment.",
  },
  {
    title: "7. Returns & Refunds",
    content:
      "Returns are accepted within 7 days of delivery for defective or incorrect items. Products must be unused and in original packaging. Refunds are processed within 5-7 business days after inspection. Installation service fees are non-refundable once work has commenced.",
  },
  {
    title: "8. Warranty",
    content:
      "All products carry manufacturer warranties as specified at the time of purchase. Warranty claims must be made through our customer service team. Warranties do not cover damage from misuse, unauthorized repairs, or normal wear and tear.",
  },
  {
    title: "9. Limitation of Liability",
    content:
      "Mwanga Grid shall not be liable for any indirect, incidental, special, or consequential damages arising from the use or inability to use our products or services. Our total liability is limited to the amount paid for the specific product or service giving rise to the claim.",
  },
  {
    title: "10. Privacy",
    content:
      "Your use of our services is also governed by our Privacy Policy, which outlines how we collect, use, and protect your personal information.",
  },
  {
    title: "11. Governing Law",
    content:
      "These Terms are governed by the laws of the Republic of Kenya. Any disputes arising from these Terms shall be resolved through arbitration in accordance with Kenyan law.",
  },
  {
    title: "12. Changes to Terms",
    content:
      "We reserve the right to update these Terms at any time. Changes will be effective immediately upon posting. Continued use of our services after changes constitutes acceptance of the new Terms.",
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-transparent" />
        <div className="container relative z-10 max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <Scale className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Terms of Service
            </h1>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Last updated: July 2026
            </p>
          </div>

          <Card className="p-6 md:p-8 border-border/70">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/30">
              <FileText className="w-4 h-4 text-accent" />
              <p className="text-xs text-foreground/40">
                Please read these Terms of Service carefully before using our
                platform.
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
