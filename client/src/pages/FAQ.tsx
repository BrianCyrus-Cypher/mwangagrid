import { Card } from "@/components/ui/card";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "What products does Mwanga Grid offer?",
    a: "We specialize in solar energy equipment (panels, inverters, batteries, charge controllers), CCTV surveillance systems (cameras, DVRs, accessories), and high-speed networking equipment (routers, switches, access points, fiber optics).",
  },
  {
    q: "Do you offer installation services?",
    a: "Yes, professional installation is included with every major purchase. Our certified technicians handle everything from solar panel mounting to CCTV camera placement and network configuration.",
  },
  {
    q: "What areas do you serve?",
    a: "We serve customers across Kenya. Free same-day delivery is available within Nairobi, and we ship nationwide via reliable courier partners with tracking.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept M-Pesa, bank transfers, and cash on delivery (Nairobi only). For large orders, we also offer installment plans via Lipa Mdogo Mdogo.",
  },
  {
    q: "How do I track my order?",
    a: "After placing an order, you will receive a confirmation email with your order number and tracking details. You can also view order status in your account dashboard under 'My Orders'.",
  },
  {
    q: "What is your return policy?",
    a: "We offer a 7-day return window for defective or incorrect items. Products must be in their original packaging. Installation services are covered by a separate workmanship guarantee.",
  },
  {
    q: "Do you offer warranties on products?",
    a: "Yes, all our products come with manufacturer warranties. Solar panels typically carry a 25-year performance warranty, inverters 5 years, batteries 2-5 years, and electronics 1-2 years.",
  },
  {
    q: "How do I request a quotation for bulk orders?",
    a: "You can use the 'Get Free Quote' form on our website, or contact us directly via WhatsApp or email. We typically respond within 2 hours during business hours.",
  },
  {
    q: "Do you provide after-sales support?",
    a: "Absolutely. We offer technical support via phone, WhatsApp, and email during business hours. Our team will assist with troubleshooting, maintenance advice, and warranty claims.",
  },
  {
    q: "How can I contact customer service?",
    a: "Reach us via WhatsApp at +254 750 110 836, email at heidaniells@gmail.com, or visit our physical location in Roasters, Next to Naivasha Mountain Mall. Mon-Fri 8AM-6PM, Sat 9AM-3PM.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-transparent" />
        <div className="container relative z-10 max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
              <HelpCircle className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-foreground/60 max-w-lg mx-auto">
              Everything you need to know about our products, services, and
              policies.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <Card
                key={i}
                className={`overflow-hidden transition-all duration-200 cursor-pointer border-border/70 ${
                  openIndex === i ? "ring-1 ring-accent/30" : ""
                }`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <div className="p-4 md:p-5 flex items-start justify-between gap-4">
                  <h3 className="text-sm md:text-base font-semibold text-foreground leading-relaxed pr-2">
                    {faq.q}
                  </h3>
                  <div className="shrink-0 mt-0.5 text-foreground/40">
                    {openIndex === i ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </div>
                <div
                  className={`grid transition-all duration-200 ${
                    openIndex === i
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-foreground/60 leading-relaxed border-t border-border/30 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
