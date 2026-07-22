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
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { getLoginUrl } from "./const";
import { PageTransition } from "./components/PageTransition";

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
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-border/70 shadow-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in required
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account or sign in to access this page.
          </p>
          <Button
            className="w-full mb-3"
            onClick={() => (window.location.href = getLoginUrl(returnTo))}
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = getLoginUrl(returnTo))}
          >
            Create Account
          </Button>
        </Card>
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
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-border/70 shadow-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Sign in required
          </h1>
          <Button
            className="w-full"
            onClick={() => (window.location.href = getLoginUrl(location))}
          >
            Sign in
          </Button>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-border/70 shadow-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Admin access required
          </h1>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = getLoginUrl("/admin"))}
          >
            Switch account
          </Button>
        </Card>
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
