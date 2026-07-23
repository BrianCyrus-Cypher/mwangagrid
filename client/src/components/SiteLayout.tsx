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
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 dark:bg-background/60 backdrop-blur-2xl shadow-[0_1px_3px_rgba(0,0,0,0.05)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
        <div className="container relative py-3 sm:py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => navigate("/")}
          >
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl translate-y-0.5" />
              <svg
                viewBox="0 0 48 48"
                className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-lg"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <filter id="nHd">
                    <feGaussianBlur stdDeviation="1.2" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="nHdS">
                    <feGaussianBlur stdDeviation="2" result="b" />
                    <feMerge>
                      <feMergeNode in="b" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  cx="24"
                  cy="24"
                  r="23"
                  style={{ fill: "var(--primary)" }}
                />
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  style={{ stroke: "var(--accent)" }}
                  strokeWidth="0.5"
                  opacity="0.12"
                  fill="none"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="21.5"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.05"
                  fill="none"
                  strokeDasharray="1.5 2.5"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20.5"
                  stroke="white"
                  strokeWidth="0.4"
                  opacity="0.06"
                  fill="none"
                />
                <line
                  x1="24"
                  y1="3"
                  x2="24"
                  y2="45"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.035"
                />
                <line
                  x1="3"
                  y1="24"
                  x2="45"
                  y2="24"
                  stroke="white"
                  strokeWidth="0.3"
                  opacity="0.035"
                />
                <path
                  d="M30 30a5 5 0 0 1 8 0"
                  style={{ stroke: "var(--accent)" }}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                  filter="url(#nHd)"
                />
                <path
                  d="M27 34a8 8 0 0 1 14 0"
                  style={{ stroke: "var(--accent)" }}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
                  filter="url(#nHd)"
                />
                <circle
                  cx="16"
                  cy="30"
                  r="4.5"
                  style={{ stroke: "var(--accent)" }}
                  strokeWidth="1"
                  fill="none"
                  opacity="0.55"
                />
                <circle
                  cx="16"
                  cy="30"
                  r="2.5"
                  style={{ fill: "var(--accent)" }}
                  opacity="0.45"
                  filter="url(#nHd)"
                />
                <circle cx="16" cy="30" r="1" fill="white" opacity="0.25" />
                <circle cx="38" cy="16" r="0.8" fill="white" opacity="0.12" />
                <circle cx="40" cy="20" r="0.5" fill="white" opacity="0.08" />
                <circle cx="8" cy="16" r="0.6" fill="white" opacity="0.1" />
                <text
                  x="24"
                  y="25.5"
                  textAnchor="middle"
                  fontFamily="'Sora','Inter',sans-serif"
                  fontWeight="700"
                  fontSize="8"
                  letterSpacing="0.5"
                  style={{ fill: "var(--accent)" }}
                  filter="url(#nHdS)"
                  opacity="0.95"
                >
                  M.G
                </text>
              </svg>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">
              Mwanga Grid
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1 min-w-0">
            <button
              onClick={() => navigate("/products")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
            >
              Products
            </button>
            <button
              onClick={() => navigate("/services")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
            >
              Services
            </button>
            <button
              onClick={() => navigate("/quotation")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
            >
              Get Quote
            </button>
            <button
              onClick={() => navigate("/contact")}
              className="relative px-3 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-lg hover:bg-muted/60 transition-all"
            >
              Contact
            </button>
            {user?.role === "admin" ? (
              <button
                onClick={() => navigate("/admin")}
                className="relative px-3 py-2 text-sm font-medium text-accent hover:text-accent/80 rounded-lg hover:bg-accent/10 transition-all"
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
              className="p-2 hover:bg-muted rounded-lg transition text-foreground"
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
              className="relative p-2 hover:bg-muted rounded-lg transition text-foreground"
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
              <div className="hidden sm:flex items-center gap-3 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/account")}
                >
                  {user?.name || "Account"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() =>
                  (window.location.href = getLoginUrl(currentReturnTo))
                }
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden inline-flex items-center justify-center p-2 hover:bg-muted rounded-lg transition text-foreground shrink-0"
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
          <div className="md:hidden absolute left-0 right-0 top-full z-50 border-b border-border/50 bg-background/95 dark:bg-background/95 backdrop-blur-2xl shadow-lg">
            <div className="container py-4 space-y-1">
              <button
                onClick={() => {
                  navigate("/products");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all"
              >
                Products
              </button>
              <button
                onClick={() => {
                  navigate("/services");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all"
              >
                Services
              </button>
              <button
                onClick={() => {
                  navigate("/quotation");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all"
              >
                Get Quote
              </button>
              <button
                onClick={() => {
                  navigate("/contact");
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all"
              >
                Contact
              </button>

              <div className="border-t border-border/50 my-2" />

              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/account");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-all"
                  >
                    My Account
                  </button>

                  {user?.role === "admin" && (
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-accent hover:text-accent/80 hover:bg-accent/10 transition-all"
                    >
                      Admin Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    window.location.href = getLoginUrl(currentReturnTo);
                  }}
                  className="block w-full text-left rounded-lg px-4 py-2.5 text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-all mt-1"
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
      <footer className="border-t border-border/70 bg-slate-950 text-slate-100">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
                  <svg
                    viewBox="0 0 48 48"
                    className="w-7 h-7"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <filter id="nHdF">
                        <feGaussianBlur stdDeviation="1.2" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="nHdSF">
                        <feGaussianBlur stdDeviation="2" result="b" />
                        <feMerge>
                          <feMergeNode in="b" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle
                      cx="24"
                      cy="24"
                      r="23"
                      style={{ fill: "var(--primary)" }}
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="22"
                      style={{ stroke: "var(--accent)" }}
                      strokeWidth="0.5"
                      opacity="0.12"
                      fill="none"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="21.5"
                      stroke="white"
                      strokeWidth="0.3"
                      opacity="0.05"
                      fill="none"
                      strokeDasharray="1.5 2.5"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20.5"
                      stroke="white"
                      strokeWidth="0.4"
                      opacity="0.06"
                      fill="none"
                    />
                    <path
                      d="M30 30a5 5 0 0 1 8 0"
                      style={{ stroke: "var(--accent)" }}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.7"
                      filter="url(#nHdF)"
                    />
                    <path
                      d="M27 34a8 8 0 0 1 14 0"
                      style={{ stroke: "var(--accent)" }}
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      fill="none"
                      opacity="0.4"
                      filter="url(#nHdF)"
                    />
                    <circle
                      cx="16"
                      cy="30"
                      r="4.5"
                      style={{ stroke: "var(--accent)" }}
                      strokeWidth="1"
                      fill="none"
                      opacity="0.5"
                    />
                    <circle
                      cx="16"
                      cy="30"
                      r="2.5"
                      style={{ fill: "var(--accent)" }}
                      opacity="0.4"
                      filter="url(#nHdF)"
                    />
                    <circle cx="16" cy="30" r="1" fill="white" opacity="0.25" />
                    <text
                      x="24"
                      y="25.5"
                      textAnchor="middle"
                      fontFamily="'Sora','Inter',sans-serif"
                      fontWeight="700"
                      fontSize="8"
                      letterSpacing="0.5"
                      style={{ fill: "var(--accent)" }}
                      filter="url(#nHdSF)"
                      opacity="0.9"
                    >
                      M.G
                    </text>
                    <circle
                      cx="38"
                      cy="16"
                      r="0.8"
                      fill="white"
                      opacity="0.1"
                    />
                    <circle
                      cx="8"
                      cy="16"
                      r="0.6"
                      fill="white"
                      opacity="0.08"
                    />
                  </svg>
                </div>
                <span className="font-bold">Mwanga Grid</span>
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
