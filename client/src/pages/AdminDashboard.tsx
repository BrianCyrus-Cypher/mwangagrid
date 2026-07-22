import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Package,
  Users,
  ShoppingCart,
  MessageSquare,
  Download,
  AlertCircle,
  Search,
  Edit3,
  Ban,
  Plus,
  Layers,
  DollarSign,
  BarChart3,
  Wrench,
  ImagePlus,
  Trash2,
  GripVertical,
  Loader2,
  FileText,
  Star,
  Bell,
  BellRing,
  LogOut,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { toast } from "sonner";
import { DatePickerWithRange } from "@/components/ui/DatePickerWithRange";
import { useIsMobile } from "@/hooks/useMobile";

type Tab =
  | "overview"
  | "orders"
  | "contacts"
  | "followups"
  | "analytics"
  | "products"
  | "services"
  | "export"
  | "notifications"
  | "sessions";
type Period = "daily" | "weekly" | "monthly" | "yearly";

const COLORS = [
  "#E07856",
  "#1a365d",
  "#84cc16",
  "#FDB913",
  "#6b7280",
  "#8b5cf6",
];

const statusColor = (s: string) => {
  const m: Record<string, string> = {
    pending:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    confirmed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "en-route":
      "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    shipped:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    delivered:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    new: "bg-blue-100 text-blue-800",
    read: "bg-gray-100 text-gray-800",
    replied: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-500",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
  };
  return m[s] || "bg-gray-100 text-gray-800";
};

function ConfirmDialog({ open, title, message, onConfirm, onCancel }: any) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-foreground/60 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

