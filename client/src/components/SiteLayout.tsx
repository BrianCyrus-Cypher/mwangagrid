import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ShoppingCart, LogOut, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold">TT</div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">Tunnelnet Technologies</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => navigate("/products")} className="text-foreground/70 hover:text-accent transition">Products</button>
            <button onClick={() => navigate("/services")} className="text-foreground/70 hover:text-accent transition">Services</button>
            <button onClick={() => navigate("/quotation")} className="text-foreground/70 hover:text-accent transition">Get Quote</button>
            <button onClick={() => navigate("/contact")} className="text-foreground/70 hover:text-accent transition">Contact</button>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-muted rounded-lg transition">
              <ShoppingCart className="w-5 h-5 text-foreground" />
            </button>

            {isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3">
                {user?.role === "admin" && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                    Admin
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => navigate("/account")}>
                  {user?.name || "Account"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => window.location.href = getLoginUrl()}>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white">
            <div className="container py-4 space-y-3">
              <button onClick={() => { navigate("/products"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">Products</button>
              <button onClick={() => { navigate("/services"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">Services</button>
              <button onClick={() => { navigate("/quotation"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">Get Quote</button>
              <button onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">Contact</button>
              {isAuthenticated && (
                <>
                  <button onClick={() => { navigate("/account"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">My Account</button>
                  {user?.role === "admin" && (
                    <button onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">Admin Dashboard</button>
                  )}
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 text-foreground/70 hover:text-accent">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-foreground text-white border-t border-border">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">TT</div>
                <span className="font-bold">Tunnelnet Technologies</span>
              </div>
              <p className="text-white/70 text-sm">Premium CCTV systems, high-speed internet, and cutting-edge networking products for modern Kenya.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><button onClick={() => navigate("/products")} className="hover:text-accent transition">Products</button></li>
                <li><button onClick={() => navigate("/services")} className="hover:text-accent transition">Services</button></li>
                <li><button onClick={() => navigate("/quotation")} className="hover:text-accent transition">Get Quote</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-accent transition">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="mailto:support@tunnelnet.co.ke" className="hover:text-accent transition">Email Support</a></li>
                <li><a href="tel:+254123456789" className="hover:text-accent transition">Phone Support</a></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-accent transition">Contact Form</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p><a href="#" className="hover:text-accent transition">Facebook</a></p>
                <p><a href="#" className="hover:text-accent transition">Twitter</a></p>
                <p><a href="#" className="hover:text-accent transition">LinkedIn</a></p>
                <p><a href="https://wa.me/254123456789" className="hover:text-accent transition">WhatsApp</a></p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2026 Tunnelnet Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
