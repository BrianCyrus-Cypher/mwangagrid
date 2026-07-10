import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Package, FileText, TicketIcon, LogOut, Monitor, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";

function MiniSkeleton() {
  return <div className="h-4 w-full animate-pulse rounded bg-muted/80" />;
}

export default function Account() {
  const { user, logout, isAuthenticated, isDemo } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const protectedQueryOptions = { enabled: isAuthenticated && !isDemo, retry: false };
  const { data: orders } = trpc.orders.list.useQuery(undefined, protectedQueryOptions);
  const { data: quotations } = trpc.quotations.list.useQuery(undefined, protectedQueryOptions);
  const { data: subscriptions } = trpc.subscriptions.list.useQuery(undefined, protectedQueryOptions);
  const { data: tickets } = trpc.supportTickets.list.useQuery(undefined, protectedQueryOptions);
  const { data: sessions } = trpc.auth.sessions.list.useQuery(undefined, protectedQueryOptions);
  const demoOrders = [
    {
      id: 1,
      orderNumber: "ORD-DEMO-1001",
      createdAt: new Date().toISOString(),
      totalAmount: "148500",
      status: "processing",
    },
  ];
  const demoQuotations = [{ id: 1, quotationNumber: "QUOTE-DEMO-210", status: "pending" }];
  const demoSubscriptions = [
    {
      id: 1,
      servicePackageId: 3,
      status: "active",
      renewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21).toISOString(),
    },
  ];
  const demoTickets = [
    {
      id: 1,
      ticketNumber: "TICKET-DEMO-77",
      subject: "Installation scheduling",
      status: "open",
    },
  ];
  const demoSessions = [
    {
      id: 1,
      device: "Client review browser",
      browser: "Demo session",
      ipAddress: "Local",
      lastActivity: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isCurrent: true,
    },
  ];
  const accountOrders = isDemo ? demoOrders : orders;
  const accountQuotations = isDemo ? demoQuotations : quotations;
  const accountSubscriptions = isDemo ? demoSubscriptions : subscriptions;
  const accountTickets = isDemo ? demoTickets : tickets;
  const accountSessions = isDemo ? demoSessions : sessions;
  const isLoading =
    !isDemo && (!user || !orders || !quotations || !subscriptions || !tickets || !sessions);
  const logoutSessionMutation = trpc.auth.sessions.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.sessions.list.invalidate();
    },
  });
  const logoutOthersMutation = trpc.auth.sessions.logoutOthers.useMutation({
    onSuccess: async () => {
      await utils.auth.sessions.list.invalidate();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Please Log In</h2>
          <p className="text-foreground/60 mb-6">You need to log in to view your account</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/70 bg-gradient-to-br from-background via-background to-muted/40">
        <div className="container py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Account</h1>
              <p className="text-foreground/60">Welcome, {user?.name || "User"}</p>
            </div>
            <Button variant="outline" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Profile Info */}
          <Card className="p-8 border-border/70 shadow-md">
            <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
            {isLoading ? (
              <div className="space-y-4">
                <MiniSkeleton />
                <MiniSkeleton />
                <MiniSkeleton />
                <MiniSkeleton />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-foreground/60">Full Name</p>
                  <p className="text-lg font-bold text-foreground">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Email</p>
                  <p className="text-lg font-bold text-foreground">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Phone</p>
                  <p className="text-lg font-bold text-foreground">{user?.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-foreground/60">Member Since</p>
                  <p className="text-lg font-bold text-foreground">
                    {new Date(user?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-6 border-border/70 shadow-md">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-foreground/60">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : accountOrders?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-border/70 shadow-md">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-foreground/60">Quotations</p>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : accountQuotations?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6 border-border/70 shadow-md">
              <div className="flex items-center gap-4">
                <TicketIcon className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-foreground/60">Support Tickets</p>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "..." : accountTickets?.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Orders */}
        <Card className="p-8 mb-8 border-border/70 shadow-md">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Orders</h2>
          {accountOrders && accountOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 text-foreground/60">Order #</th>
                    <th className="text-left py-3 text-foreground/60">Date</th>
                    <th className="text-left py-3 text-foreground/60">Amount</th>
                    <th className="text-left py-3 text-foreground/60">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {accountOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 text-foreground font-bold">{order.orderNumber}</td>
                      <td className="py-3 text-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 text-accent font-bold">KES {order.totalAmount}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          order.status === "delivered" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                          "bg-blue-100 text-blue-700"
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <MiniSkeleton />
              <MiniSkeleton />
              <MiniSkeleton />
            </div>
          ) : (
            <p className="text-foreground/60">No orders yet</p>
          )}
        </Card>

        {/* Subscriptions */}
        <Card className="p-8 mb-8 border-border/70 shadow-md">
          <h2 className="text-2xl font-bold text-foreground mb-6">Active Subscriptions</h2>
          {accountSubscriptions && accountSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accountSubscriptions.map((sub) => (
                <div key={sub.id} className="border border-border/70 rounded-lg p-4 bg-muted/20">
                  <p className="text-sm text-foreground/60">Service Package ID: {sub.servicePackageId}</p>
                  <p className="text-lg font-bold text-foreground mb-2">Status: {sub.status}</p>
                  <p className="text-sm text-foreground/60">
                    Renewal: {new Date(sub.renewalDate || "").toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4 border-border/70"><MiniSkeleton /></Card>
              <Card className="p-4 border-border/70"><MiniSkeleton /></Card>
            </div>
          ) : (
            <p className="text-foreground/60">No active subscriptions</p>
          )}
        </Card>

        {/* Support Tickets */}
        <Card className="p-8 border-border/70 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Support Tickets</h2>
            <Button onClick={() => navigate("/contact")}>New Ticket</Button>
          </div>
          {accountTickets && accountTickets.length > 0 ? (
            <div className="space-y-4">
              {accountTickets.map((ticket) => (
                <div key={ticket.id} className="border border-border/70 rounded-lg p-4 hover:bg-muted/50 bg-background/60">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{ticket.subject}</p>
                      <p className="text-sm text-foreground/60">Ticket #{ticket.ticketNumber}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === "resolved" ? "bg-green-100 text-green-700" :
                      ticket.status === "open" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <MiniSkeleton />
              <MiniSkeleton />
              <MiniSkeleton />
            </div>
          ) : (
            <p className="text-foreground/60">No support tickets</p>
          )}
        </Card>

        <Card className="p-8 mt-8 border-border/70 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <h2 className="text-2xl font-bold text-foreground">Active Sessions</h2>
              </div>
              <p className="text-sm text-foreground/60">Manage devices currently signed in to your account.</p>
            </div>
            <Button variant="outline" onClick={() => logoutOthersMutation.mutate()} disabled={isDemo || logoutOthersMutation.isPending}>
              Logout all other devices
            </Button>
          </div>

          {accountSessions && accountSessions.length > 0 ? (
            <div className="space-y-4">
              {accountSessions.map((session) => (
                <div key={session.id} className="flex flex-col gap-4 rounded-lg border border-border/70 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-accent" />
                      <p className="font-bold text-foreground">{session.device || "Unknown device"}</p>
                      {session.isCurrent ? (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">Current session</span>
                      ) : null}
                    </div>
                    <p className="text-sm text-foreground/60">
                      Browser: {session.browser || "Unknown"} · IP: {session.ipAddress || "Unavailable"}
                    </p>
                    <p className="text-sm text-foreground/60">
                      Last active: {new Date(session.lastActivity || session.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.isCurrent ? (
                      <span className="text-sm text-foreground/50">Use the logout button above to end this session.</span>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => logoutSessionMutation.mutate({ sessionId: session.id })}
                        disabled={isDemo || logoutSessionMutation.isPending}
                      >
                        Logout
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              <MiniSkeleton />
              <MiniSkeleton />
            </div>
          ) : (
            <p className="text-foreground/60">No active sessions found.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
