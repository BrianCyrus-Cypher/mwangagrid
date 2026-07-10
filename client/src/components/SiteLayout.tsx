import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ShoppingCart, LogOut, LogIn, Menu, X, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Spinner } from "@/components/ui/spinner";

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const [, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentReturnTo = `${window.location.pathname}${window.location.search}`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl shadow-sm">
        <div className="container relative py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold text-xs shadow-md">
              MG
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">Mwanga Grid</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8 min-w-0">
            <button onClick={() => navigate("/products")} className="text-foreground/70 hover:text-accent transition">Products</button>
            <button onClick={() => navigate("/services")} className="text-foreground/70 hover:text-accent transition">Services</button>
            <button onClick={() => navigate("/quotation")} className="text-foreground/70 hover:text-accent transition">Get Quote</button>
            <button onClick={() => navigate("/contact")} className="text-foreground/70 hover:text-accent transition">Contact</button>
            {user?.role === "admin" ? (
              <button onClick={() => navigate("/admin")} className="text-foreground/70 hover:text-accent transition font-medium">Admin</button>
            ) : null}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-muted rounded-lg transition text-foreground"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Cart */}
            <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-muted rounded-lg transition text-foreground">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {loading ? (
              <div className="hidden sm:flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground whitespace-nowrap">
                <Spinner />
                Session
              </div>
            ) : isAuthenticated ? (
              <div className="hidden sm:flex items-center gap-3 min-w-0">
                <Button variant="outline" size="sm" onClick={() => navigate("/account")}>
                  {user?.name || "Account"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={() => window.location.href = getLoginUrl(currentReturnTo)}>
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 hover:bg-muted rounded-lg transition text-foreground shrink-0"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu (absolute dropdown to avoid layout shift) */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full z-50 border-b border-border/70 bg-background/95 backdrop-blur-xl">
            <div className="container py-3 space-y-1.5">
              <button
                onClick={() => { navigate("/products"); setMobileMenuOpen(false); }}
                className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
              >
                Products
              </button>
              <button
                onClick={() => { navigate("/services"); setMobileMenuOpen(false); }}
                className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
              >
                Services
              </button>
              <button
                onClick={() => { navigate("/quotation"); setMobileMenuOpen(false); }}
                className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
              >
                Get Quote
              </button>
              <button
                onClick={() => { navigate("/contact"); setMobileMenuOpen(false); }}
                className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
              >
                Contact
              </button>

              {user?.role === "admin" ? (
                <button
                  onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                  className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50 font-medium"
                >
                  Admin
                </button>
              ) : null}

              {isAuthenticated && (
                <>
                  <button
                    onClick={() => { navigate("/account"); setMobileMenuOpen(false); }}
                    className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
                  >
                    My Account
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                      className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="block w-full text-left rounded-md px-3 py-2 text-foreground/70 hover:text-accent hover:bg-muted/50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-slate-950 text-slate-100">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center font-bold text-xs text-white">MG</div>
                <span className="font-bold">Mwanga Grid</span>
              </div>
              <p className="text-slate-300 text-sm">Premium solar equipment, CCTV systems, and high-speed internet solutions for modern Kenya.</p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><button onClick={() => navigate("/products")} className="hover:text-accent transition">Products</button></li>
                <li><button onClick={() => navigate("/services")} className="hover:text-accent transition">Services</button></li>
                <li><button onClick={() => navigate("/quotation")} className="hover:text-accent transition">Get Quote</button></li>
                <li><button onClick={() => navigate("/contact")} className="hover:text-accent transition">Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="mailto:cheidaniells@gmail.com" className="hover:text-accent transition">cheidaniells@gmail.com</a></li>
                <li><a href="tel:+254111321211" className="hover:text-accent transition">+254 111 321 211</a></li>
                <li>P.O Box 8117, Nairobi 00100</li>
                <li>Roasters, Next to Naivasha Mountain Mall</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p><a href="#" className="hover:text-accent transition">Facebook</a></p>
                <p><a href="#" className="hover:text-accent transition">Twitter</a></p>
                <p><a href="#" className="hover:text-accent transition">LinkedIn</a></p>
                <p><a href="https://wa.me/254111321211" className="hover:text-accent transition">WhatsApp</a></p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2026 Mwanga Grid. All rights reserved. Built with AI, owned by you.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
