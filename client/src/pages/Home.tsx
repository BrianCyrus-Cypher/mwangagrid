import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  Star,
  CheckCircle2,
  Wifi,
  Sun,
  Camera,
  Network,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

function LoadingCard() {
  return (
    <Card className="overflow-hidden border-border/70 shadow-md">
      <div className="h-48 animate-pulse bg-gradient-to-br from-muted via-muted/80 to-muted/60" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted/80" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted/80" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </Card>
  );
}

const HERO_SLIDES = [
  {
    headline: "Solar Power Solutions for a Brighter Kenya",
    sub: "From portable generators to whole-home solar systems — we power your world reliably and affordably.",
    cta: "Shop Solar",
    link: "/products",
    accent: "from-amber-500 to-orange-600",
    icon: Sun,
  },
  {
    headline: "Professional CCTV & Security Systems",
    sub: "High-definition cameras, 24/7 monitoring, and expert installation for homes and businesses across Kenya.",
    cta: "View Cameras",
    link: "/products",
    accent: "from-blue-500 to-indigo-600",
    icon: Camera,
  },
  {
    headline: "Enterprise-Grade Networking Equipment",
    sub: "Wi-Fi 6 routers, managed switches, fiber optic cabling — everything you need for a fast, reliable network.",
    cta: "Browse Products",
    link: "/products",
    accent: "from-emerald-500 to-teal-600",
    icon: Network,
  },
];

