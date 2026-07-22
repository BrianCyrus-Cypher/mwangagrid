import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const INQUIRY_TYPES = [
  { value: "product", label: "Product Information", responseTime: "24 hours" },
  { value: "service", label: "Service Inquiry", responseTime: "24 hours" },
  {
    value: "installation",
    label: "Installation Request",
    responseTime: "4 hours",
  },
  { value: "support", label: "Technical Support", responseTime: "2 hours" },
  { value: "other", label: "Other", responseTime: "as soon as possible" },
];

const OFFICE_LOCATION = {
  lat: -1.263,
  lng: 36.814,
  address: "Roasters, next to Naivasha Mountain Mall",
  city: "Nairobi, Kenya",
  directionsQuery: "Mountain Mall, Thika Rd",
};

export default function Contact() {
  const { user } = useAuth();
  const submitMutation = trpc.contact.submit.useMutation();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    inquiryType: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [responseMsg, setResponseMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await submitMutation.mutateAsync({
        ...formData,
        inquiryType: (formData.inquiryType || "other") as
          | "product"
          | "service"
          | "installation"
          | "support"
          | "other",
      });
      const selected = INQUIRY_TYPES.find(
        t => t.value === (formData.inquiryType || "other")
      );
      const msgs: Record<string, string> = {
        product:
          "Thank you for your product inquiry! Our sales team will contact you within 24 hours with detailed information.",
        service:
          "Thank you for your service inquiry! We'll prepare a customized quote and reach out within 24 hours.",
        installation:
          "Thank you for your installation request! A certified technician will call you within 4 hours to schedule a site visit.",
        support:
          "Thank you for reaching out! Our support team will assist you within 2 hours.",
        other: "Thank you for your message! We'll respond as soon as possible.",
      };
      setResponseMsg(msgs[formData.inquiryType] || msgs.other);
      setSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        inquiryType: "",
        subject: "",
        message: "",
      });
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-lg p-8 md:p-12 text-center animate-fade-in card-hover">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Message Sent!
          </h1>
          <p className="text-foreground/60 mb-6 text-sm md:text-base">
            {responseMsg}
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-primary mb-8">
            <Clock className="w-4 h-4" />
            <span>
              Expected response time:{" "}
              {
                INQUIRY_TYPES.find(
                  t => t.value === (formData.inquiryType || "other")
                )?.responseTime
              }
            </span>
          </div>
          <Button onClick={() => setSubmitted(false)}>
            Send Another Message
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
            Contact Us
          </h1>
          <p className="text-foreground/60 text-sm md:text-base">
            Get in touch with the Mwanga Grid team
          </p>
        </div>
      </div>

      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-6">
            <Card className="p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Name *
                  </label>
                  <Input
                    id="contact-name"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="focus-within:neon-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Email *
                  </label>
                  <Input
                    id="contact-email"
                    autoComplete="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="focus-within:neon-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Phone *
                  </label>
                  <Input
                    id="contact-phone"
                    autoComplete="tel"
                    type="tel"
                    placeholder="+254 7XX XXX XXX"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="focus-within:neon-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-inquiry"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Inquiry Type *
                  </label>
                  <Select
                    value={formData.inquiryType}
                    onValueChange={v =>
                      setFormData({ ...formData, inquiryType: v })
                    }
                  >
                    <SelectTrigger
                      id="contact-inquiry"
                      className="focus-within:neon-accent"
                    >
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {INQUIRY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Subject *
                  </label>
                  <Input
                    id="contact-subject"
                    autoComplete="off"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={e =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    required
                    className="focus-within:neon-accent"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Message *
                  </label>
                  <Textarea
                    id="contact-message"
                    autoComplete="off"
                    placeholder="Tell us more about what you need..."
                    value={formData.message}
                    onChange={e =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    className="min-h-32 focus-within:neon-accent"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full group"
                  disabled={submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Sending..." : "Send Message"}{" "}
                  <Send className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </form>
            </Card>

            <Card className="p-6 md:p-8 card-hover">
              <div className="flex items-start gap-4">
                <MessageCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground mb-2">
                    WhatsApp Support
                  </h3>
                  <p className="text-foreground/60 mb-4 text-sm">
                    Chat with us on WhatsApp for quick support
                  </p>
                  <Button
                    size="sm"
                    className="neon-accent group"
                    onClick={() => window.open("https://wa.me/254750110836")}
                  >
                    Open WhatsApp{" "}
                    <ExternalLink className="ml-1 w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 md:p-8 card-hover">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground mb-1">Phone</h3>
                  <p className="text-foreground/60">+254 750 110 836</p>
                  <p className="text-sm text-foreground/50">
                    Mon-Sat, 8 AM - 6 PM EAT
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 md:p-8 card-hover">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground mb-1">Email</h3>
                  <p className="text-foreground/60 break-all">
                    cheidaniells@gmail.com
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-6 md:p-8 card-hover">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                <div className="min-w-0">
                  <h3 className="font-bold text-foreground mb-1">Visit Us</h3>
                  <p className="text-foreground/60">
                    {OFFICE_LOCATION.address}
                  </p>
                  <p className="text-foreground/60">P.O Box 8117 00100 NRB</p>
                  <p className="text-sm text-foreground/50">
                    {OFFICE_LOCATION.city}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden border-border/70">
              <div className="h-48 md:h-56 bg-muted relative">
                <iframe
                  title="Mwanga Grid Office Location"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(OFFICE_LOCATION.address + ", " + OFFICE_LOCATION.city)}&center=${OFFICE_LOCATION.lat},${OFFICE_LOCATION.lng}&zoom=15`}
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 md:p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Our Location
                  </p>
                  <p className="text-xs text-foreground/50">
                    {OFFICE_LOCATION.address}
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(OFFICE_LOCATION.directionsQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
                >
                  Get Directions <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
