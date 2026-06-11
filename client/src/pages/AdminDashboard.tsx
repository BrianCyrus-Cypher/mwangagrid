import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Package, Users, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: dashboard } = trpc.admin.dashboard.useQuery();
  const { data: allOrders } = trpc.orders.allOrders.useQuery();

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
          <p className="text-foreground/60">You do not have permission to view this page</p>
        </Card>
      </div>
    );
  }

  const chartData = [
    { month: "Jan", revenue: 15000, orders: 12 },
    { month: "Feb", revenue: 22000, orders: 18 },
    { month: "Mar", revenue: 28000, orders: 25 },
    { month: "Apr", revenue: 35000, orders: 32 },
    { month: "May", revenue: 42000, orders: 38 },
    { month: "Jun", revenue: 48000, orders: 45 },
  ];

  const topProducts = [
    { name: "CCTV Camera", value: 35 },
    { name: "Router", value: 28 },
    { name: "Network Switch", value: 22 },
    { name: "Cables", value: 15 },
  ];

  const COLORS = ["#FF6B35", "#F7931E", "#FDB913", "#FFC72C"];

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border">
        <div className="container py-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-foreground/60">Sales analytics and business overview</p>
        </div>
      </div>

      <div className="container py-12">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-foreground">KES {dashboard?.totalRevenue?.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-accent opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-foreground">{dashboard?.totalOrders || 0}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-accent opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Avg Order Value</p>
                <p className="text-3xl font-bold text-foreground">
                  KES {dashboard?.totalOrders ? Math.round(dashboard.totalRevenue / dashboard.totalOrders) : 0}
                </p>
              </div>
              <Package className="w-12 h-12 text-accent opacity-20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Growth Rate</p>
                <p className="text-3xl font-bold text-accent">+24%</p>
              </div>
              <Users className="w-12 h-12 text-accent opacity-20" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--accent)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Orders Chart */}
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Orders Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Bar dataKey="orders" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Top Products</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={topProducts} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Orders */}
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Orders</h2>
            <div className="space-y-4">
              {dashboard?.recentOrders?.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-bold text-foreground">{order.orderNumber}</p>
                    <p className="text-sm text-foreground/60">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">KES {order.totalAmount}</p>
                    <p className="text-xs text-foreground/60 capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