const CATEGORIES = [
  { label: "Solar Equipment", slug: "solar-equipment", icon: Sun, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { label: "CCTV Cameras", slug: "cctv-cameras", icon: Camera, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { label: "Routers", slug: "routers", icon: Wifi, color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  { label: "Network Switches", slug: "network-switches", icon: Network, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
];

const TESTIMONIALS = [
  { name: "John Mwangi", company: "Tech Solutions Ltd", text: "Mwanga Grid provided exceptional CCTV installation service. Professional, reliable, and great value.", rating: 5 },
  { name: "Sarah Kipchoge", company: "Retail Hub Kenya", text: "Their solar and network setup transformed our business operations completely. Highly recommended!", rating: 5 },
  { name: "David Omondi", company: "Security First", text: "Quality products and outstanding customer support. We've been a loyal customer for over 2 years.", rating: 5 },
];

function CategoryIcon({ icon: Icon, color, label }: { icon: any; color: string; label: string }) {
  const [, navigate] = useLocation();
  return (
    <button
      onClick={() => navigate("/products")}
      className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${color} hover:scale-105 transition-transform duration-200 cursor-pointer border border-transparent hover:border-current/20`}
    >
      <Icon className="w-10 h-10" />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: services, isLoading: servicesLoading } = trpc.services.list.useQuery();



  const [slide, setSlide] = useState(0);





  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const featuredProducts = products?.slice(0, 4) || [];
  const current = HERO_SLIDES[slide];
  const HeroIcon = current.icon;
  const featuredProductCards = productsLoading
    ? Array.from({ length: 4 }, (_, index) => ({ id: `loading-${index}` }))
    : featuredProducts;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className={`bg-gradient-to-br ${current.accent} transition-all duration-700`}>
          <div className="container py-24 md:py-36">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 text-white">
                {/* Slide Dots */}
                <div className="flex gap-2">
                  {HERO_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setSlide(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === slide ? "w-8 bg-white" : "w-4 bg-white/40"}`}
                    />
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                  {current.headline}
                </h1>
                <p className="text-lg text-white/85 max-w-lg">
                  {current.sub}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-white/90 font-bold shadow-lg"
                    onClick={() => navigate(current.link)}
                  >
                    {current.cta} <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                    onClick={() => navigate("/quotation")}
                  >
                    Get a Free Quote
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex gap-8 pt-4 border-t border-white/20">
                  {[
                    { value: "5,000+", label: "Happy Customers" },
                    { value: "10+", label: "Years Experience" },
                    { value: "24/7", label: "Support" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-white/70">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image */}
              <div className="hidden md:flex items-center justify-center">
                <div className="w-72 h-72 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl border border-white/20">
                  <HeroIcon className="w-40 h-40 text-white/90" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="h-16 bg-background" style={{ clipPath: "ellipse(55% 100% at 50% 0%)" }} />
      </section>

      {/* ── Categories ── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground mb-2">Shop by Category</h2>
            <p className="text-foreground/60">Everything you need for power, security, and connectivity</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => (
              <CategoryIcon key={cat.slug} icon={cat.icon} color={cat.color} label={cat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Mwanga Grid?</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We deliver excellence through quality products, professional services, and dedicated customer support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sun, title: "Solar Solutions", desc: "Premium solar systems for homes and businesses — from portable generators to whole-home setups.", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
              { icon: Shield, title: "CCTV & Security", desc: "Professional-grade cameras and 24/7 monitoring for complete peace of mind.", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
              { icon: Network, title: "Enterprise Networking", desc: "Wi-Fi 6, managed switches, fiber — everything for a fast, reliable network.", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30" },
            ].map((item, i) => (
              <Card key={i} className="p-8 text-center hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-6`}>
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">{item.title}</h3>
                <p className="text-foreground/60 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Products</h2>
              <p className="text-foreground/60">Top-selling technology solutions</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/products")} className="hidden md:flex">
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProductCards.map((product: any) =>
              productsLoading ? (
                <LoadingCard key={product.id} />
              ) : (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col border-border/70 shadow-md bg-card/95 backdrop-blur-sm"
                  onClick={() => navigate("/products")}
                >
                  <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-4"
                        onError={(e: any) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className="hidden w-full h-full items-center justify-center text-5xl">📦</div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-foreground/60 mb-4 flex-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-accent">
                        KES {(product.price || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-foreground/50 hover:text-accent transition-colors">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Card>
              )
            )}
          </div>
          <div className="text-center mt-8 md:hidden">
            <Button variant="outline" onClick={() => navigate("/products")}>
              View All Products <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-white/70 max-w-xl mx-auto">Professional installation and support services by certified technicians</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(servicesLoading
              ? Array.from({ length: 4 }, (_, index) => ({ id: `loading-${index}` }))
              : services && services.length > 0 ? services : [
              { id: 1, name: "CCTV Installation", description: "Professional CCTV camera installation for homes and businesses. Site survey to commissioning handled end-to-end." },
              { id: 2, name: "Internet & Network Setup", description: "End-to-end network infrastructure setup including routing, switching, and Wi-Fi optimisation." },
              { id: 3, name: "Solar System Installation", description: "Turn-key solar power solutions from site assessment through installation and after-sales support." },
              { id: 4, name: "IT Support & Maintenance", description: "Ongoing managed IT support for SMEs — hardware, software, and network troubleshooting." },
            ])?.map((service: any) =>
              service.name ? (
                <Card
                  key={service.id}
                  className="p-8 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => navigate("/services")}
                >
                  <h3 className="text-xl font-bold text-white mb-3">{service.name}</h3>
                  <p className="text-white/70 mb-5 leading-relaxed">{service.description}</p>
                  <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10">
                    Learn More <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              ) : (
                <Card key={service.id} className="p-8 bg-white/10 border-white/15">
                  <div className="space-y-4">
                    <div className="h-6 w-2/3 animate-pulse rounded bg-white/20" />
                    <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                    <div className="h-10 w-36 animate-pulse rounded-lg bg-white/15" />
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">What Our Customers Say</h2>
            <p className="text-foreground/60">Trusted by thousands across Kenya</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-8 hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-foreground/70 mb-6 leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-foreground">{t.name}</p>
                  <p className="text-sm text-foreground/50">{t.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="py-12 bg-muted/40">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle2, title: "ISO 9001 Certified", desc: "Quality management" },
              { icon: Shield, title: "Bank-Level Security", desc: "Safe & secure platform" },
              { icon: Users, title: "10+ Years Experience", desc: "Trusted since 2015" },
              { icon: Zap, title: "99.9% Uptime", desc: "Reliable service" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-foreground mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-foreground/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-accent to-accent/80">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Browse our products, explore services, or contact our team for a custom quote.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-white/90 font-bold shadow-lg" onClick={() => navigate("/products")}>
              Shop Products
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate("/quotation")}>
              Request Free Quote
            </Button>
          </div>
        </div>
      </section>

      {/* ── Contact Strip ── */}
      <section className="py-8 bg-foreground text-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-white/70">
            <a href="tel:+254111321211" className="flex items-center gap-2 hover:text-white transition-colors">
              <Phone className="w-4 h-4" /> +254 111 321 211
            </a>
            <a href="mailto:cheidaniells@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <Mail className="w-4 h-4" /> cheidaniells@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Roasters, Next to Naivasha Mountain Mall
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
