import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";

const INQUIRY_TYPES = [
  { value: "product", label: "Product Information", responseTime: "24 hours" },
  { value: "service", label: "Service Inquiry", responseTime: "24 hours" },
  { value: "installation", label: "Installation Request", responseTime: "4 hours" },
  { value: "support", label: "Technical Support", responseTime: "2 hours" },
  { value: "other", label: "Other", responseTime: "as soon as possible" },
];

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
        inquiryType: (formData.inquiryType || "other") as "product" | "service" | "installation" | "support" | "other",
      });
      const selected = INQUIRY_TYPES.find(t => t.value === (formData.inquiryType || "other"));
      const msgs: Record<string, string> = {
        product: "Thank you for your product inquiry! Our sales team will contact you within 24 hours with detailed information.",
        service: "Thank you for your service inquiry! We'll prepare a customized quote and reach out within 24 hours.",
        installation: "Thank you for your installation request! A certified technician will call you within 4 hours to schedule a site visit.",
        support: "Thank you for reaching out! Our support team will assist you within 2 hours.",
        other: "Thank you for your message! We'll respond as soon as possible.",
      };
      setResponseMsg(msgs[formData.inquiryType] || msgs.other);
      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", inquiryType: "", subject: "", message: "" });
    } catch {
      setError("Failed to send message. Please try again.");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-24">
          <Card className="max-w-lg mx-auto p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-4">Message Sent!</h1>
            <p className="text-foreground/60 mb-6">{responseMsg}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-primary mb-8">
              <Clock className="w-4 h-4" />
              <span>Expected response time: {INQUIRY_TYPES.find(t => t.value === (formData.inquiryType || "other"))?.responseTime}</span>
            </div>
            <Button onClick={() => setSubmitted(false)}>Send Another Message</Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Contact Us</h1>
          <p className="text-foreground/60">Get in touch with the Mwanga Grid team</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                  <Input placeholder="Your full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <Input type="email" placeholder="your@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                  <Input type="tel" placeholder="+254 7XX XXX XXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Inquiry Type *</label>
                  <Select value={formData.inquiryType} onValueChange={(v) => setFormData({ ...formData, inquiryType: v })}>
                    <SelectTrigger><SelectValue placeholder="Select inquiry type" /></SelectTrigger>
                    <SelectContent>
                      {INQUIRY_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Subject *</label>
                  <Input placeholder="How can we help?" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <Textarea placeholder="Tell us more about what you need..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required className="min-h-32" />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? "Sending..." : "Send Message"} <Send className="ml-2 w-4 h-4" />
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-1">Phone</h3>
                  <p className="text-foreground/60">+254 111 321 211</p>
                  <p className="text-sm text-foreground/50">Mon-Sat, 8 AM - 6 PM EAT</p>
                </div>
              </div>
            </Card>
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-1">Email</h3>
                  <p className="text-foreground/60">cheidaniells@gmail.com</p>
                </div>
              </div>
            </Card>
            <Card className="p-8">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-1">Visit Us</h3>
                  <p className="text-foreground/60">Roasters, next to Naivasha Mountain Mall</p>
                  <p className="text-foreground/60">P.O Box 8117 00100 NRB</p>
                  <p className="text-sm text-foreground/50">Nairobi, Kenya</p>
                </div>
              </div>
            </Card>
            <Card className="p-8 bg-primary/10 border-primary/20">
              <div className="flex items-start gap-4">
                <MessageCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-foreground mb-2">WhatsApp Support</h3>
                  <p className="text-foreground/60 mb-4">Chat with us on WhatsApp for quick support</p>
                  <Button size="sm" onClick={() => window.open("https://wa.me/254111321211")}>Open WhatsApp</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
