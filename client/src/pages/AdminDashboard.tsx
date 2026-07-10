import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Package, Users, ShoppingCart, MessageSquare, Download,
  Clock, CheckCircle2, XCircle, AlertCircle, Search, Filter, RefreshCw, FileText,
  Eye, Edit3, Ban, Plus,
} from "lucide-react";
import { useState, useRef } from "react";

type Tab = "overview" | "orders" | "contacts" | "followups" | "analytics" | "products";

const COLORS = ["#E07856", "#1a365d", "#84cc16", "#FDB913", "#6b7280"];

const statusColor = (s: string) => {
  const m: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    new: "bg-blue-100 text-blue-800", read: "bg-gray-100 text-gray-800",
    replied: "bg-green-100 text-green-800", closed: "bg-gray-100 text-gray-500",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };
  return m[s] || "bg-gray-100 text-gray-800";
};

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div className="bg-card p-6 rounded-xl shadow-xl max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground/60 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [tab, setTab] = useState<Tab>("overview");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  const { data: dash } = trpc.admin.dashboard.useQuery(undefined, { enabled: true, retry: false });
  const { data: orders } = trpc.admin.allOrders.useQuery(undefined, { enabled: true, retry: false });
  const { data: contacts } = trpc.contact.list.useQuery(undefined, { enabled: true, retry: false });
  const { data: followUps } = trpc.admin.followUps.list.useQuery(undefined, { enabled: true, retry: false });
  const updateOrderMut = trpc.admin.updateOrderStatus.useMutation();
  const updateContactMut = trpc.contact.updateStatus.useMutation();
  const updateFollowUpMut = trpc.admin.followUps.update.useMutation();
  const createProductMut = trpc.admin.products.create.useMutation();
  const deleteProductMut = trpc.admin.products.delete.useMutation();
  const { data: allProducts } = trpc.admin.products.list.useQuery(undefined, { enabled: true });
  const { refetch: fetchOrdersCSV } = trpc.admin.export.ordersCSV.useQuery(undefined, { enabled: false });
  const { refetch: fetchContactsCSV } = trpc.admin.export.contactsCSV.useQuery(undefined, { enabled: false });

  const dashData = dash || {
    totalRevenue: 0, totalOrders: 0, pendingOrders: 0, completedOrders: 0,
    cancelledOrders: 0, totalUsers: 0, newContacts: 0, recentOrders: [], recentContacts: [],
  };

  const chartData = [
    { month: "Jan", revenue: 15000, orders: 12 },
    { month: "Feb", revenue: 22000, orders: 18 },
    { month: "Mar", revenue: 28000, orders: 25 },
    { month: "Apr", revenue: 35000, orders: 32 },
    { month: "May", revenue: 42000, orders: 38 },
    { month: "Jun", revenue: 48000, orders: 45 },
  ];

  const downloadCSV = (data: string | undefined, filename: string) => {
    if (!data) return;
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const updateOrder = async (orderId: number, status: string) => {
    await updateOrderMut.mutateAsync({ orderId, status: status as any });
    utils.admin.allOrders.invalidate();
    utils.admin.dashboard.invalidate();
  };

  const updateContactStatus = async (id: number, status: string) => {
    await updateContactMut.mutateAsync({ id, status: status as any });
    utils.contact.list.invalidate();
    utils.admin.dashboard.invalidate();
  };
  const updateFollowUpStatus = async (id: number, status: string) => {
    await updateFollowUpMut.mutateAsync({ id, status: status as any });
    utils.admin.followUps.list.invalidate();
  };
  const downloadOrdersCSV = async () => {
    const { data } = await fetchOrdersCSV();
    if (data) downloadCSV(data, "orders.csv");
  };
  const downloadContactsCSV = async () => {
    const { data } = await fetchContactsCSV();
    if (data) downloadCSV(data, "contacts.csv");
  };
  const filteredOrders = (orders || []).filter((o: any) =>
    !search || o.orderNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredContacts = (contacts || []).filter((c: any) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-foreground/60 text-sm">Manage orders, contacts, follow-ups, and analytics</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => utils.admin.dashboard.invalidate()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["overview", "orders", "contacts", "followups", "analytics", "products"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                  tab === t ? "bg-primary text-white" : "bg-muted text-foreground/70 hover:bg-muted/80"
                }`}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8">
        {confirm && (
          <ConfirmDialog
            open
            title={confirm.title}
            message={confirm.message}
            onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
            onCancel={() => setConfirm(null)}
          />
        )}

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Revenue", value: `KES ${dashData.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-primary" },
                { label: "Orders", value: dashData.totalOrders, icon: ShoppingCart, color: "text-blue-600" },
                { label: "Users", value: dashData.totalUsers, icon: Users, color: "text-green-600" },
                { label: "New Messages", value: dashData.newContacts, icon: MessageSquare, color: "text-purple-600" },
              ].map(s => (
                <Card key={s.label} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground/60 mb-1">{s.label}</p>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                    <s.icon className={`w-8 h-8 ${s.color} opacity-20`} />
                  </div>
                </Card>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Orders by Status</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Pending", value: dashData.pendingOrders, color: "bg-yellow-500" },
                    { label: "Delivered", value: dashData.completedOrders, color: "bg-green-500" },
                    { label: "Cancelled", value: dashData.cancelledOrders, color: "bg-red-500" },
                    { label: "Total", value: dashData.totalOrders, color: "bg-primary" },
                  ].map(s => (
                    <div key={s.label} className="p-3 border border-border rounded-lg text-center">
                      <div className={`w-2 h-2 rounded-full ${s.color} mx-auto mb-1`} />
                      <p className="text-lg font-bold text-foreground">{s.value}</p>
                      <p className="text-xs text-foreground/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Revenue Trend</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="month" stroke="var(--foreground)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="var(--foreground)" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="revenue" stroke="#E07856" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Recent Orders</h2>
                {dashData.recentOrders.length === 0 ? (
                  <p className="text-sm text-foreground/60">No orders yet.</p>
                ) : dashData.recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                      <p className="text-xs text-foreground/40">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(o.status)}`}>{o.status}</span>
                      <span className="text-sm font-bold text-primary">KES {Number(o.totalAmount).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </Card>
              <Card className="p-6">
                <h2 className="text-lg font-bold text-foreground mb-4">Recent Contacts</h2>
                {dashData.recentContacts.length === 0 ? (
                  <p className="text-sm text-foreground/60">No messages yet.</p>
                ) : dashData.recentContacts.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-foreground/40">{c.subject}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {tab === "orders" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Order Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <Input placeholder="Search orders..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button size="sm" variant="outline" onClick={downloadOrdersCSV}>
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
              </div>
            </div>
            {filteredOrders.length === 0 ? (
              <p className="text-sm text-foreground/60">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-foreground/60">
                      <th className="text-left py-3 font-medium">Order</th>
                      <th className="text-left py-3 font-medium">Customer</th>
                      <th className="text-left py-3 font-medium">Total</th>
                      <th className="text-left py-3 font-medium">Payment</th>
                      <th className="text-left py-3 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Date</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o: any) => (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{o.orderNumber}</td>
                        <td className="py-3 text-foreground/70">#{o.userId}</td>
                        <td className="py-3 text-primary font-medium">KES {Number(o.totalAmount).toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${statusColor(o.paymentStatus)}`}>{o.paymentStatus}</span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(o.status)}`}>{o.status}</span>
                        </td>
                        <td className="py-3 text-foreground/50 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {["confirmed", "shipped", "delivered"].map(s => (
                              o.status === "pending" && s === "confirmed" || o.status === "confirmed" && s === "shipped" || o.status === "shipped" && s === "delivered" ? (
                                <Button key={s} size="sm" variant="ghost" className="h-8 text-xs"
                                  onClick={() => setConfirm({ title: `Mark as ${s}?`, message: `Update order ${o.orderNumber} to "${s}"`, onConfirm: () => updateOrder(o.id, s) })}>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />{s}
                                </Button>
                              ) : null
                            ))}
                            {o.status !== "cancelled" && o.status !== "delivered" && (
                              <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500"
                                onClick={() => setConfirm({ title: "Cancel Order?", message: `Cancel order ${o.orderNumber}?`, onConfirm: () => updateOrder(o.id, "cancelled") })}>
                                <XCircle className="w-3 h-3 mr-1" />Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {tab === "contacts" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Contact Inquiries</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
                  <Input placeholder="Search contacts..." className="pl-9 w-64" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <Button size="sm" variant="outline" onClick={downloadContactsCSV}>
                  <Download className="w-4 h-4 mr-1" /> CSV
                </Button>
              </div>
            </div>
            {filteredContacts.length === 0 ? (
              <p className="text-sm text-foreground/60">No contacts yet.</p>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((c: any) => (
                  <div key={c.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-foreground">{c.name}</p>
                        <p className="text-xs text-foreground/60">{c.email} {c.phone && `| ${c.phone}`}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.inquiryType && <Badge variant="outline" className="text-xs">{c.inquiryType}</Badge>}
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(c.status)}`}>{c.status}</span>
                        <span className="text-xs text-foreground/40">{new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">{c.subject}</p>
                    <p className="text-sm text-foreground/60 line-clamp-2">{c.message}</p>
                    {c.status === "new" && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs h-8"
                          onClick={() => { updateContactStatus(c.id, "replied"); }}>
                          Mark Replied
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-8 text-red-500"
                          onClick={() => { updateContactStatus(c.id, "closed"); }}>
                          Close
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === "followups" && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Follow-Up Queue</h2>
            {!followUps || followUps.length === 0 ? (
              <p className="text-sm text-foreground/60">No follow-ups pending.</p>
            ) : (
              <div className="space-y-3">
                {followUps.map((f: any) => (
                  <div key={f.id} className="p-4 border border-border rounded-lg flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full ${
                        f.priority === "high" ? "bg-red-500" : f.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{f.type?.replace(/_/g, " ")}</Badge>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(f.status)}`}>{f.status}</span>
                        </div>
                        {f.note && <p className="text-sm text-foreground/70">{f.note}</p>}
                        <p className="text-xs text-foreground/40 mt-1">{new Date(f.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {f.status !== "completed" && (
                      <Button size="sm" variant="outline" className="text-xs h-8"
                        onClick={() => setConfirm({
                          title: "Complete follow-up?",
                          message: "Mark this follow-up as completed.",
                          onConfirm: () => updateFollowUpStatus(f.id, "completed"),
                        })}>
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {tab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--foreground)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--foreground)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="revenue" fill="#E07856" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card className="p-6">
              <h2 className="text-lg font-bold text-foreground mb-4">Monthly Orders</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--foreground)" tick={{ fontSize: 11 }} />
                  <YAxis stroke="var(--foreground)" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Line type="monotone" dataKey="orders" stroke="#1a365d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {tab === "products" && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Product Management</h2>
              <Button size="sm" onClick={() => {
                const name = prompt("Product name:");
                if (!name) return;
                const price = prompt("Price (KES):");
                if (!price) return;
                const cat = prompt("Category (optional):") || undefined;
                createProductMut.mutateAsync({ name, price, category: cat }).then(() => {
                  utils.admin.products.list.invalidate();
                });
              }}>
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
            {!allProducts || allProducts.length === 0 ? (
              <p className="text-sm text-foreground/60">No products yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-foreground/60">
                      <th className="text-left py-3 font-medium">Name</th>
                      <th className="text-left py-3 font-medium">Category</th>
                      <th className="text-left py-3 font-medium">Price</th>
                      <th className="text-left py-3 font-medium">Stock</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts.map((p: any) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{p.name}</td>
                        <td className="py-3 text-foreground/70">{p.category || "-"}</td>
                        <td className="py-3 text-primary font-medium">KES {Number(p.price).toLocaleString()}</td>
                        <td className="py-3 text-foreground/70">{p.stock ?? "-"}</td>
                        <td className="py-3 text-right">
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-red-500"
                            onClick={() => setConfirm({
                              title: "Delete product?",
                              message: `Delete "${p.name}"? This cannot be undone.`,
                              onConfirm: async () => {
                                await deleteProductMut.mutateAsync({ id: p.id });
                                utils.admin.products.list.invalidate();
                              },
                            })}>
                            <XCircle className="w-3 h-3 mr-1" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
