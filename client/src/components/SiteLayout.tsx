import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ShoppingCart, LogOut, LogIn, Menu, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")} >
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white font-bold text-sm">MG</div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">Mwanga Grid</span>
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
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Cart */}
            <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-muted rounded-lg transition">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
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
          <div className="md:hidden border-t border-border bg-white dark:bg-slate-950">
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
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center font-bold text-sm">MG</div>
                <span className="font-bold">Mwanga Grid</span>
              </div>
              <p className="text-white/70 text-sm">Premium solar equipment, CCTV systems, and high-speed internet solutions for modern Kenya.</p>
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
              <h3 className="font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="mailto:cheidaniells@gmail.com" className="hover:text-accent transition">cheidaniells@gmail.com</a></li>
                <li><a href="tel:+254111321211" className="hover:text-accent transition">+254 111 321 211</a></li>
                <li>P.O Box 8117, Nairobi 00100</li>
                <li>Roasters, Next to Naivasha Mountain Mall</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p><a href="#" className="hover:text-accent transition">Facebook</a></p>
                <p><a href="#" className="hover:text-accent transition">Twitter</a></p>
                <p><a href="#" className="hover:text-accent transition">LinkedIn</a></p>
                <p><a href="https://wa.me/254111321211" className="hover:text-accent transition">WhatsApp</a></p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2026 Mwanga Grid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
