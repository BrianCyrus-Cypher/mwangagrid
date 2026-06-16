import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Package, Users, ShoppingCart } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: dashboard } = trpc.admin.dashboard.useQuery();
  const { data: allOrders } = trpc.orders.allOrders.useQuery();

  // Demo mode: allow access without authentication for presentation
  // In production, uncomment the role check below
  // if (user?.role !== "admin") {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <Card className="p-8 text-center">
  //         <h2 className="text-2xl font-bold text-foreground mb-4">Access Denied</h2>
  //         <p className="text-foreground/60">You do not have permission to view this page</p>
  //       </Card>
  //     </div>
  //   );
  // }

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

  // Visitor statistics data
  const visitorData = [
    { day: "Mon", visitors: 2400, pageViews: 4200, bounceRate: 24 },
    { day: "Tue", visitors: 3210, pageViews: 5100, bounceRate: 22 },
    { day: "Wed", visitors: 2290, pageViews: 4800, bounceRate: 25 },
    { day: "Thu", visitors: 3800, pageViews: 6200, bounceRate: 20 },
    { day: "Fri", visitors: 4100, pageViews: 7100, bounceRate: 18 },
    { day: "Sat", visitors: 3900, pageViews: 6800, bounceRate: 19 },
    { day: "Sun", visitors: 4200, pageViews: 7400, bounceRate: 17 },
  ];

  // Conversion funnel data
  const conversionData = [
    { stage: "Visitors", value: 24500 },
    { stage: "Product Views", value: 18200 },
    { stage: "Cart Adds", value: 12100 },
    { stage: "Checkouts", value: 8500 },
    { stage: "Completed", value: 6800 },
  ];

  // Product category performance
  const categoryData = [
    { category: "Solar Equipment", sales: 28000, growth: 12 },
    { category: "CCTV Systems", sales: 35000, growth: 18 },
    { category: "Internet Equipment", sales: 22000, growth: 8 },
  ];

  // Customer acquisition data
  const acquisitionData = [
    { source: "Organic Search", customers: 1240, value: 18600 },
    { source: "Direct", customers: 890, value: 13350 },
    { source: "Social Media", customers: 720, value: 10800 },
    { source: "Referral", customers: 450, value: 6750 },
  ];

  // Customer lifetime value segmentation
  const customerSegments = [
    { segment: "VIP (>KES 100K)", count: 45, avgLTV: 185000, growth: 12 },
    { segment: "Premium (KES 50-100K)", count: 128, avgLTV: 72500, growth: 18 },
    { segment: "Standard (KES 10-50K)", count: 342, avgLTV: 28000, growth: 22 },
    { segment: "New (<KES 10K)", count: 1235, avgLTV: 4500, growth: 35 },
  ];

  // Geographic distribution
  const geographicData = [
    { region: "Nairobi", customers: 680, revenue: 285000, percentage: 42 },
    { region: "Mombasa", customers: 320, revenue: 128000, percentage: 19 },
    { region: "Kisumu", customers: 210, revenue: 84000, percentage: 12 },
    { region: "Nakuru", customers: 185, revenue: 74000, percentage: 11 },
    { region: "Other", customers: 225, revenue: 90000, percentage: 16 },
  ];

  // Repeat purchase rate by segment
  const repeatPurchaseData = [
    { segment: "VIP", repeatRate: 92, avgOrderFreq: 8.5 },
    { segment: "Premium", repeatRate: 78, avgOrderFreq: 5.2 },
    { segment: "Standard", repeatRate: 45, avgOrderFreq: 2.8 },
    { segment: "New", repeatRate: 12, avgOrderFreq: 1.1 },
  ];

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

        {/* Visitor Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Weekly Visitor Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Line type="monotone" dataKey="visitors" stroke="#FF6B35" strokeWidth={2} name="Visitors" />
                <Line type="monotone" dataKey="pageViews" stroke="#F7931E" strokeWidth={2} name="Page Views" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Bounce Rate Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--foreground)" />
                <YAxis stroke="var(--foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Bar dataKey="bounceRate" fill="#FDB913" name="Bounce Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
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

        {/* Conversion Funnel & Category Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Conversion Funnel</h2>
            <div className="space-y-4">
              {conversionData.map((item, index) => {
                const percentage = Math.round((item.value / conversionData[0].value) * 100);
                return (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">{item.stage}</span>
                      <span className="text-sm font-bold text-accent">{item.value.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Category Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" stroke="var(--foreground)" angle={-15} textAnchor="end" height={80} />
                <YAxis stroke="var(--foreground)" />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                <Legend />
                <Bar dataKey="sales" fill="var(--accent)" name="Sales (KES)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Customer Segmentation Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Customer Segmentation & Lifetime Value</h2>
          
          {/* Customer Segments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Customer Segments by LTV</h3>
              <div className="space-y-4">
                {customerSegments.map((seg, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-foreground">{seg.segment}</h4>
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">+{seg.growth}%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">Customers</p>
                        <p className="text-2xl font-bold text-foreground">{seg.count.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-foreground/60 mb-1">Avg LTV</p>
                        <p className="text-2xl font-bold text-accent">KES {(seg.avgLTV / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Repeat Purchase Behavior</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repeatPurchaseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="segment" stroke="var(--foreground)" />
                  <YAxis stroke="var(--foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)" }} />
                  <Legend />
                  <Bar dataKey="repeatRate" fill="#FF6B35" name="Repeat Rate (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Geographic Distribution</h3>
              <div className="space-y-4">
                {geographicData.map((geo, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <p className="font-medium text-foreground">{geo.region}</p>
                        <p className="text-xs text-foreground/60">{geo.customers} customers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">KES {(geo.revenue / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-foreground/60">{geo.percentage}% of total</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: `${geo.percentage}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-8">
              <h3 className="text-xl font-bold text-foreground mb-6">Regional Revenue Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={geographicData} cx="50%" cy="50%" labelLine={false} label={({ region, percentage }) => `${region}: ${percentage}%`} outerRadius={80} fill="#8884d8" dataKey="revenue">
                    {geographicData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `KES ${(Number(value) / 1000).toFixed(0)}K`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Customer Acquisition & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">Customer Acquisition</h2>
            <div className="space-y-4">
              {acquisitionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">{item.source}</p>
                    <p className="text-xs text-foreground/60">{item.customers} customers</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent">KES {item.value.toLocaleString()}</p>
                    <p className="text-xs text-foreground/60">Avg: KES {Math.round(item.value / item.customers)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

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
        </div>

        {/* Top Products & Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
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
