import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Package, FileText, TicketIcon, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Account() {
  const { user, logout, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: orders } = trpc.orders.list.useQuery();
  const { data: quotations } = trpc.quotations.list.useQuery();
  const { data: subscriptions } = trpc.subscriptions.list.useQuery();
  const { data: tickets } = trpc.supportTickets.list.useQuery();

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
      <div className="bg-white border-b border-border">
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
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Profile Information</h2>
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
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Package className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-foreground/60">Total Orders</p>
                  <p className="text-2xl font-bold text-foreground">{orders?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FileText className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-foreground/60">Quotations</p>
                  <p className="text-2xl font-bold text-foreground">{quotations?.length || 0}</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <TicketIcon className="w-8 h-8 text-accent" />
                <div>
                  <p className="text-sm text-foreground/60">Support Tickets</p>
                  <p className="text-2xl font-bold text-foreground">{tickets?.length || 0}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Orders */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Recent Orders</h2>
          {orders && orders.length > 0 ? (
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
                  {orders.map((order) => (
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
          ) : (
            <p className="text-foreground/60">No orders yet</p>
          )}
        </Card>

        {/* Subscriptions */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Active Subscriptions</h2>
          {subscriptions && subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="border border-border rounded-lg p-4">
                  <p className="text-sm text-foreground/60">Service Package ID: {sub.servicePackageId}</p>
                  <p className="text-lg font-bold text-foreground mb-2">Status: {sub.status}</p>
                  <p className="text-sm text-foreground/60">
                    Renewal: {new Date(sub.renewalDate || "").toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-foreground/60">No active subscriptions</p>
          )}
        </Card>

        {/* Support Tickets */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Support Tickets</h2>
            <Button onClick={() => navigate("/contact")}>New Ticket</Button>
          </div>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-border rounded-lg p-4 hover:bg-muted/50">
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
          ) : (
            <p className="text-foreground/60">No support tickets</p>
          )}
        </Card>
      </div>
    </div>
  );
}
