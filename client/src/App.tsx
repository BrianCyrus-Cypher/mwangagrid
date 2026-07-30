import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import React, { Suspense, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SiteLayout from "./components/SiteLayout";
import { useAuth } from "./_core/hooks/useAuth";
import { PageLoader } from "./components/ui/page-loader";
import { getLoginUrl } from "./const";
import { PageTransition } from "./components/PageTransition";
import { MwangaLogo } from "./components/MwangaLogo";

const Home = React.lazy(() => import("./pages/Home"));
const Products = React.lazy(() => import("./pages/Products"));
const Services = React.lazy(() => import("./pages/Services"));
const Cart = React.lazy(() => import("./pages/Cart"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Quotation = React.lazy(() => import("./pages/Quotation"));
const Auth = React.lazy(() => import("./pages/Auth"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const Account = React.lazy(() => import("./pages/Account"));
const Contact = React.lazy(() => import("./pages/Contact"));
const FAQ = React.lazy(() => import("./pages/FAQ"));
const Terms = React.lazy(() => import("./pages/Terms"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const Animations = React.lazy(() => import("./pages/Animations"));

const PUBLIC_ROUTES = [
  "/",
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/animations",
  "/404",
  "/admin-login",
];

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(location)) {
    const returnTo = encodeURIComponent(location);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background gradient accents */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-background to-primary/[0.04]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md p-8 text-center rounded-2xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl" />
              <svg
                viewBox="0 0 48 48"
                className="w-16 h-16 drop-shadow-lg relative z-10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="23"
                  style={{ fill: "var(--primary)" }}
                />
                <path
                  d="M30 30a5 5 0 0 1 8 0"
                  style={{ stroke: "var(--accent)" }}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.8"
                />
                <path
                  d="M27 34a8 8 0 0 1 14 0"
                  style={{ stroke: "var(--accent)" }}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.5"
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
                  opacity="0.95"
                >
                  M.G
                </text>
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in required
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account or sign in to access this page.
          </p>
          <button
            className="w-full mb-3 h-10 rounded-xl bg-accent/90 text-white hover:bg-accent font-semibold text-sm backdrop-blur-sm border border-accent/30 hover:border-accent/50 shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300"
            onClick={() => (window.location.href = getLoginUrl(returnTo))}
          >
            Sign In
          </button>
          <button
            className="w-full h-10 rounded-xl bg-white/10 dark:bg-white/5 text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-white/15 hover:border-white/25 font-medium text-sm transition-all duration-300"
            onClick={() => (window.location.href = getLoginUrl(returnTo))}
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-background to-primary/[0.04]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md p-8 text-center rounded-2xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative z-10">
          <div className="flex justify-center mb-6">
            <MwangaLogo size="lg" showWordmark={true} />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in required
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account or sign in to access this page.
          </p>
          <button
            className="w-full h-10 rounded-xl bg-accent/90 text-white hover:bg-accent font-semibold text-sm backdrop-blur-sm border border-accent/30 hover:border-accent/50 shadow-md shadow-accent/15 hover:shadow-lg hover:shadow-accent/25 transition-all duration-300"
            onClick={() => (window.location.href = getLoginUrl(location))}
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.06] via-background to-primary/[0.04]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md p-8 text-center rounded-2xl border border-white/15 bg-white/10 dark:bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] relative z-10">
          <div className="flex justify-center mb-6">
            <MwangaLogo size="lg" showWordmark={true} />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Admin access required
          </h1>
          <button
            className="w-full h-10 rounded-xl bg-white/10 dark:bg-white/5 text-foreground/80 hover:text-foreground hover:bg-white/15 dark:hover:bg-white/10 backdrop-blur-sm border border-white/15 hover:border-white/25 font-medium text-sm transition-all duration-300"
            onClick={() => (window.location.href = getLoginUrl("/admin"))}
          >
            Switch account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={"/admin-login"} component={AdminLogin} />
      <Route>
        <ScrollToTop />
        <SiteLayout>
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <Switch>
                <Route path={"/animations"} component={Animations} />
                <Route path={"/auth"} component={Auth} />
                <Route path={"/forgot-password"} component={ForgotPassword} />
                <Route path={"/reset-password"} component={ResetPassword} />
                <Route path={"/verify-email"} component={VerifyEmail} />
                <Route path={"/404"} component={NotFound} />
                <Route path={"/"} component={Home} />
                <Route path={"/products"}>
                  <RouteGuard>
                    <Products />
                  </RouteGuard>
                </Route>
                <Route path={"/services"}>
                  <RouteGuard>
                    <Services />
                  </RouteGuard>
                </Route>
                <Route path={"/cart"}>
                  <RouteGuard>
                    <Cart />
                  </RouteGuard>
                </Route>
                <Route path={"/checkout"}>
                  <RouteGuard>
                    <Checkout />
                  </RouteGuard>
                </Route>
                <Route path={"/quotation"}>
                  <RouteGuard>
                    <Quotation />
                  </RouteGuard>
                </Route>
                <Route path={"/contact"}>
                  <RouteGuard>
                    <Contact />
                  </RouteGuard>
                </Route>
                <Route path={"/faq"}>
                  <RouteGuard>
                    <FAQ />
                  </RouteGuard>
                </Route>
                <Route path={"/terms"}>
                  <RouteGuard>
                    <Terms />
                  </RouteGuard>
                </Route>
                <Route path={"/privacy"}>
                  <RouteGuard>
                    <Privacy />
                  </RouteGuard>
                </Route>
                <Route path={"/account"}>
                  <RouteGuard>
                    <Account />
                  </RouteGuard>
                </Route>
                <Route path={"/admin"}>
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                </Route>
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </PageTransition>
        </SiteLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster
            richColors
            closeButton
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: "border border-border/70 shadow-lg",
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