function ModalForm({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const isMobile = useIsMobile();
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 px-0 pb-0 pt-0 sm:items-start sm:justify-center sm:px-4 sm:pb-8 sm:pt-16 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`w-full overflow-hidden bg-card border border-border shadow-2xl ${isMobile ? "max-h-[92dvh] rounded-t-3xl" : "max-w-lg rounded-xl"}`}
        onClick={e => e.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between border-b border-border ${isMobile ? "px-4 py-3" : "px-6 py-4"}`}
        >
          <div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            {isMobile && (
              <p className="text-[11px] text-foreground/50 mt-0.5">
                Tap outside to close
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-foreground text-xl leading-none"
          >
            &times;
          </button>
        </div>
        <div
          className={`${isMobile ? "max-h-[calc(92dvh-64px)] overflow-y-auto px-4 py-4" : "px-6 py-6"}`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function downloadCSV(csv: string, name: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<Tab>("overview");
  const dashQuery = trpc.admin.dashboard.useQuery();
  const ordersQuery = trpc.admin.allOrders.useQuery();
  const contactsQuery = trpc.contact.list.useQuery();
  const productsQuery = trpc.admin.products.list.useQuery();
  const servicesQuery = trpc.services.withPackages.useQuery();
  const utils = trpc.useUtils();

  const [analyticsPeriod, setAnalyticsPeriod] = useState<Period>("monthly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const analyticsQuery = trpc.admin.analytics.useQuery({
    period: analyticsPeriod,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const plQuery = trpc.admin.profitLoss.useQuery({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [sessionPage, setSessionPage] = useState(0);
  const [expandedExport, setExpandedExport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const newOrdersCountQuery = trpc.admin.newOrdersCount.useQuery(undefined, {
    refetchInterval: 15_000,
  });
  const lastOrderTimeQuery = trpc.admin.lastOrderTime.useQuery(undefined, {
    refetchInterval: 15_000,
  });

  // ── Product CRUD ──
  const [productForm, setProductForm] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const createProductMut = trpc.admin.products.create.useMutation();
  const updateProductMut = trpc.admin.products.update.useMutation();
  const deleteProductMut = trpc.admin.products.delete.useMutation();
  const toggleProductFeaturedMut =
    trpc.admin.products.toggleFeatured.useMutation();

  // ── Service CRUD ──
  const [serviceForm, setServiceForm] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [servicePackages, setServicePackages] = useState<any[]>([]);
  const [packageForm, setPackageForm] = useState<any>(null);
  const createServiceMut = trpc.admin.services.create.useMutation();
  const updateServiceMut = trpc.admin.services.update.useMutation();
  const deleteServiceMut = trpc.admin.services.delete.useMutation();
  const toggleServiceFeaturedMut =
    trpc.admin.services.toggleFeatured.useMutation();
  const createPackageMut = trpc.admin.services.packages.create.useMutation();
  const updatePackageMut = trpc.admin.services.packages.update.useMutation();
  const deletePackageMut = trpc.admin.services.packages.delete.useMutation();
  const updateOrderStatusMut = trpc.admin.updateOrderStatus.useMutation();
  const updateOrderPaymentMut =
    trpc.admin.updateOrderPaymentStatus.useMutation();
  const packagesQuery = trpc.admin.services.packages.list.useQuery(
    { serviceId: editingService?.id ?? 0 },
    { enabled: !!editingService?.id }
  );
  const sessionsQuery = trpc.admin.sessions.list.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const sessionsCountQuery = trpc.admin.sessions.count.useQuery(undefined, {
    refetchInterval: 30_000,
  });
  const logoutAllSessionsMut = trpc.admin.sessions.logoutAll.useMutation();
  const logoutSessionMut = trpc.admin.sessions.logout.useMutation();
  const resendVerificationMut =
    trpc.auth.requestEmailVerification.useMutation();

  const playNotificationSound = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.setValueAtTime(660, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}
  };

  const sendBrowserNotification = (title: string, body: string) => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(p => {
        if (p === "granted")
          new Notification(title, { body, icon: "/favicon.ico" });
      });
    }
  };

  useEffect(() => {
    if (packagesQuery.data) setServicePackages(packagesQuery.data);
  }, [packagesQuery.data]);

  useEffect(() => {
    if (newOrdersCountQuery.data !== undefined) {
      if (lastOrderCount > 0 && newOrdersCountQuery.data > lastOrderCount) {
        const diff = newOrdersCountQuery.data - lastOrderCount;
        toast.success(`${diff} new order${diff > 1 ? "s" : ""} received`, {
          duration: 6000,
        });
        playNotificationSound();
        sendBrowserNotification(
          "New Order",
          `${diff} new order${diff > 1 ? "s" : ""} received on Mwanga Grid`
        );
        ordersQuery.refetch();
      }
      setLastOrderCount(newOrdersCountQuery.data);
    }
  }, [newOrdersCountQuery.data]);

  const refresh = () => {
    utils.admin.dashboard.invalidate();
    utils.admin.allOrders.invalidate();
    utils.admin.products.list.invalidate();
    utils.admin.services.list.invalidate();
    utils.contact.list.invalidate();
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload/single", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch {
      toast.error("Image upload failed");
      return "";
    }
  };

  // ── Analytics Charts ──
  const chartData = analyticsQuery.data?.series ?? [];
  const summary = analyticsQuery.data?.summary;
  const plData = plQuery.data;

  // ── Stats Cards ──
  const stats = useMemo(() => {
    const d = dashQuery.data;
    if (!d) return [];
    return [
      {
        label: "Revenue",
        value: `KES ${(d.totalRevenue ?? 0).toLocaleString()}`,
        icon: TrendingUp,
        color: "text-emerald-500",
      },
      {
        label: "Orders",
        value: d.totalOrders ?? 0,
        icon: ShoppingCart,
        color: "text-blue-500",
      },
      {
        label: "Users",
        value: d.totalUsers ?? 0,
        icon: Users,
        color: "text-purple-500",
      },
      {
        label: "Messages",
        value: d.newContacts ?? 0,
        icon: MessageSquare,
        color: "text-amber-500",
      },
    ];
  }, [dashQuery.data]);

  const statusOptions = [
    "pending",
    "confirmed",
    "en-route",
    "shipped",
    "delivered",
    "cancelled",
  ] as const;

  // ── Tab Navigation (mobile responsive) ──
  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "contacts", label: "Contacts", icon: MessageSquare },
    { key: "followups", label: "Follow-ups", icon: AlertCircle },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "sessions", label: "Sessions", icon: Globe },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "products", label: "Products", icon: Package },
    { key: "services", label: "Services", icon: Wrench },
    { key: "export", label: "Export", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Verification banner */}
      {user && !(user as any).emailVerified && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 text-sm text-amber-700 dark:text-amber-300">
          <span>
            Please verify your email address. Check your inbox for a
            verification link.
          </span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
            disabled={resendVerificationMut.isPending}
            onClick={async () => {
              try {
                await resendVerificationMut.mutateAsync();
                toast.success("Verification email sent!");
              } catch {
                toast.error("Failed to send verification email");
              }
            }}
          >
            {resendVerificationMut.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : null}
            Resend
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-background via-accent/5 to-background">
        <div className="container py-5 md:py-7">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-heading font-bold text-foreground bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-foreground/40 mt-1">
                Manage your store, orders, and analytics
              </p>
            </div>
            <button
              onClick={() => setTab("notifications")}
              className="relative p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all"
            >
              <Bell className="w-5 h-5 text-foreground/60" />
              {(newOrdersCountQuery.data ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-accent text-white text-[10px] font-bold rounded-full ring-2 ring-background animate-pulse">
                  {newOrdersCountQuery.data}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs with glass effect */}
      <div className="border-b border-border bg-muted/20 backdrop-blur-sm sticky top-0 z-40">
        <div className="container py-3">
          {isMobile ? (
            <div className="grid grid-cols-3 gap-1.5">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setSessionPage(0);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl text-[10px] font-medium transition-all ${
                    tab === t.key
                      ? "bg-gradient-to-b from-accent to-accent/80 text-white shadow-lg shadow-accent/20 scale-[1.02]"
                      : "text-foreground/40 hover:text-foreground hover:bg-white/5 active:scale-95"
                  }`}
                >
                  <t.icon className="w-4 h-4" />
                  {t.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setSessionPage(0);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    tab === t.key
                      ? "bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg shadow-accent/20 scale-105"
                      : "text-foreground/50 hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="container py-5 md:py-8">
        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Premium stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {stats.map((s, i) => (
                <Card
                  key={s.label}
                  className="relative p-4 md:p-5 card-hover overflow-hidden group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative flex items-start justify-between">
                    <div>
                      <p className="text-[11px] md:text-xs text-foreground/40 uppercase tracking-wider font-medium">
                        {s.label}
                      </p>
                      <p className="text-xl md:text-3xl font-bold text-foreground mt-1.5 font-heading">
                        {typeof s.value === "number"
                          ? s.value.toLocaleString()
                          : s.value}
                      </p>
                    </div>
                    <div
                      className={`p-2.5 rounded-xl ${s.color.replace("text-", "bg-").replace("500", "500/10")}`}
                    >
                      <s.icon className={`w-5 h-5 md:w-6 md:h-6 ${s.color}`} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Revenue chart */}
            <Card className="p-4 md:p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-sm md:text-base">
                  Revenue Trend
                </h3>
                <span className="text-[10px] text-foreground/30 uppercase tracking-wider">
                  Monthly
                </span>
              </div>
              <div className="h-48 md:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      chartData.length > 0
                        ? chartData
                        : [{ label: "Jan", revenue: 0 }]
                    }
                  >
                    <defs>
                      <linearGradient
                        id="revenueGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#E07856"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#E07856"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#E07856"
                      fill="url(#revenueGrad)"
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Order quick stats */}
            {dashQuery.data && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  {
                    label: "Pending Orders",
                    value: dashQuery.data.pendingOrders,
                    color: "text-amber-500",
                    bg: "bg-amber-500/5",
                  },
                  {
                    label: "Delivered",
                    value: dashQuery.data.completedOrders,
                    color: "text-emerald-500",
                    bg: "bg-emerald-500/5",
                  },
                  {
                    label: "Cancelled",
                    value: dashQuery.data.cancelledOrders,
                    color: "text-red-500",
                    bg: "bg-red-500/5",
                  },
                  {
                    label: "New Messages",
                    value: dashQuery.data.newContacts,
                    color: "text-blue-500",
                    bg: "bg-blue-500/5",
                  },
                ].map((item, i) => (
                  <Card key={item.label} className={`p-4 ${item.bg} border-0`}>
                    <p className="text-xs text-foreground/50">{item.label}</p>
                    <p
                      className={`text-xl font-bold mt-1 font-heading ${item.color}`}
                    >
                      {item.value}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <OrdersTab
            ordersQuery={ordersQuery}
            statusColor={statusColor}
            statusOptions={statusOptions}
            updateOrderPaymentMut={updateOrderPaymentMut}
            updateOrderStatusMut={updateOrderStatusMut}
            utils={utils}
          />
        )}

        {/* ── CONTACTS ── */}
        {tab === "contacts" && <ContactsTab contactsQuery={contactsQuery} />}

        {/* ── FOLLOW-UPS ── */}
        {tab === "followups" && <FollowupsTab />}

        {/* ── NOTIFICATIONS ── */}
        {tab === "notifications" && (
          <NotificationsTab
            ordersQuery={ordersQuery}
            statusColor={statusColor}
          />
        )}

        {/* ── SESSIONS ── */}
        {tab === "sessions" && (
          <Card className="p-4 md:p-6 card-hover">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                <div>
                  <h3 className="font-bold text-foreground text-sm md:text-base">
                    Active Sessions
                  </h3>
                  <p className="text-xs text-foreground/40 mt-0.5">
                    Manage all currently active user sessions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-semibold">
                  <Users className="w-4 h-4" />
                  {sessionsCountQuery.data ?? 0} active
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-1.5"
                  onClick={async () => {
                    setConfirmDialog({
                      open: true,
                      title: "Logout All Sessions",
                      message:
                        "This will sign out all users across all devices. Continue?",
                      onConfirm: async () => {
                        await logoutAllSessionsMut.mutateAsync();
                        sessionsQuery.refetch();
                        sessionsCountQuery.refetch();
                        toast.success("All sessions terminated");
                      },
                      onCancel: () => setConfirmDialog(null),
                    });
                  }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout All
                </Button>
              </div>
            </div>
            {isMobile ? (
              <div className="space-y-3">
                {(sessionsQuery.data ?? [])
                  .slice(sessionPage * 5, (sessionPage + 1) * 5)
                  .map((s: any) => (
                    <div
                      key={s.id}
                      className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-semibold">
                          User #{s.userId}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 h-6 text-[10px] px-2"
                          onClick={async () => {
                            await logoutSessionMut.mutateAsync({
                              sessionId: s.id,
                            });
                            sessionsQuery.refetch();
                            sessionsCountQuery.refetch();
                            toast.success("Session terminated");
                          }}
                        >
                          Terminate
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-foreground/70">
                        <span className="text-foreground/40">Device</span>
                        <span className="truncate">{s.device || "—"}</span>
                        <span className="text-foreground/40">Browser</span>
                        <span className="truncate">{s.browser || "—"}</span>
                        <span className="text-foreground/40">IP</span>
                        <span className="font-mono text-[10px]">
                          {s.ipAddress || "—"}
                        </span>
                        <span className="text-foreground/40">Last Active</span>
                        <span className="text-[10px] text-foreground/40">
                          {new Date(s.lastActivity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                {(sessionsQuery.data ?? []).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                    No active sessions
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs md:text-sm">
                  <thead>
                    <tr className="bg-muted/30 text-left text-foreground/50">
                      <th className="p-3 font-medium">User ID</th>
                      <th className="p-3 font-medium">Device</th>
                      <th className="p-3 font-medium">Browser</th>
                      <th className="p-3 font-medium">IP</th>
                      <th className="p-3 font-medium">Last Active</th>
                      <th className="p-3 font-medium">Created</th>
                      <th className="p-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sessionsQuery.data ?? [])
                      .slice(sessionPage * 5, (sessionPage + 1) * 5)
                      .map((s: any) => (
                        <tr
                          key={s.id}
                          className="border-t border-border/30 hover:bg-muted/10 transition-colors"
                        >
                          <td className="p-3 font-mono text-xs">#{s.userId}</td>
                          <td className="p-3 text-foreground/60 max-w-[120px] truncate">
                            {s.device || "—"}
                          </td>
                          <td className="p-3 text-foreground/60 max-w-[120px] truncate">
                            {s.browser || "—"}
                          </td>
                          <td className="p-3 font-mono text-[10px] text-foreground/40">
                            {s.ipAddress || "—"}
                          </td>
                          <td className="p-3 text-foreground/40 text-[10px]">
                            {new Date(s.lastActivity).toLocaleString()}
                          </td>
                          <td className="p-3 text-foreground/40 text-[10px]">
                            {new Date(s.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 h-7 text-[10px]"
                              onClick={async () => {
                                await logoutSessionMut.mutateAsync({
                                  sessionId: s.id,
                                });
                                sessionsQuery.refetch();
                                sessionsCountQuery.refetch();
                                toast.success("Session terminated");
                              }}
                            >
                              Terminate
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
            {(sessionsQuery.data ?? []).length > 5 && (
              <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-border/30">
                <p className="text-[10px] text-foreground/40">
                  {(sessionsQuery.data ?? []).length} total sessions
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setSessionPage(p => Math.max(0, p - 1))}
                    disabled={sessionPage === 0}
                    className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Prev
                  </button>
                  <span className="text-[10px] text-foreground/40 px-1 self-center">
                    {sessionPage + 1} /{" "}
                    {Math.ceil((sessionsQuery.data ?? []).length / 5)}
                  </span>
                  <button
                    onClick={() => setSessionPage(p => p + 1)}
                    disabled={
                      (sessionPage + 1) * 5 >= (sessionsQuery.data ?? []).length
                    }
                    className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* ── ANALYTICS ── */}
        {tab === "analytics" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-4 md:p-6 card-hover">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
                <div>
                  <h3 className="font-bold text-foreground text-sm md:text-base">
                    Analytics
                  </h3>
                  <p className="text-[10px] text-foreground/30 uppercase tracking-wider mt-0.5">
                    {analyticsPeriod} overview
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(["daily", "weekly", "monthly", "yearly"] as Period[]).map(
                    p => (
                      <button
                        key={p}
                        onClick={() => setAnalyticsPeriod(p)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          analyticsPeriod === p
                            ? "bg-accent text-white shadow-sm"
                            : "bg-muted/50 text-foreground/50 hover:text-foreground hover:bg-muted"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
                <div className="ml-auto">
                  <DatePickerWithRange
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                  />
                </div>
              </div>

              {/* Summary Cards */}
              {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    {
                      label: "Revenue",
                      value: `KES ${summary.totalRevenue.toLocaleString()}`,
                      color: "text-accent",
                    },
                    {
                      label: "Orders",
                      value: summary.totalOrders,
                      color: "text-blue-500",
                    },
                    {
                      label: "Delivered",
                      value: summary.deliveredOrders,
                      color: "text-emerald-500",
                    },
                    {
                      label: "Profit (est.)",
                      value: `KES ${summary.profit.toLocaleString()}`,
                      color: "text-purple-500",
                    },
                  ].map((item, i) => (
                    <Card
                      key={item.label}
                      className="p-3.5 bg-gradient-to-br from-background to-muted/30 border-0 shadow-sm"
                    >
                      <p className="text-[10px] text-foreground/40 uppercase tracking-wider font-medium">
                        {item.label}
                      </p>
                      <p
                        className={`text-base md:text-xl font-bold mt-1 font-heading ${item.color}`}
                      >
                        {item.value}
                      </p>
                    </Card>
                  ))}
                </div>
              )}

              {/* Chart */}
              <div className="h-48 md:h-72 rounded-xl bg-muted/10 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      strokeOpacity={0.4}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card)",
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      fill="#E07856"
                      name="Revenue"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="orders"
                      fill="#1a365d"
                      name="Orders"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Profit & Loss */}
            {plData && (
              <Card className="p-4 md:p-6 card-hover">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground text-sm md:text-base">
                    Profit & Loss Statement
                  </h3>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-xs md:text-sm">
                    <tbody>
                      {[
                        {
                          label: "Total Revenue (Delivered)",
                          value: `KES ${plData.totalRevenue.toLocaleString()}`,
                          color: "text-green-600",
                        },
                        {
                          label: "Orders Delivered",
                          value: plData.totalDelivered,
                          color: "",
                        },
                        {
                          label: "COGS (est. 60%)",
                          value: `- KES ${plData.cogs.toLocaleString()}`,
                          color: "text-red-500",
                        },
                        {
                          label: "Gross Profit",
                          value: `KES ${plData.grossProfit.toLocaleString()} (${plData.grossMargin}%)`,
                          color: "text-emerald-600",
                          bold: true,
                        },
                        {
                          label: "Operational Costs (est. 25%)",
                          value: `- KES ${plData.operationalCosts.toLocaleString()}`,
                          color: "text-red-500",
                        },
                      ].map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/50 last:border-0"
                        >
                          <td
                            className={`p-3 ${r.bold ? "font-semibold" : "text-foreground/70"}`}
                          >
                            {r.label}
                          </td>
                          <td
                            className={`p-3 text-right font-medium ${r.color}`}
                          >
                            {r.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/10">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground text-sm">
                      Net Profit
                    </span>
                    <span
                      className={`text-xl font-bold font-heading ${plData.netProfit >= 0 ? "text-emerald-500" : "text-red-500"}`}
                    >
                      KES {plData.netProfit.toLocaleString()} (
                      {plData.netMargin}%)
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-foreground/30 mt-3">
                  * Estimated margins. Actual COGS and operational costs may
                  vary.
                </p>
              </Card>
            )}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === "products" && (
          <ProductsTab
            productsQuery={productsQuery}
            createProductMut={createProductMut}
            updateProductMut={updateProductMut}
            deleteProductMut={deleteProductMut}
            toggleProductFeaturedMut={toggleProductFeaturedMut}
            setConfirmDialog={setConfirmDialog as any}
          />
        )}

        {/* ── SERVICES ── */}
        {tab === "services" && (
          <ServicesTab
            servicesQuery={servicesQuery}
            createServiceMut={createServiceMut}
            updateServiceMut={updateServiceMut}
            deleteServiceMut={deleteServiceMut}
            toggleServiceFeaturedMut={toggleServiceFeaturedMut}
            createPackageMut={createPackageMut}
            updatePackageMut={updatePackageMut}
            deletePackageMut={deletePackageMut}
            packagesQuery={packagesQuery}
            editingService={editingService}
            setEditingService={setEditingService}
            setConfirmDialog={setConfirmDialog as any}
          />
        )}

        {/* ── EXPORT ── */}
        {tab === "export" && <ExportTab />}
      </div>

      <ConfirmDialog {...confirmDialog} />
    </div>
  );

  // ── Orders Tab ──
  function OrdersTab({
    ordersQuery,
    statusColor,
    statusOptions,
    updateOrderPaymentMut,
    updateOrderStatusMut,
    utils,
  }: any) {
    const isMobile = useIsMobile();
    const [searchTerm, setSearchTerm] = useState("");
    const [orderPage, setOrderPage] = useState(0);
    const perPage = 5;
    const orders = ordersQuery.data ?? [];
    const filtered = orders.filter(
      (o: any) =>
        !searchTerm ||
        o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(orderPage, totalPages - 1);
    const paginated = filtered.slice(
      safePage * perPage,
      (safePage + 1) * perPage
    );

    return (
      <Card className="p-4 md:p-6 card-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-foreground text-sm md:text-base">
              All Orders
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">
              {orders.length} total orders
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <Input
              name="searchOrders"
              placeholder="Search orders..."
              className="pl-9 text-sm bg-muted/50 border-0 focus:bg-background transition-all"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setOrderPage(0);
              }}
            />
          </div>
        </div>
        {isMobile ? (
          <div className="space-y-3">
            {paginated.map((o: any) => (
              <div
                key={o.id}
                className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-accent">
                    {o.orderNumber}
                  </span>
                  <Badge className={`${statusColor(o.status)} text-[10px]`}>
                    {o.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-foreground/70 mb-2">
                  <span className="text-foreground/40">Client</span>
                  <span className="font-medium truncate">
                    {o.clientName || o.clientEmail || "—"}
                  </span>
                  <span className="text-foreground/40">Phone</span>
                  <span className="text-foreground/60">
                    {o.clientPhone || "—"}
                  </span>
                  <span className="text-foreground/40">Total</span>
                  <span className="font-semibold text-accent">
                    KES {parseFloat(o.totalAmount).toLocaleString()}
                  </span>
                  <span className="text-foreground/40">Payment</span>
                  <span className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                        o.paymentStatus === "completed"
                          ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                          : o.paymentStatus === "failed"
                            ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                            : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                    {o.paymentStatus === "pending" && (
                      <button
                        onClick={async () => {
                          try {
                            await updateOrderPaymentMut.mutateAsync({
                              orderId: o.id,
                              paymentStatus: "completed",
                            });
                            utils.admin.allOrders.invalidate();
                            ordersQuery.refetch();
                            toast.success("Payment confirmed");
                          } catch (e: any) {
                            toast.error(
                              e?.message || "Failed to confirm payment"
                            );
                          }
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-medium transition-all"
                      >
                        Confirm
                      </button>
                    )}
                    {o.paymentStatus === "completed" && (
                      <button
                        onClick={async () => {
                          try {
                            await updateOrderPaymentMut.mutateAsync({
                              orderId: o.id,
                              paymentStatus: "failed",
                            });
                            utils.admin.allOrders.invalidate();
                            ordersQuery.refetch();
                            toast.success("Payment unconfirmed");
                          } catch (e: any) {
                            toast.error(
                              e?.message || "Failed to update payment"
                            );
                          }
                        }}
                        className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition-all"
                      >
                        Unconfirm
                      </button>
                    )}
                  </span>
                  <span className="text-foreground/40">Date</span>
                  <span className="text-foreground/40">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1 border-t border-border/30">
                  {statusOptions.map((s: string) => (
                    <button
                      key={s}
                      onClick={async () => {
                        try {
                          await updateOrderStatusMut.mutateAsync({
                            orderId: o.id,
                            status: s,
                          });
                          utils.admin.allOrders.invalidate();
                          ordersQuery.refetch();
                          toast.success(`Order ${s}`);
                        } catch (e: any) {
                          toast.error(e?.message || "Failed to update status");
                        }
                      }}
                      className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                        o.status === s
                          ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                          : "text-foreground/30 hover:text-foreground/60 hover:bg-muted/50"
                      }`}
                    >
                      {(
                        {
                          pending: "Pen",
                          confirmed: "Con",
                          "en-route": "Enr",
                          shipped: "Shp",
                          delivered: "Del",
                          cancelled: "Can",
                        } as Record<string, string>
                      )[s] || s.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                No orders found
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-muted/30 text-left text-foreground/50">
                  <th className="p-3 font-medium">Order</th>
                  <th className="p-3 font-medium">Client</th>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium">Total</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Payment</th>
                  <th className="p-3 font-medium">Ref</th>
                  <th className="p-3 font-medium">Location</th>
                  <th className="p-3 font-medium">Delivery</th>
                  <th className="p-3 font-medium">Date</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((o: any) => (
                  <tr
                    key={o.id}
                    className="border-t border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs font-medium">
                      {o.orderNumber}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {o.clientName || "—"}
                        </span>
                        <span className="text-[10px] text-foreground/40">
                          {o.clientEmail || ""}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-foreground/60">
                      {o.clientPhone || "—"}
                    </td>
                    <td className="p-3 font-semibold text-accent whitespace-nowrap">
                      KES {parseFloat(o.totalAmount).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <Badge className={`${statusColor(o.status)} text-[10px]`}>
                        {o.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            o.paymentStatus === "completed"
                              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                              : o.paymentStatus === "failed"
                                ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                                : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                        {o.paymentStatus === "pending" && (
                          <button
                            onClick={async () => {
                              try {
                                await updateOrderPaymentMut.mutateAsync({
                                  orderId: o.id,
                                  paymentStatus: "completed",
                                });
                                utils.admin.allOrders.invalidate();
                                ordersQuery.refetch();
                                toast.success("Payment confirmed");
                              } catch (e: any) {
                                toast.error(
                                  e?.message || "Failed to confirm payment"
                                );
                              }
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-medium transition-all"
                          >
                            Confirm
                          </button>
                        )}
                        {o.paymentStatus === "completed" && (
                          <button
                            onClick={async () => {
                              try {
                                await updateOrderPaymentMut.mutateAsync({
                                  orderId: o.id,
                                  paymentStatus: "failed",
                                });
                                utils.admin.allOrders.invalidate();
                                ordersQuery.refetch();
                                toast.success("Payment unconfirmed");
                              } catch (e: any) {
                                toast.error(
                                  e?.message || "Failed to update payment"
                                );
                              }
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 font-medium transition-all"
                          >
                            Unconfirm
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-foreground/40 max-w-[80px] truncate">
                      {o.paymentReference || "—"}
                    </td>
                    <td
                      className="p-3 text-foreground/60 max-w-[100px] truncate"
                      title={o.deliveryLocation || ""}
                    >
                      {o.deliveryLocation
                        ? o.deliveryLocation.slice(0, 30)
                        : "—"}
                    </td>
                    <td className="p-3 text-foreground/60 text-[10px]">
                      {o.estimatedDelivery
                        ? new Date(o.estimatedDelivery).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-3 text-foreground/40 text-[10px] whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleDateString()}{" "}
                      {new Date(o.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {statusOptions.map((s: string) => (
                          <button
                            key={s}
                            onClick={async () => {
                              try {
                                await updateOrderStatusMut.mutateAsync({
                                  orderId: o.id,
                                  status: s,
                                });
                                utils.admin.allOrders.invalidate();
                                ordersQuery.refetch();
                                toast.success(`Order ${s}`);
                              } catch (e: any) {
                                toast.error(
                                  e?.message || "Failed to update status"
                                );
                              }
                            }}
                            className={`text-[10px] px-2 py-1 rounded-md font-medium transition-all ${
                              o.status === s
                                ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                                : "text-foreground/30 hover:text-foreground/60 hover:bg-muted/50"
                            }`}
                          >
                            {(
                              {
                                pending: "Pen",
                                confirmed: "Con",
                                "en-route": "Enr",
                                shipped: "Shp",
                                delivered: "Del",
                                cancelled: "Can",
                              } as Record<string, string>
                            )[s] || s.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-border/30">
            <span className="text-[10px] text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setOrderPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => setOrderPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // ── Contacts Tab ──
  function ContactsTab({ contactsQuery }: any) {
    const isMobile = useIsMobile();
    const [searchC, setSearchC] = useState("");
    const [contactsPage, setContactsPage] = useState(0);
    const perPage = 5;
    const contacts = contactsQuery.data ?? [];
    const filtered = contacts.filter(
      (c: any) =>
        !searchC ||
        c.name?.toLowerCase().includes(searchC.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchC.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchC.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(contactsPage, totalPages - 1);
    const paginated = filtered.slice(
      safePage * perPage,
      (safePage + 1) * perPage
    );
    return (
      <Card className="p-4 md:p-6 card-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-foreground text-sm md:text-base">
              Contact Inquiries
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">
              {contacts.length} total
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <Input
              name="searchContacts"
              placeholder="Search..."
              className="pl-9 text-xs bg-muted/50 border-0 focus:bg-background"
              value={searchC}
              onChange={e => {
                setSearchC(e.target.value);
                setContactsPage(0);
              }}
            />
          </div>
        </div>
        {isMobile ? (
          <div className="space-y-3">
            {paginated.map((c: any) => (
              <div
                key={c.id}
                className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-semibold text-sm leading-5">
                    {c.name}
                  </span>
                  <Badge className={`${statusColor(c.status)} text-[10px]`}>
                    {c.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-foreground/60 mb-1.5">
                  {c.email}
                </p>
                {c.phone && (
                  <p className="text-[11px] text-foreground/50 mb-1.5">
                    {c.phone}
                  </p>
                )}
                <p className="text-xs text-foreground/70 mb-1.5 line-clamp-2">
                  {c.subject}
                </p>
                <div className="flex items-center justify-between text-[10px]">
                  <Badge className="text-[10px] bg-accent/10 text-accent">
                    {c.inquiryType}
                  </Badge>
                  <span className="text-foreground/40">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                No contacts found
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-muted/30 text-left text-foreground/50">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Phone</th>
                  <th className="p-3 font-medium">Subject</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Status</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((c: any) => (
                  <tr
                    key={c.id}
                    className="border-t border-border/30 hover:bg-muted/10 transition-colors"
                  >
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-foreground/60">{c.email}</td>
                    <td className="p-3 text-foreground/50">{c.phone || "—"}</td>
                    <td className="p-3 max-w-[160px] truncate">{c.subject}</td>
                    <td className="p-3">
                      <Badge className="text-[10px] bg-accent/10 text-accent">
                        {c.inquiryType}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={`${statusColor(c.status)} text-[10px]`}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-foreground/40 text-[10px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-border/30">
            <span className="text-[10px] text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setContactsPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => setContactsPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // ── Follow-ups Tab ──
  function FollowupsTab() {
    const isMobile = useIsMobile();
    const followupsQuery = trpc.admin.followUps.list.useQuery();
    const replyMut = trpc.admin.followUps.reply.useMutation();
    const [searchF, setSearchF] = useState("");
    const [followupPage, setFollowupPage] = useState(0);
    const [expandedFup, setExpandedFup] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");
    const perPage = 5;
    const fups = followupsQuery.data ?? [];
    const filtered = fups.filter(
      (f: any) =>
        !searchF ||
        f.note?.toLowerCase().includes(searchF.toLowerCase()) ||
        f.contactName?.toLowerCase().includes(searchF.toLowerCase()) ||
        f.contactMessage?.toLowerCase().includes(searchF.toLowerCase()) ||
        f.contactEmail?.toLowerCase().includes(searchF.toLowerCase()) ||
        f.contactSubject?.toLowerCase().includes(searchF.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const safePage = Math.min(followupPage, totalPages - 1);
    const paginated = filtered.slice(
      safePage * perPage,
      (safePage + 1) * perPage
    );
    const handleReply = async (fupId: number) => {
      if (!replyText.trim()) return;
      try {
        await replyMut.mutateAsync({
          followUpId: fupId,
          message: replyText.trim(),
        });
        toast.success("Reply sent to user");
        setReplyText("");
        followupsQuery.refetch();
      } catch (e: any) {
        toast.error(e?.message || "Failed to send reply");
      }
    };
    const parseThread = (f: any) => {
      const messages: { role: string; text: string; time?: string }[] = [];
      if (f.contactMessage) {
        messages.push({
          role: "user",
          text: f.contactMessage,
          time: f.createdAt,
        });
      }
      if (f.note) {
        const parts = f.note.split(/\s*\|\s*/);
        for (const part of parts) {
          const adminMatch = part.match(/^\[Admin replied:\s*(.+)\]$/);
          if (adminMatch) {
            messages.push({ role: "admin", text: adminMatch[1] });
          } else if (!f.contactMessage || !part.startsWith("New ")) {
            messages.push({ role: "admin", text: part });
          }
        }
      }
      return messages;
    };
    const sourceLabel = (f: any) => {
      if (f.contactSubject) return f.contactSubject;
      if (f.type === "new_quotation")
        return `Quotation ${f.quotationId ? `#${f.quotationId}` : ""}`;
      if (f.type === "new_order")
        return `Order ${f.orderId ? `#${f.orderId}` : ""}`;
      return f.type;
    };
    return (
      <Card className="p-4 md:p-6 card-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-foreground text-sm md:text-base">
              Follow-ups
            </h3>
            <p className="text-xs text-foreground/40 mt-0.5">
              {fups.length} items
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <Input
              name="searchFollowups"
              placeholder="Search..."
              className="pl-9 text-xs bg-muted/50 border-0 focus:bg-background"
              value={searchF}
              onChange={e => {
                setSearchF(e.target.value);
                setFollowupPage(0);
              }}
            />
          </div>
        </div>
        {isMobile ? (
          <div className="space-y-3">
            {paginated.map((f: any) => {
              const thread = parseThread(f);
              const isExpanded = expandedFup === f.id;
              return (
                <div
                  key={f.id}
                  className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm leading-5 truncate">
                        {f.contactName || "User"}
                      </span>
                      {f.contactPhone && (
                        <span className="text-[10px] text-foreground/40 whitespace-nowrap">
                          {f.contactPhone}
                        </span>
                      )}
                    </div>
                    <Badge
                      className={`${statusColor(f.status)} text-[10px] shrink-0`}
                    >
                      {f.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-foreground/40 mb-1.5">
                    {sourceLabel(f)} · {f.type}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      className={`text-[10px] ${f.priority === "high" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"}`}
                    >
                      {f.priority}
                    </Badge>
                    <span className="text-[10px] text-foreground/40">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {!isExpanded && thread.length > 0 && (
                    <p className="text-xs text-foreground/70 mb-2 line-clamp-2">
                      {thread[thread.length - 1].text}
                    </p>
                  )}
                  {isExpanded && (
                    <div className="mb-3 space-y-2 max-h-60 overflow-y-auto">
                      {thread.map((m: any, i: number) => (
                        <div
                          key={i}
                          className={`rounded-lg p-2 text-xs ${m.role === "user" ? "bg-muted/50 text-foreground/80" : "bg-accent/10 text-accent/90 ml-4"}`}
                        >
                          <span className="font-medium text-[10px] block mb-0.5">
                            {m.role === "user"
                              ? f.contactName || "User"
                              : "Admin"}
                          </span>
                          {m.text}
                        </div>
                      ))}
                      {thread.length === 0 && (
                        <p className="text-xs text-foreground/40 italic">
                          No messages yet
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setExpandedFup(isExpanded ? null : f.id)}
                      className="text-[10px] px-2 py-1 rounded-md bg-muted/50 text-foreground/60 hover:bg-muted/80 font-medium transition-all"
                    >
                      {isExpanded ? "Collapse" : `Thread (${thread.length})`}
                    </button>
                    <button
                      onClick={() => {
                        setExpandedFup(f.id);
                        setReplyText("");
                      }}
                      className="text-[10px] px-2 py-1 rounded-md bg-accent/10 text-accent hover:bg-accent/20 font-medium transition-all"
                    >
                      Reply
                    </button>
                  </div>
                  {expandedFup === f.id && (
                    <div className="mt-2 flex gap-2">
                      <Input
                        name={`reply-${f.id}`}
                        placeholder="Type your reply..."
                        className="text-xs bg-muted/50 border-0"
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && replyText.trim())
                            handleReply(f.id);
                        }}
                      />
                      <Button
                        size="sm"
                        className="text-xs"
                        onClick={() => handleReply(f.id)}
                        disabled={!replyText.trim() || replyMut.isPending}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                No follow-ups found
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((f: any) => {
              const thread = parseThread(f);
              const isExpanded = expandedFup === f.id;
              return (
                <div
                  key={f.id}
                  className={`rounded-xl border transition-all ${isExpanded ? "border-accent/30 bg-accent/5" : "border-border/60 bg-card hover:bg-muted/10"}`}
                >
                  <div
                    className="p-3 flex items-center gap-3 cursor-pointer"
                    onClick={() => setExpandedFup(isExpanded ? null : f.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">
                          {f.contactName || "User"}
                        </span>
                        {f.contactPhone && (
                          <span className="text-[10px] text-foreground/40">
                            {f.contactPhone}
                          </span>
                        )}
                        <Badge
                          className={`text-[10px] ${f.priority === "high" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600"}`}
                        >
                          {f.priority}
                        </Badge>
                        <Badge
                          className={`${statusColor(f.status)} text-[10px]`}
                        >
                          {f.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-foreground/40">
                        <span>{sourceLabel(f)}</span>
                        <span>·</span>
                        <span>{f.type}</span>
                        <span>·</span>
                        <span>
                          {new Date(f.createdAt).toLocaleDateString()}
                        </span>
                        <span>·</span>
                        <span>
                          {thread.length} message
                          {thread.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 border-t border-border/30 pt-2">
                      <div className="space-y-2 max-h-60 overflow-y-auto mb-3">
                        {thread.map((m: any, i: number) => (
                          <div
                            key={i}
                            className={`rounded-lg p-2.5 text-xs ${m.role === "user" ? "bg-muted/50 text-foreground/80" : "bg-accent/10 text-accent/90 ml-6"}`}
                          >
                            <span className="font-medium text-[10px] block mb-0.5">
                              {m.role === "user"
                                ? f.contactName || "User"
                                : "Admin"}
                            </span>
                            {m.text}
                          </div>
                        ))}
                        {thread.length === 0 && (
                          <p className="text-xs text-foreground/40 italic">
                            No messages yet
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          name={`reply-${f.id}`}
                          placeholder="Type your reply..."
                          className="text-xs bg-muted/50 border-0 flex-1"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === "Enter" && replyText.trim())
                              handleReply(f.id);
                          }}
                        />
                        <Button
                          size="sm"
                          className="text-xs"
                          onClick={() => handleReply(f.id)}
                          disabled={!replyText.trim() || replyMut.isPending}
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                No follow-ups found
              </div>
            )}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-border/30">
            <span className="text-[10px] text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setFollowupPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => setFollowupPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // ── Export Tab ──
  function ExportTab() {
    const fullReportQuery = trpc.admin.export.fullReport.useQuery({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    const ordersCSVQuery = trpc.admin.export.ordersCSV.useQuery();
    const contactsCSVQuery = trpc.admin.export.contactsCSV.useQuery();
    const [exp, setExp] = useState<string | null>(null);

    const handleExport = (type: string) => {
      setExp(type);
      if (type === "full" && fullReportQuery.data)
        downloadCSV(
          fullReportQuery.data,
          `mwanga_full_report_${new Date().toISOString().slice(0, 10)}.csv`
        );
      if (type === "orders" && ordersCSVQuery.data)
        downloadCSV(
          ordersCSVQuery.data,
          `mwanga_orders_${new Date().toISOString().slice(0, 10)}.csv`
        );
      if (type === "contacts" && contactsCSVQuery.data)
        downloadCSV(
          contactsCSVQuery.data,
          `mwanga_contacts_${new Date().toISOString().slice(0, 10)}.csv`
        );
      setTimeout(() => setExp(null), 2000);
    };

    return (
      <div className="space-y-6">
        <Card className="p-4 md:p-6 card-hover">
          <div className="flex items-center gap-2 mb-6">
            <Download className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-foreground text-sm md:text-base">
              Export Data
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                type: "full",
                icon: FileText,
                color: "text-accent",
                bg: "bg-accent/5",
                title: "Full Report",
                desc: "Orders + totals + profit/loss",
              },
              {
                type: "orders",
                icon: ShoppingCart,
                color: "text-blue-500",
                bg: "bg-blue-500/5",
                title: "Orders Only",
                desc: "All orders with client details",
              },
              {
                type: "contacts",
                icon: MessageSquare,
                color: "text-green-500",
                bg: "bg-green-500/5",
                title: "Contacts",
                desc: "All contact inquiries",
              },
            ].map(({ type, icon: Icon, color, bg, title, desc }) => (
              <div
                key={type}
                className={`${bg} rounded-xl p-5 card-hover border border-border/50`}
              >
                <Icon className={`w-8 h-8 ${color} mb-3`} />
                <h4 className="font-bold text-foreground text-sm">{title}</h4>
                <p className="text-xs text-foreground/50 mb-4">{desc}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => handleExport(type)}
                  disabled={exp === type}
                >
                  {exp === type ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />{" "}
                      Downloading...
                    </>
                  ) : (
                    "Download CSV"
                  )}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 md:p-6 card-hover">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-foreground text-sm md:text-base">
              Analytics Export
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["daily", "weekly", "monthly", "yearly"] as Period[]).map(p => (
              <Button
                key={p}
                size="sm"
                variant="outline"
                onClick={async () => {
                  setExp(`analytics-${p}`);
                  const data: any = await (utils.admin.analytics as any).fetch({
                    period: p,
                    dateFrom: dateFrom || undefined,
                    dateTo: dateTo || undefined,
                  });
                  if (data?.series) {
                    const header = "Period,Revenue,Orders,Delivered,Cancelled";
                    const rows = data.series
                      .map(
                        (s: any) =>
                          `${s.label},${s.revenue},${s.orders},${s.delivered},${s.cancelled}`
                      )
                      .join("\n");
                    const csv = `--- MWANGA GRID ANALYTICS (${p}) ---\n${dateFrom ? `Date Range: ${dateFrom} to ${dateTo}\n` : ""}\n${header}\n${rows}\n\nSummary\nTotal Revenue,${data.summary?.totalRevenue ?? 0}\nTotal Orders,${data.summary?.totalOrders ?? 0}\nProfit (est),${data.summary?.profit ?? 0}`;
                    downloadCSV(
                      csv,
                      `mwanga_analytics_${p}_${new Date().toISOString().slice(0, 10)}.csv`
                    );
                  }
                  setExp(null);
                }}
                disabled={exp === `analytics-${p}`}
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                {exp === `analytics-${p}` ? "..." : p} CSV
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  // ── Notifications Tab ──
  function NotificationsTab({ ordersQuery, statusColor: sc }: any) {
    const [searchN, setSearchN] = useState("");
    const [notifPage, setNotifPage] = useState(0);
    const perPage = 5;
    const orders = ordersQuery.data ?? [];
    const filtered = orders.filter(
      (o: any) =>
        !searchN ||
        o.orderNumber?.toLowerCase().includes(searchN.toLowerCase()) ||
        o.clientName?.toLowerCase().includes(searchN.toLowerCase())
    );
    const totalSteps = [
      "pending",
      "confirmed",
      "en-route",
      "shipped",
      "delivered",
    ];
    const sorted = filtered.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
    const safePage = Math.min(notifPage, totalPages - 1);
    const paginated = sorted.slice(
      safePage * perPage,
      (safePage + 1) * perPage
    );

    return (
      <Card className="p-4 md:p-6 card-hover">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-accent" />
            <div>
              <h3 className="font-bold text-foreground text-sm md:text-base">
                Order Notifications
              </h3>
              <p className="text-xs text-foreground/40 mt-0.5">
                Track order status — from placement to delivery
              </p>
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
            <Input
              name="searchNotifications"
              placeholder="Search by order or client..."
              className="pl-9 text-xs bg-muted/50 border-0 focus:bg-background"
              value={searchN}
              onChange={e => {
                setSearchN(e.target.value);
                setNotifPage(0);
              }}
            />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-foreground/30">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map((o: any) => {
              const stepIndex = totalSteps.indexOf(o.status);
              return (
                <Card
                  key={o.id}
                  className="p-4 border border-border/50 hover:border-accent/20 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-accent">
                        {o.orderNumber}
                      </span>
                      <Badge className={`${sc(o.status)} text-[10px]`}>
                        {o.status}
                      </Badge>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          o.paymentStatus === "completed"
                            ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                            : o.paymentStatus === "failed"
                              ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                              : "text-amber-600 bg-amber-50 dark:bg-amber-900/20"
                        }`}
                      >
                        {o.paymentStatus}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-foreground/40">
                      <span>{o.clientName || o.clientEmail}</span>
                      <span>
                        KES {parseFloat(o.totalAmount).toLocaleString()}
                      </span>
                      <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Progress stepper */}
                  <div className="flex items-center gap-0.5 mt-2">
                    {totalSteps.map((step, i) => {
                      const isCurrent = i === stepIndex;
                      const isPast = i <= stepIndex;
                      const isCancelled = o.status === "cancelled";
                      return (
                        <Fragment key={step}>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
                                isCancelled
                                  ? "bg-red-100 text-red-500 dark:bg-red-900/20"
                                  : isPast
                                    ? "bg-accent text-white"
                                    : "bg-muted/50 text-foreground/20"
                              }`}
                            >
                              {isCancelled && step === "pending"
                                ? "✕"
                                : isPast && i < totalSteps.length - 1
                                  ? "✓"
                                  : step === o.status
                                    ? "●"
                                    : ""}
                            </div>
                            <span
                              className={`text-[9px] font-medium whitespace-nowrap ${
                                isCancelled
                                  ? "text-red-400"
                                  : isPast
                                    ? "text-foreground/70"
                                    : "text-foreground/20"
                              }`}
                            >
                              {step === "en-route"
                                ? "En Route"
                                : step[0].toUpperCase() + step.slice(1)}
                            </span>
                          </div>
                          {i < totalSteps.length - 1 && (
                            <div
                              className={`flex-1 h-[2px] mx-1 rounded-full ${
                                isCancelled
                                  ? "bg-red-200"
                                  : i < stepIndex
                                    ? "bg-accent/60"
                                    : "bg-muted/30"
                              }`}
                            />
                          )}
                        </Fragment>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2 mt-2 border-t border-border/30">
            <span className="text-[10px] text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setNotifPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => setNotifPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  }
}

// ── Products Tab ──
function ProductsTab({
  productsQuery,
  createProductMut,
  updateProductMut,
  deleteProductMut,
  toggleProductFeaturedMut,
  setConfirmDialog,
}: any) {
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "solar-equipment",
    images: [] as string[],
    stock: 0,
    sku: "",
    warranty: "",
    specifications: "",
  });
  const [uploading, setUploading] = useState(false);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [searchP, setSearchP] = useState("");
  const [productPage, setProductPage] = useState(0);
  const perPage = 5;

  useEffect(() => {
    if (productsQuery.data) setProducts(productsQuery.data);
  }, [productsQuery.data]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "solar-equipment",
      images: [],
      stock: 0,
      sku: "",
      warranty: "",
      specifications: "",
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    try {
      if (editId) {
        await updateProductMut.mutateAsync({
          id: editId,
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          images: form.images.length > 0 ? form.images : undefined,
          stock: form.stock,
          discountPrice: form.discountPrice || undefined,
          sku: form.sku || undefined,
          warranty: form.warranty || undefined,
          specifications: form.specifications || undefined,
        });
        toast.success("Product updated");
      } else {
        await createProductMut.mutateAsync({
          name: form.name,
          description: form.description,
          price: form.price,
          category: form.category,
          images: form.images.length > 0 ? form.images : undefined,
          stock: form.stock,
          discountPrice: form.discountPrice || undefined,
          sku: form.sku || undefined,
          warranty: form.warranty || undefined,
          specifications: form.specifications || undefined,
        });
        toast.success("Product created");
      }
      resetForm();
      productsQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProductMut.mutateAsync({ id });
      toast.success("Product deleted");
      productsQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const handleMultiImageUpload = async (files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return (data.urls || []).map((u: any) => u.url);
    } catch {
      toast.error("Image upload failed");
      return [];
    }
  };

  const handleMultiImgUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const urls = await handleMultiImageUpload(Array.from(files));
    if (urls.length > 0)
      setForm(f => ({ ...f, images: [...f.images, ...urls] }));
    setUploading(false);
    if (multiInputRef.current) multiInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleEdit = (p: any) => {
    let imgs: string[] = [];
    if (p.images && Array.isArray(p.images)) imgs = p.images;
    else if (p.image) {
      try {
        const parsed = JSON.parse(p.image);
        if (Array.isArray(parsed)) imgs = parsed;
        else imgs = [p.image];
      } catch {
        imgs = [p.image];
      }
    }
    setForm({
      name: p.name,
      description: p.description || "",
      price: String(p.price),
      discountPrice: p.discountPrice ? String(p.discountPrice) : "",
      category: p.category || "solar-equipment",
      images: imgs,
      stock: p.stock || 0,
      sku: p.sku || "",
      warranty: p.warranty || "",
      specifications: p.specifications || "",
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const filtered = products.filter(
    (p: any) =>
      !searchP || p.name?.toLowerCase().includes(searchP.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(productPage, totalPages - 1);
  const paginated = filtered.slice(
    safePage * perPage,
    (safePage + 1) * perPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="font-bold text-foreground text-sm md:text-base">
          Products ({products.length})
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            name="searchProducts"
            placeholder="Search..."
            className="text-xs w-full sm:w-48"
            value={searchP}
            onChange={e => {
              setSearchP(e.target.value);
              setProductPage(0);
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <ModalForm
        open={showForm}
        title={editId ? "Edit Product" : "Add Product"}
        onClose={() => setShowForm(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Name *
            </label>
            <Input
              name="productName"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Description
            </label>
            <textarea
              name="productDescription"
              value={form.description}
              onChange={e =>
                setForm(f => ({ ...f, description: e.target.value }))
              }
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Price (KES) *
              </label>
              <Input
                name="productPrice"
                type="number"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Discount Price
              </label>
              <Input
                name="productDiscountPrice"
                type="number"
                value={form.discountPrice}
                onChange={e =>
                  setForm(f => ({ ...f, discountPrice: e.target.value }))
                }
                className="text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                SKU
              </label>
              <Input
                name="productSku"
                value={form.sku}
                onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Warranty
              </label>
              <Input
                name="productWarranty"
                value={form.warranty}
                onChange={e =>
                  setForm(f => ({ ...f, warranty: e.target.value }))
                }
                className="text-sm"
                placeholder="e.g. 2 years"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Stock
            </label>
            <Input
              name="productStock"
              type="number"
              value={form.stock}
              onChange={e =>
                setForm(f => ({ ...f, stock: parseInt(e.target.value) || 0 }))
              }
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Category
            </label>
            <select
              name="productCategory"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="solar-equipment">Solar Equipment</option>
              <option value="cctv-cameras">CCTV Cameras</option>
              <option value="routers">Routers</option>
              <option value="network-switches">Network Switches</option>
              <option value="cables">Cables</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Photos (1–5)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url}
                    alt={`Photo ${idx + 1}`}
                    className="w-16 h-16 rounded-lg object-cover border border-border"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.images.length < 5 && (
                <button
                  onClick={() => multiInputRef.current?.click()}
                  disabled={uploading}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-border hover:border-accent/50 flex items-center justify-center text-foreground/40 hover:text-accent transition-colors"
                >
                  {uploading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-accent border-t-transparent rounded-full" />
                  ) : (
                    <ImagePlus className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
            <input
              ref={multiInputRef}
              name="productPhotos"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleMultiImgUpload}
            />
            <p className="text-[10px] text-foreground/40">
              {form.images.length}/5 photos
            </p>
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Specifications (JSON)
            </label>
            <textarea
              name="productSpecifications"
              value={form.specifications}
              onChange={e =>
                setForm(f => ({ ...f, specifications: e.target.value }))
              }
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm min-h-16 resize-y focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono text-xs"
              placeholder='{"Key": "Value"}'
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:flex-1"
              onClick={handleSubmit}
              disabled={
                createProductMut.isPending || updateProductMut.isPending
              }
            >
              {editId ? "Update" : "Create"} Product
            </Button>
          </div>
        </div>
      </ModalForm>

      <div className="rounded-xl border border-border/60 bg-card/70 p-2 sm:p-0 sm:bg-transparent sm:border-border">
        {isMobile ? (
          <div className="space-y-3">
            {paginated.map((p: any) => {
              let img = "";
              if (p.images && Array.isArray(p.images) && p.images.length > 0)
                img = p.images[0];
              else if (p.image) {
                try {
                  const parsed = JSON.parse(p.image);
                  img = Array.isArray(parsed) ? parsed[0] : p.image;
                } catch {
                  img = p.image;
                }
              }
              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    {img ? (
                      <img
                        src={img}
                        alt=""
                        className="w-14 h-14 rounded-lg object-cover bg-muted shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-foreground/30" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm leading-5">
                            {p.name}
                          </p>
                          <p className="mt-1 text-[11px] text-foreground/50">
                            {p.category}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await toggleProductFeaturedMut.mutateAsync({
                                id: p.id,
                              });
                              productsQuery.refetch();
                              toast.success(
                                p.featured ? "Unfeatured" : "Featured"
                              );
                            } catch (e: any) {
                              toast.error(e?.message || "Failed");
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${p.featured ? "text-amber-400 hover:text-amber-500" : "text-foreground/20 hover:text-foreground/40"}`}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={p.featured ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-foreground/70">
                        <span className="font-semibold">
                          KES {parseFloat(p.price).toLocaleString()}
                        </span>
                        <span
                          className={`font-medium ${p.stock > 0 ? "text-emerald-600" : "text-red-400"}`}
                        >
                          {p.stock ?? 0} stock
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEdit(p)}
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              title: "Delete Product",
                              message: `Delete "${p.name}"?`,
                              onConfirm: () => {
                                handleDelete(p.id);
                                setConfirmDialog({ open: false });
                              },
                              onCancel: () => setConfirmDialog({ open: false }),
                            })
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                No products found
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-foreground/50">
                  <th className="p-3 font-medium">Photos</th>
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Category</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Featured</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((p: any) => {
                  let img = "";
                  if (
                    p.images &&
                    Array.isArray(p.images) &&
                    p.images.length > 0
                  )
                    img = p.images[0];
                  else if (p.image) {
                    try {
                      const parsed = JSON.parse(p.image);
                      img = Array.isArray(parsed) ? parsed[0] : p.image;
                    } catch {
                      img = p.image;
                    }
                  }
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      <td className="p-3">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="w-9 h-9 rounded-lg object-cover bg-muted"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="w-4 h-4 text-foreground/30" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-medium max-w-[200px] truncate">
                        {p.name}
                      </td>
                      <td className="p-3">
                        <Badge className="text-[10px] bg-accent/10 text-accent">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="p-3 font-semibold">
                        KES {parseFloat(p.price).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-xs font-medium ${p.stock > 0 ? "text-emerald-600" : "text-red-400"}`}
                        >
                          {p.stock ?? 0}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={async () => {
                            try {
                              await toggleProductFeaturedMut.mutateAsync({
                                id: p.id,
                              });
                              productsQuery.refetch();
                              toast.success(
                                p.featured ? "Unfeatured" : "Featured"
                              );
                            } catch (e: any) {
                              toast.error(e?.message || "Failed");
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${p.featured ? "text-amber-400 hover:text-amber-500" : "text-foreground/20 hover:text-foreground/40"}`}
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={p.featured ? "currentColor" : "none"}
                          />
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-1.5 hover:bg-accent/10 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                title: "Delete Product",
                                message: `Delete "${p.name}"?`,
                                onConfirm: () => {
                                  handleDelete(p.id);
                                  setConfirmDialog({ open: false });
                                },
                                onCancel: () =>
                                  setConfirmDialog({ open: false }),
                              })
                            }
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-foreground/40 text-sm"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 mt-2 sm:mt-0">
            <span className="text-[10px] text-foreground/40">
              Page {safePage + 1} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setProductPage(safePage - 1)}
                disabled={safePage === 0}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => setProductPage(safePage + 1)}
                disabled={safePage >= totalPages - 1}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Services Tab ──
function ServicesTab({
  servicesQuery,
  createServiceMut,
  updateServiceMut,
  deleteServiceMut,
  toggleServiceFeaturedMut,
  createPackageMut,
  updatePackageMut,
  deletePackageMut,
  packagesQuery,
  editingService,
  setEditingService,
  setConfirmDialog,
}: any) {
  const isMobile = useIsMobile();
  const [services, setServices] = useState<any[]>([]);
  const [searchS, setSearchS] = useState("");
  const [servicePage, setServicePage] = useState(0);
  const servicesPerPage = 5;
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    serviceType: "security",
    startingPrice: "",
    isActive: true,
  });
  const [showPkgForm, setShowPkgForm] = useState(false);
  const [pkgForm, setPkgForm] = useState({
    tier: "",
    price: "",
    features: "",
    duration: "",
  });
  const [editPkgId, setEditPkgId] = useState<number | null>(null);

  useEffect(() => {
    if (servicesQuery.data) setServices(servicesQuery.data);
  }, [servicesQuery.data]);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      serviceType: "security",
      startingPrice: "",
      isActive: true,
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Name is required");
      return;
    }
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        serviceType: form.serviceType,
        startingPrice: form.startingPrice || undefined,
        isActive: form.isActive,
      };
      if (editId) {
        await updateServiceMut.mutateAsync({ id: editId, ...payload });
        toast.success("Service updated");
      } else {
        await createServiceMut.mutateAsync(payload);
        toast.success("Service created");
      }
      resetForm();
      servicesQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteServiceMut.mutateAsync({ id });
      toast.success("Service deleted");
      servicesQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  const handlePkgSubmit = async () => {
    if (!pkgForm.tier || !pkgForm.price) {
      toast.error("Tier and price required");
      return;
    }
    if (!editingService?.id) {
      toast.error("No service selected");
      return;
    }
    try {
      if (editPkgId) {
        await updatePackageMut.mutateAsync({ id: editPkgId, ...pkgForm });
      } else {
        await createPackageMut.mutateAsync({
          serviceId: editingService.id,
          ...pkgForm,
        });
      }
      toast.success("Package saved");
      setShowPkgForm(false);
      setEditPkgId(null);
      setPkgForm({ tier: "", price: "", features: "", duration: "" });
      servicesQuery.refetch();
    } catch (e: any) {
      toast.error(e?.message || "Failed to save package");
    }
  };

  const filtered = services.filter(
    (s: any) =>
      !searchS || s.name?.toLowerCase().includes(searchS.toLowerCase())
  );
  const svcTotalPages = Math.max(
    1,
    Math.ceil(filtered.length / servicesPerPage)
  );
  const svcSafePage = Math.min(servicePage, svcTotalPages - 1);
  const svcPaginated = filtered.slice(
    svcSafePage * servicesPerPage,
    (svcSafePage + 1) * servicesPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="font-bold text-foreground text-sm md:text-base">
          Services ({services.length})
        </h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            name="searchServices"
            placeholder="Search..."
            className="text-xs w-full sm:w-48"
            value={searchS}
            onChange={e => {
              setSearchS(e.target.value);
              setServicePage(0);
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <ModalForm
        open={showForm}
        title={editId ? "Edit Service" : "Add Service"}
        onClose={() => setShowForm(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Name *
            </label>
            <Input
              name="serviceName"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Description
            </label>
            <textarea
              name="serviceDescription"
              value={form.description}
              onChange={e =>
                setForm(f => ({ ...f, description: e.target.value }))
              }
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Type
            </label>
            <select
              name="serviceType"
              value={form.serviceType}
              onChange={e =>
                setForm(f => ({ ...f, serviceType: e.target.value }))
              }
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="security">Security (CCTV)</option>
              <option value="networking">Networking</option>
              <option value="solar">Solar</option>
              <option value="support">IT Support</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Starting Price (KES)
              </label>
              <Input
                name="serviceStartingPrice"
                type="number"
                value={form.startingPrice}
                onChange={e =>
                  setForm(f => ({ ...f, startingPrice: e.target.value }))
                }
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Status
              </label>
              <select
                name="serviceStatus"
                value={form.isActive ? "active" : "inactive"}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    isActive: e.target.value === "active",
                  }))
                }
                className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              className="w-full sm:flex-1"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
            <Button className="w-full sm:flex-1" onClick={handleSubmit}>
              {editId ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </ModalForm>

      <div className="rounded-xl border border-border/60 bg-card/70 p-2 sm:p-0 sm:bg-transparent sm:border-border">
        {isMobile ? (
          <div className="space-y-3">
            {svcPaginated.map((s: any) => (
              <div
                key={s.id}
                className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm leading-5">{s.name}</p>
                    <p className="mt-1 text-[11px] text-foreground/50">
                      {s.serviceType}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await toggleServiceFeaturedMut.mutateAsync({
                          id: s.id,
                        });
                        servicesQuery.refetch();
                        toast.success(s.featured ? "Unfeatured" : "Featured");
                      } catch (e: any) {
                        toast.error(e?.message || "Failed");
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${s.featured ? "text-amber-400 hover:text-amber-500" : "text-foreground/20 hover:text-foreground/40"}`}
                  >
                    <Star
                      className="w-4 h-4"
                      fill={s.featured ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-foreground/70">
                  <span className="font-semibold">
                    {s.startingPrice
                      ? `KES ${parseFloat(s.startingPrice).toLocaleString()}`
                      : "Custom"}
                  </span>
                  {s.isActive ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">
                      Inactive
                    </span>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setEditingService(editingService?.id === s.id ? null : s);
                    }}
                  >
                    <Layers className="w-3.5 h-3.5 mr-1" />
                    Packages
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setForm({
                        name: s.name,
                        description: s.description || "",
                        serviceType: s.serviceType,
                        startingPrice: s.startingPrice
                          ? String(s.startingPrice)
                          : "",
                        isActive: s.isActive !== false,
                      });
                      setEditId(s.id);
                      setShowForm(true);
                    }}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                </div>
                {editingService?.id === s.id && (
                  <div className="mt-3 rounded-lg border border-border/50 bg-background p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-semibold text-sm">Packages</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditPkgId(null);
                          setPkgForm({
                            tier: "",
                            price: "",
                            features: "",
                            duration: "",
                          });
                          setShowPkgForm(true);
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </div>
                    {s.packages && s.packages.length > 0 ? (
                      <div className="space-y-2">
                        {s.packages.map((p: any) => (
                          <div
                            key={p.id}
                            className="rounded-md border border-border/40 bg-card/60 p-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-xs">
                                  {p.tier}
                                </p>
                                <p className="mt-1 text-[11px] text-foreground/60">
                                  KES {parseFloat(p.price).toLocaleString()}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditPkgId(p.id);
                                    setPkgForm({
                                      tier: p.tier,
                                      price: String(p.price),
                                      features: p.features || "",
                                      duration: p.duration || "",
                                    });
                                    setShowPkgForm(true);
                                  }}
                                  className="p-1.5 hover:bg-accent/10 rounded-md transition-colors"
                                >
                                  <Edit3 className="w-3 h-3 text-foreground/70" />
                                </button>
                                <button
                                  onClick={() =>
                                    deletePackageMut
                                      .mutateAsync({ id: p.id })
                                      .then(() => {
                                        servicesQuery.refetch();
                                        toast.success("Deleted");
                                      })
                                      .catch((e: any) =>
                                        toast.error(
                                          e?.message || "Delete failed"
                                        )
                                      )
                                  }
                                  className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                  <Ban className="w-3 h-3 text-red-400" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-foreground/50 py-2 text-center border border-dashed border-border/60 rounded-lg">
                        No packages found
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-foreground/40 text-sm">
                No services found
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-muted/50 text-left text-foreground/50">
                  <th className="p-3 font-medium">Name</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Starting</th>
                  <th className="p-3 font-medium">Active</th>
                  <th className="p-3 font-medium">Featured</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {svcPaginated.map((s: any) => (
                  <Fragment key={s.id}>
                    <tr className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium max-w-[200px] truncate">
                        {s.name}
                      </td>
                      <td className="p-3">
                        <Badge className="text-[10px] bg-accent/10 text-accent">
                          {s.serviceType}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs font-semibold">
                        {s.startingPrice
                          ? `KES ${parseFloat(s.startingPrice).toLocaleString()}`
                          : "—"}
                      </td>
                      <td className="p-3">
                        {s.isActive ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={async () => {
                            try {
                              await toggleServiceFeaturedMut.mutateAsync({
                                id: s.id,
                              });
                              servicesQuery.refetch();
                              toast.success(
                                s.featured ? "Unfeatured" : "Featured"
                              );
                            } catch (e: any) {
                              toast.error(e?.message || "Failed");
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${s.featured ? "text-amber-400 hover:text-amber-500" : "text-foreground/20 hover:text-foreground/40"}`}
                        >
                          <Star
                            className="w-3.5 h-3.5"
                            fill={s.featured ? "currentColor" : "none"}
                          />
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingService(
                                editingService?.id === s.id ? null : s
                              );
                            }}
                            className="p-1.5 hover:bg-accent/10 rounded-lg transition-colors"
                            title="Toggle Packages"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setForm({
                                name: s.name,
                                description: s.description || "",
                                serviceType: s.serviceType,
                                startingPrice: s.startingPrice
                                  ? String(s.startingPrice)
                                  : "",
                                isActive: s.isActive !== false,
                              });
                              setEditId(s.id);
                              setShowForm(true);
                            }}
                            className="p-1.5 hover:bg-accent/10 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                title: "Delete Service",
                                message: `Delete "${s.name}"?`,
                                onConfirm: () => {
                                  handleDelete(s.id);
                                  setConfirmDialog({ open: false });
                                },
                                onCancel: () =>
                                  setConfirmDialog({ open: false }),
                              })
                            }
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editingService?.id === s.id && (
                      <tr className="bg-muted/10">
                        <td
                          colSpan={6}
                          className="p-4 border-b border-border/50"
                        >
                          <div className="bg-background border border-border/50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-sm">
                                Packages for {s.name}
                              </h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditPkgId(null);
                                  setPkgForm({
                                    tier: "",
                                    price: "",
                                    features: "",
                                    duration: "",
                                  });
                                  setShowPkgForm(true);
                                }}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Package
                              </Button>
                            </div>
                            {s.packages && s.packages.length > 0 ? (
                              <div className="grid gap-2">
                                {s.packages.map((p: any) => (
                                  <div
                                    key={p.id}
                                    className="flex justify-between items-center p-2 rounded-md border border-border/40 hover:bg-muted/30 transition-colors"
                                  >
                                    <div className="grid grid-cols-3 gap-4 flex-1">
                                      <div>
                                        <span className="font-semibold text-xs">
                                          {p.tier}
                                        </span>
                                      </div>
                                      <div className="text-xs text-foreground/80">
                                        KES{" "}
                                        {parseFloat(p.price).toLocaleString()}
                                      </div>
                                      <div className="text-xs text-foreground/50 truncate max-w-[150px]">
                                        {p.features || "No features specified"}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 ml-4">
                                      <button
                                        onClick={() => {
                                          setEditPkgId(p.id);
                                          setPkgForm({
                                            tier: p.tier,
                                            price: String(p.price),
                                            features: p.features || "",
                                            duration: p.duration || "",
                                          });
                                          setShowPkgForm(true);
                                        }}
                                        className="p-1.5 hover:bg-accent/10 rounded-md transition-colors"
                                      >
                                        <Edit3 className="w-3 h-3 text-foreground/70" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          deletePackageMut
                                            .mutateAsync({ id: p.id })
                                            .then(() => {
                                              servicesQuery.refetch();
                                              toast.success("Deleted");
                                            })
                                            .catch((e: any) =>
                                              toast.error(
                                                e?.message || "Delete failed"
                                              )
                                            )
                                        }
                                        className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors"
                                      >
                                        <Ban className="w-3 h-3 text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-foreground/50 py-2 text-center border border-dashed border-border/60 rounded-lg">
                                No packages found for this service.
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-foreground/40 text-sm"
                    >
                      No services found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {svcTotalPages > 1 && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 mt-2 sm:mt-0">
            <span className="text-[10px] text-foreground/40">
              Page {svcSafePage + 1} of {svcTotalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setServicePage(svcSafePage - 1)}
                disabled={svcSafePage === 0}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              <button
                onClick={() => setServicePage(svcSafePage + 1)}
                disabled={svcSafePage >= svcTotalPages - 1}
                className="px-2 py-1 text-[10px] rounded-md border border-border/50 hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalForm
        open={showPkgForm}
        title={editPkgId ? "Edit Package" : "Add Package"}
        onClose={() => setShowPkgForm(false)}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Tier *
            </label>
            <Input
              name="pkgTier"
              value={pkgForm.tier}
              onChange={e => setPkgForm(f => ({ ...f, tier: e.target.value }))}
              className="text-sm"
              placeholder="e.g. Basic, Pro, Enterprise"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Price (KES) *
              </label>
              <Input
                name="pkgPrice"
                type="number"
                value={pkgForm.price}
                onChange={e =>
                  setPkgForm(f => ({ ...f, price: e.target.value }))
                }
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-foreground/60 mb-1 block font-medium">
                Duration
              </label>
              <Input
                name="pkgDuration"
                value={pkgForm.duration}
                onChange={e =>
                  setPkgForm(f => ({ ...f, duration: e.target.value }))
                }
                className="text-sm"
                placeholder="e.g. Monthly"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-foreground/60 mb-1 block font-medium">
              Features (one per line)
            </label>
            <textarea
              name="pkgFeatures"
              value={pkgForm.features}
              onChange={e =>
                setPkgForm(f => ({ ...f, features: e.target.value }))
              }
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowPkgForm(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handlePkgSubmit}>
              {editPkgId ? "Update" : "Create"} Package
            </Button>
          </div>
        </div>
      </ModalForm>
    </div>
  );
}
