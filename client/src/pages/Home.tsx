import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { Logo } from "@/components/Logo";
import CinematicHero from "@/components/CinematicHero";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";
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
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { useDelayedLoading } from "@/hooks/useDelayedLoading";

const CATEGORIES = [
  {
    label: "Solar Equipment",
    slug: "solar-equipment",
    icon: Sun,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: "CCTV Cameras",
    slug: "cctv-cameras",
    icon: Camera,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    label: "Routers",
    slug: "routers",
    icon: Wifi,
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  {
    label: "Network Switches",
    slug: "network-switches",
    icon: Network,
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
];

const TESTIMONIALS = [
  {
    name: "John Mwangi",
    company: "Tech Solutions Ltd",
    text: "Mwanga Grid provided exceptional CCTV installation service. Professional, reliable, and great value.",
    rating: 5,
  },
  {
    name: "Sarah Kipchoge",
    company: "Retail Hub Kenya",
    text: "Their solar and network setup transformed our business operations completely. Highly recommended!",
    rating: 5,
  },
  {
    name: "David Omondi",
    company: "Security First",
    text: "Quality products and outstanding customer support. We've been a loyal customer for over 2 years.",
    rating: 5,
  },
];

function CategoryIcon({
  icon: Icon,
  color,
  label,
}: {
  icon: any;
  color: string;
  label: string;
}) {
  const [, navigate] = useLocation();
  return (
    <button
      onClick={() => navigate("/products")}
      className={`flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-2xl ${color} hover:scale-105 transition-all duration-300 cursor-pointer border border-transparent hover:border-current/30 card-hover`}
    >
      <Icon className="w-10 h-10" />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );
}

export default function Home() {
  const [, navigate] = useLocation();
  const { data: products, isLoading: productsLoading } =
    trpc.products.featured.useQuery();
  const { data: services, isLoading: servicesLoading } =
    trpc.services.featured.useQuery();
  const { addItem } = useCart();

  const featuredProducts = products || [];
  const showProductsSkeleton = useDelayedLoading(productsLoading, 1000);
  const showServicesSkeleton = useDelayedLoading(servicesLoading, 1000);
  const featuredProductCards = showProductsSkeleton
    ? Array.from({ length: 4 }, (_, index) => ({ id: `loading-${index}` }))
    : featuredProducts;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ── */}
      <CinematicHero />

      {/* ── Categories ── */}
      <section className="py-10 md:py-16 bg-background">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
              Shop by Category
            </h2>
            <p className="text-foreground/60">
              Everything you need for power, security, and connectivity
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <CategoryIcon
                key={cat.slug}
                icon={cat.icon}
                color={cat.color}
                label={cat.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Value Props ── */}
      <section className="py-10 md:py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              Why Choose Mwanga Grid?
            </h2>
            <p className="text-lg text-foreground/65 max-w-2xl mx-auto">
              We deliver excellence through quality products, professional
              services, and dedicated customer support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sun,
                title: "Solar Solutions",
                desc: "Premium solar systems for homes and businesses — from portable generators to whole-home setups.",
                color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
                price: "from KES 18,000",
              },
              {
                icon: Shield,
                title: "CCTV & Security",
                desc: "Professional-grade cameras and 24/7 monitoring for complete peace of mind.",
                color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
                price: "from KES 2,700",
              },
              {
                icon: Network,
                title: "Enterprise Networking",
                desc: "Wi-Fi 6, managed switches, fiber — everything for a fast, reliable network.",
                color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
                price: "from KES 3,500",
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="p-4 sm:p-8 text-center border-0 shadow-md group card-hover"
              >
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${item.color} flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <item.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="font-heading font-bold text-base sm:text-xl text-foreground mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-base text-foreground/60 leading-relaxed mb-3 sm:mb-4">
                  {item.desc}
                </p>
                <span className="text-sm font-bold text-accent">
                  {item.price}
                </span>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="py-10 md:py-24 bg-background">
        <div className="container min-h-[420px]">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-foreground/60">
                Top-selling technology solutions
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/products")}
              className="hidden md:flex"
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProductCards.map((product: any) =>
              productsLoading ? (
                <ProductCardSkeleton key={product.id} />
              ) : (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer group flex flex-col border-border/70 shadow-md bg-card/95 card-hover"
                  onClick={() => navigate("/products")}
                >
                  <div className="relative h-36 sm:h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
                        onError={(e: any) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div className="hidden w-full h-full items-center justify-center text-5xl">
                      📦
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                  </div>
                  <div className="p-3 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-heading font-bold text-sm sm:text-base text-foreground mb-1 sm:mb-2 line-clamp-2 group-hover:text-accent transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-foreground/60 mb-2 sm:mb-4 flex-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base sm:text-lg font-bold text-accent">
                        KES {(product.price || 0).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2">
                        {product.inStock !== false && (
                          <span className="text-[10px] text-green-600 font-medium hidden sm:inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping-subtle" />{" "}
                            In Stock
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-foreground/50 hover:text-accent transition-colors">
                          View <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3 w-full bg-primary text-white hover:bg-primary/90"
                      onClick={e => {
                        e.stopPropagation();
                        addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.imageUrl,
                          category: product.category,
                        });
                      }}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Add to Cart
                    </Button>
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
      <section className="py-10 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Professional Services
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Expert installation and support by certified technicians —
              delivered across Kenya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(showServicesSkeleton
              ? Array.from({ length: 4 }, (_, index) => ({
                  id: `loading-${index}`,
                }))
              : services && services.length > 0
                ? services
                : [
                    {
                      id: 1,
                      name: "CCTV Installation",
                      description:
                        "Professional CCTV camera installation for homes and businesses. Site survey to commissioning handled end-to-end.",
                    },
                    {
                      id: 2,
                      name: "Internet & Network Setup",
                      description:
                        "End-to-end network infrastructure setup including routing, switching, and Wi-Fi optimisation.",
                    },
                    {
                      id: 3,
                      name: "Solar System Installation",
                      description:
                        "Turn-key solar power solutions from site assessment through installation and after-sales support.",
                    },
                    {
                      id: 4,
                      name: "IT Support & Maintenance",
                      description:
                        "Ongoing managed IT support for SMEs — hardware, software, and network troubleshooting.",
                    },
                  ]
            )?.map((service: any) =>
              service.name ? (
                <Card
                  key={service.id}
                  className="p-4 sm:p-8 bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer card-hover"
                  onClick={() => navigate("/services")}
                >
                  <h3 className="text-base sm:text-xl font-heading font-bold text-white mb-2 sm:mb-3">
                    {service.name}
                  </h3>
                  <p className="text-xs sm:text-base text-white/70 mb-3 sm:mb-5 leading-relaxed">
                    {service.description}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Learn More <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Card>
              ) : (
                <Card
                  key={service.id}
                  className="p-8 bg-white/10 border-white/15"
                >
                  <div className="space-y-4">
                    <div className="h-6 w-2/3 animate-shimmer rounded" />
                    <div className="h-4 w-full animate-shimmer rounded" />
                    <div className="h-4 w-5/6 animate-shimmer rounded" />
                    <div className="h-10 w-36 animate-shimmer rounded-lg" />
                  </div>
                </Card>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-10 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm px-3 py-1 rounded-full mb-4">
              <Star className="w-4 h-4 fill-current" /> 4.9 / 5.0
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
              What Our Customers Say
            </h2>
            <p className="text-foreground/60">
              Trusted by 5,000+ happy customers across Kenya
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <Card
                key={i}
                className="p-4 sm:p-8 border-0 shadow-md card-hover"
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star
                      key={j}
                      className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-400 text-blue-400"
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-base text-foreground/70 mb-4 sm:mb-6 leading-relaxed italic">
                  "{t.text}"
                </p>
                <div>
                  <p className="font-bold text-sm sm:text-base text-foreground">
                    {t.name}
                  </p>
                  <p className="text-xs sm:text-sm text-foreground/50">
                    {t.company}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="py-10 md:py-16 bg-muted/40">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Why Customers Trust Us
            </h2>
            <p className="text-foreground/60">
              Real reasons businesses choose Mwanga Grid
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Quality Assured",
                desc: "Genuine products from verified suppliers with warranty",
              },
              {
                icon: Users,
                title: "1,000+ Projects",
                desc: "Completed for homes & businesses since 2015",
              },
              {
                icon: Zap,
                title: "Free Delivery Nairobi",
                desc: "Same-day installation within CBD & suburbs",
              },
              {
                icon: CheckCircle2,
                title: "24/7 After-Sales",
                desc: "Ongoing support & maintenance you can rely on",
              },
            ].map((item, i) => (
              <div key={i} className="text-center p-4 card-hover rounded-xl">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/50">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-blue-600 to-blue-800 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 50%, #1C2B3C 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
            Ready to Power Up?
          </h2>
          <p className="text-lg text-white/75 mb-8 max-w-xl mx-auto">
            Get expert advice, free quotations, and same-day delivery in
            Nairobi.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-blue-700 hover:bg-white/90 font-bold shadow-lg text-base px-8"
              onClick={() => navigate("/products")}
            >
              Shop Products <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 text-base px-8"
              onClick={() => navigate("/quotation")}
            >
              Request Free Quote
            </Button>
            <a
              href="tel:+254750110836"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/10 border border-white/25 text-white hover:bg-white/15 transition text-sm font-medium"
            >
              <Phone className="w-4 h-4" /> Call Now
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact Strip ── */}
      <section className="py-8 bg-muted/80 dark:bg-accent/10 text-foreground border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-sm text-foreground/70">
            <a
              href="tel:+254750110836"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Phone className="w-4 h-4" /> +254 750 110 836
            </a>
            <a
              href="mailto:cheidaniells@gmail.com"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Mail className="w-4 h-4" /> cheidaniells@gmail.com
            </a>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Roasters, Next to Naivasha Mountain
              Mall
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
