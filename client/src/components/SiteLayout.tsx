import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  ShoppingCart,
  LogOut,
  LogIn,
  Menu,
  X,
  Moon,
  Sun,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { useTheme } from "@/contexts/ThemeContext";
import { useCart } from "@/contexts/CartContext";
import { Spinner } from "@/components/ui/spinner";
import { MwangaLogo } from "@/components/MwangaLogo";

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
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/70 dark:bg-[#0B1426]/60 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] supports-[backdrop-filter]:bg-background/50 dark:supports-[backdrop-filter]:bg-[#0B1426]/45">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-accent/[0.03] pointer-events-none" />
        <div className="container relative py-3 sm:py-4 flex items-center justify-between">
          <div
            className="flex items-center cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <MwangaLogo size="sm" showWordmark={true} />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1 min-w-0">
            <button
              onClick={() => navigate("/products")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 shadow-none hover:shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              Products
            </button>
            <button
              onClick={() => navigate("/services")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 shadow-none hover:shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              Services
            </button>
            <button
              onClick={() => navigate("/quotation")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 shadow-none hover:shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              Get Quote
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-xl hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 shadow-none hover:shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all duration-300"
            >
              Contact
            </button>
            {user?.role === "admin" ? (
              <button
                onClick={() => navigate("/admin")}
                className="relative px-3 py-2 text-sm font-medium text-accent hover:text-accent/80 rounded-xl hover:bg-accent/10 backdrop-blur-sm border border-transparent hover:border-accent/20 shadow-none hover:shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all duration-300"
              >
                Admin
              </button>
            ) : null}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0 min-w-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/15 dark:hover:bg-white/10 rounded-xl backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300 text-foreground"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-foreground" />
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 hover:bg-white/15 dark:hover:bg-white/10 rounded-xl backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300 text-foreground"
            >
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
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <button
                  onClick={() => navigate("/account")}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-white/15 hover:border-white/25 shadow-none hover:shadow-[0_2px_15px_rgba(0,0,0,0.04)] transition-all duration-300"
                >
                  {user?.name || "Account"}
                </button>
                <button
                  onClick={() => logout()}
                  className="p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() =>
                  (window.location.href = getLoginUrl(currentReturnTo))
                }
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl bg-accent/90 text-white hover:bg-accent backdrop-blur-sm border border-accent/30 hover:border-accent/50 shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 hover:bg-white/15 dark:hover:bg-white/10 rounded-xl backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300 text-foreground shrink-0"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile overlay backdrop */}
        {mobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu (absolute dropdown to avoid layout shift) */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute left-0 right-0 top-full z-50 border-b border-white/15 bg-white/15 dark:bg-white/5 backdrop-blur-xl shadow-lg">
            <div className="container py-4 space-y-1">
              <button
                onClick={() => {
                  navigate("/products");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300"
              >
                Products
              </button>
              <button
                onClick={() => {
                  navigate("/services");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300"
              >
                Services
              </button>
              <button
                onClick={() => {
                  navigate("/quotation");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300"
              >
                Get Quote
              </button>
              <button
                onClick={() => {
                  navigate("/contact");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300"
              >
                Contact
              </button>

              <div className="border-t border-white/10 my-2" />

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/account");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/15 transition-all duration-300"
                  >
                    My Account
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-accent hover:text-accent/80 hover:bg-accent/10 backdrop-blur-sm border border-transparent hover:border-accent/20 transition-all duration-300"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 backdrop-blur-sm border border-transparent hover:border-destructive/20 transition-all duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = getLoginUrl(currentReturnTo);
                  }}
                  className="block w-full text-left rounded-xl px-4 py-2.5 text-sm font-semibold bg-accent text-white hover:bg-accent/90 shadow-md shadow-accent/20 backdrop-blur-sm transition-all duration-300 mt-1"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 min-h-[100dvh]">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/70 bg-[#060D1A] text-blue-50">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MwangaLogo size="sm" showWordmark={true} light />
              </div>
              <p className="text-slate-300 text-sm">
                Premium solar equipment, CCTV systems, and high-speed internet
                solutions for modern Kenya.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <button
                    onClick={() => navigate("/products")}
                    className="hover:text-accent transition"
                  >
                    Products
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/services")}
                    className="hover:text-accent transition"
                  >
                    Services
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/quotation")}
                    className="hover:text-accent transition"
                  >
                    Get Quote
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/contact")}
                    className="hover:text-accent transition"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/admin-login")}
                    className="hover:text-accent transition"
                    title="Settings"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact Info</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>
                  <a
                    href="mailto:cheidaniells@gmail.com"
                    className="hover:text-accent transition"
                  >
                    cheidaniells@gmail.com
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+254750110836"
                    className="hover:text-accent transition"
                  >
                    +254 750 110 836
                  </a>
                </li>
                <li>P.O Box 8117, Nairobi 00100</li>
                <li>Roasters, Next to Naivasha Mountain Mall</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Follow Us</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <a href="#" className="hover:text-accent transition">
                    Facebook
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-accent transition">
                    Twitter
                  </a>
                </p>
                <p>
                  <a href="#" className="hover:text-accent transition">
                    LinkedIn
                  </a>
                </p>
                <p>
                  <a
                    href="https://wa.me/254750110836"
                    className="hover:text-accent transition"
                  >
                    WhatsApp
                  </a>
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            <p>
              &copy; 2026 Mwanga Grid. All rights reserved. Built by Cy Tech.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
