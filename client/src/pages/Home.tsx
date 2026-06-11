import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowRight, Shield, Zap, Users, Star, CheckCircle2 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: products } = trpc.products.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  const featuredProducts = products?.slice(0, 3) || [];
  const testimonials = [
    {
      name: "John Mwangi",
      company: "Tech Solutions Ltd",
      text: "Tunnelnet Technologies provided exceptional CCTV installation service. Professional, reliable, and affordable.",
      rating: 5,
    },
    {
      name: "Sarah Kipchoge",
      company: "Retail Hub Kenya",
      text: "Their internet installation and network setup transformed our business operations. Highly recommended!",
      rating: 5,
    },
    {
      name: "David Omondi",
      company: "Security First",
      text: "Quality products and outstanding customer support. We've been a loyal customer for over 2 years.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TT</span>
            </div>
            <span className="font-bold text-lg text-foreground">Tunnelnet Technologies</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/products")} className="text-sm text-foreground hover:text-accent transition">
              Products
            </button>
            <button onClick={() => navigate("/services")} className="text-sm text-foreground hover:text-accent transition">
              Services
            </button>
            <button onClick={() => navigate("/contact")} className="text-sm text-foreground hover:text-accent transition">
              Contact
            </button>
            {isAuthenticated ? (
              <Button onClick={() => navigate("/account")} variant="outline" size="sm">
                My Account
              </Button>
            ) : (
              <Button onClick={() => navigate("/products")} size="sm">
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/5 py-20 md:py-32">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  Advanced Technology Solutions for Modern Kenya
                </h1>
                <p className="text-lg text-foreground/70">
                  Premium CCTV systems, high-speed internet, and cutting-edge networking products. Trusted by businesses across Kenya.
                </p>
              </div>
              <div className="flex gap-4">
                <Button size="lg" onClick={() => navigate("/products")}>
                  Shop Now <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/services")}>
                  Explore Services
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-2xl font-bold text-accent">5000+</p>
                  <p className="text-sm text-foreground/60">Happy Customers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">10+</p>
                  <p className="text-sm text-foreground/60">Years Experience</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">24/7</p>
                  <p className="text-sm text-foreground/60">Support</p>
                </div>
              </div>
            </div>
            <div className="relative h-96 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Zap className="w-24 h-24 text-accent mx-auto mb-4" />
                <p className="text-foreground/60">Premium Tech Solutions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Tunnelnet Technologies?</h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We deliver excellence through quality products, professional services, and dedicated customer support.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: "Trusted Quality", desc: "Premium products with full warranty and support" },
              { icon: Zap, title: "Fast Installation", desc: "Professional technicians with rapid deployment" },
              { icon: Users, title: "Expert Support", desc: "24/7 customer service and technical assistance" },
            ].map((item, i) => (
              <Card key={i} className="p-8 text-center hover:shadow-lg transition">
                <item.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-foreground/60">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Products</h2>
              <p className="text-foreground/60">Explore our premium technology products</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/products")}>
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/products")}>
                <div className="h-48 bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-16 h-16 text-accent mx-auto" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">{product.name}</h3>
                  <p className="text-sm text-foreground/60 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-accent">KES {product.price}</span>
                    {product.discountPrice && (
                      <span className="text-sm text-foreground/50 line-through">KES {product.discountPrice}</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Our Services</h2>
            <p className="text-foreground/60">Professional installation and support services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services?.map((service) => (
              <Card key={service.id} className="p-8 hover:shadow-lg transition cursor-pointer" onClick={() => navigate("/services")}>
                <h3 className="text-xl font-bold text-foreground mb-2">{service.name}</h3>
                <p className="text-foreground/60 mb-4">{service.description}</p>
                <Button variant="outline" size="sm">
                  Learn More <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Customer Testimonials</h2>
            <p className="text-foreground/60">Trusted by thousands of satisfied customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <Card key={i} className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-foreground/70 mb-6">{testimonial.text}</p>
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-foreground/60">{testimonial.company}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Why Trust Us</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle2, title: "Certified", desc: "ISO 9001 Certified" },
              { icon: Shield, title: "Secure", desc: "Bank-level security" },
              { icon: Users, title: "Experienced", desc: "10+ years in business" },
              { icon: Zap, title: "Reliable", desc: "99.9% uptime guarantee" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <item.icon className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-foreground/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-accent/10 to-accent/5">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-foreground/60 mb-8 max-w-2xl mx-auto">
            Browse our products, explore services, or contact our team for a custom quote.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/products")}>
              Shop Products
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/quotation")}>
              Request Quote
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground/5 border-t border-border py-12">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-foreground mb-4">Tunnelnet Technologies</h3>
              <p className="text-sm text-foreground/60">Premium technology solutions for modern Kenya.</p>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Products</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><button onClick={() => navigate("/products")} className="hover:text-accent transition">Routers</button></li>
                <li><button onClick={() => navigate("/products")} className="hover:text-accent transition">CCTV Cameras</button></li>
                <li><button onClick={() => navigate("/products")} className="hover:text-accent transition">Network Switches</button></li>
                <li><button onClick={() => navigate("/products")} className="hover:text-accent transition">Cables</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li><button onClick={() => navigate("/services")} className="hover:text-accent transition">CCTV Installation</button></li>
                <li><button onClick={() => navigate("/services")} className="hover:text-accent transition">Internet Setup</button></li>
                <li><button onClick={() => navigate("/quotation")} className="hover:text-accent transition">Get Quote</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-foreground/60">
                <li>📞 +254 (0) 123 456 789</li>
                <li>📧 info@tunnelnet.co.ke</li>
                <li>📍 Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-foreground/60">
            <p>&copy; 2026 Tunnelnet Technologies. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <button className="hover:text-accent transition">LinkedIn</button>
              <button className="hover:text-accent transition">Instagram</button>
              <button className="hover:text-accent transition">Twitter</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
