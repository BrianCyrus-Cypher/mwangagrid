import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import React, { Suspense } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SiteLayout from "./components/SiteLayout";
import { useAuth } from "./_core/hooks/useAuth";
import { Spinner } from "./components/ui/spinner";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { getLoginUrl } from "./const";

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
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));

function PageLoader() {
  return (
    <div className="min-h-[60vh] bg-background flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Spinner className="h-5 w-5" />
        <span>Loading secure area...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <PageLoader />;

  if (!isAuthenticated) {
    const returnTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";

    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-border/70 shadow-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign in required</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Please sign in to continue to this page.
          </p>
          <Button className="w-full" onClick={() => (window.location.href = getLoginUrl(returnTo))}>
            Sign in
          </Button>
        </Card>
      </div>
    );
  }

  if (adminOnly && user?.role !== "admin") {
    return (
      <div className="min-h-[60vh] bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-border/70 shadow-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin access required</h1>
          <p className="text-sm text-muted-foreground mb-6">
            This dashboard is only available to administrator accounts.
          </p>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = getLoginUrl("/admin"))}>
            Switch account
          </Button>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <SiteLayout>
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/products"} component={Products} />
          <Route path={"/services"} component={Services} />
          <Route path={"/cart"} component={Cart} />
          <Route path={"/checkout"}>
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          </Route>
          <Route path={"/quotation"} component={Quotation} />
          <Route path={"/auth"} component={Auth} />
          <Route path={"/forgot-password"} component={ForgotPassword} />
          <Route path={"/reset-password"} component={ResetPassword} />
          <Route path={"/verify-email"} component={VerifyEmail} />
          <Route path={"/account"}>
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          </Route>
          <Route path={"/contact"} component={Contact} />
          <Route path={"/admin"}>
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          </Route>
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </SiteLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
