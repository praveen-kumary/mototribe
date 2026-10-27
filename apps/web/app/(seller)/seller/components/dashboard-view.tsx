import Link from "next/link";
import { DollarSign, ShoppingBag, Eye, TrendingUp, BarChart3, Star, ArrowUpRight, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "../../../../components/auth-provider";
import { useSellerProducts } from "../../../../features/marketplace/hooks/useProducts";
import { useSellerOrders } from "../../../../features/marketplace/hooks/useOrders";

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  statusColor: (s: string) => string;
}

export function SellerDashboardView({ setActiveTab, statusColor }: DashboardViewProps) {
  const { user } = useAuth();

  const { data: products = [], isLoading: pLoading } = useSellerProducts();
  const { data: orders = [], isLoading: oLoading } = useSellerOrders();

  if (pLoading || oLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-[14px]">Loading dashboard...</p>
      </div>
    );
  }

  // Compute real stats from actual data
  const totalSales = orders.reduce((sum: number, o: any) => sum + (o.sellerPayout || o.subtotal || 0), 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p: any) => p.status === "ACTIVE").length;
  const lowStockProducts = products.filter((p: any) => p.stock <= 10 && p.status === "ACTIVE").length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  const confirmedOrders = orders.filter((o: any) => ["CONFIRMED", "PACKING", "READY_TO_SHIP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"].includes(o.status));
  const ordersToShip = orders.filter((o: any) => ["CONFIRMED", "PACKING"].includes(o.status)).length;

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Top products by order items
  const productOrderCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of orders) {
    for (const item of (order as any).items || []) {
      if (!productOrderCounts[item.productId]) {
        productOrderCounts[item.productId] = { name: item.name, count: 0, revenue: 0 };
      }
      productOrderCounts[item.productId].count += item.quantity;
      productOrderCounts[item.productId].revenue += item.price * item.quantity;
    }
  }
  const topProducts = Object.values(productOrderCounts)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Sales data for chart (last 7 days)
  const salesByDay: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    salesByDay[key] = 0;
  }
  for (const order of confirmedOrders) {
    const date = new Date((order as any).createdAt);
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (salesByDay[key] !== undefined) {
      salesByDay[key] += (order as any).sellerPayout || (order as any).subtotal || 0;
    }
  }
  const chartData = Object.entries(salesByDay).map(([day, val]) => ({ day, val }));
  const maxChartVal = Math.max(...chartData.map(d => d.val), 1);

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-bold">Welcome back, {user?.name || "Seller"}! 👋</h1>
          <p className="text-[13px] text-muted mt-0.5">Here&apos;s what&apos;s happening with your store.</p>
        </div>
      </div>

      {/* Stats — all real data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Total Sales", value: `₹${(totalSales / 100).toLocaleString("en-IN")}`, color: "from-orange-500/10", icon: DollarSign, iconBg: "bg-orange-500/20 text-orange-400" },
          { label: "Total Orders", value: totalOrders.toString(), color: "from-blue-500/10", icon: ShoppingBag, iconBg: "bg-blue-500/20 text-blue-400" },
          { label: "Active Products", value: activeProducts.toString(), color: "from-emerald-500/10", icon: Eye, iconBg: "bg-emerald-500/20 text-emerald-400" },
          { label: "Avg. Order Value", value: `₹${(avgOrderValue / 100).toLocaleString("en-IN")}`, color: "from-cyan-500/10", icon: BarChart3, iconBg: "bg-cyan-500/20 text-cyan-400" },
          { label: "Low Stock Items", value: lowStockProducts.toString(), color: "from-red-500/10", icon: TrendingUp, iconBg: "bg-red-500/20 text-red-400" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border border-border bg-gradient-to-br ${s.color} to-transparent bg-surface p-4`}>
            <div className="flex items-center gap-1.5 mb-2"><div className={`w-6 h-6 rounded-full grid place-items-center ${s.iconBg}`}><s.icon className="w-3 h-3" /></div><span className="text-[10px] text-muted font-medium">{s.label}</span></div>
            <b className="text-[18px] font-black block">{s.value}</b>
          </div>
        ))}
      </div>

      {/* Charts + Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex justify-between items-center mb-4"><b className="text-[14px]">Sales Overview (Last 7 Days)</b></div>
          {chartData.every(d => d.val === 0) ? (
            <div className="flex items-center justify-center h-[180px] text-muted text-[13px]">No sales data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-[180px] mt-4">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-[#ff5c1a]/20 rounded-t relative overflow-hidden" style={{ height: `${(d.val / maxChartVal) * 160}px` }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#ff5c1a] rounded-t" style={{ height: `${(d.val / maxChartVal) * 120}px` }} />
                  </div>
                  <span className="text-[9px] text-zinc-600">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
          <b className="text-[14px]">Pending Tasks</b>
          {[
            { label: "Orders to Ship", count: ordersToShip, color: "text-[#ff5c1a]", tab: "Orders" },
            { label: "Low Stock Products", count: lowStockProducts, color: "text-red-400", tab: "Inventory" },
          ].map((t, i) => (
            <div key={i} onClick={() => setActiveTab(t.tab)} className="flex items-center justify-between p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition">
              <span className="text-[12px]">{t.label}</span>
              <span className={`text-[14px] font-black ${t.color}`}>{t.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-4">
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center"><b className="text-[13px]">Recent Orders</b><button onClick={() => setActiveTab("Orders")} className="text-[10px] text-[#ff5c1a] font-semibold">View All</button></div>
          {recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted text-[13px]">No orders yet</div>
          ) : (
            <table className="w-full text-[11px]">
              <thead className="border-b border-black/5 dark:border-white/5 text-muted"><tr><th className="px-4 py-2 text-left font-medium">Order</th><th className="px-4 py-2 text-left font-medium">Customer</th><th className="px-4 py-2 text-left font-medium">Amount</th><th className="px-4 py-2 text-left font-medium">Status</th></tr></thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="px-4 py-2 text-[#ff5c1a] font-semibold font-mono text-[10px]">{o.id.slice(0, 8)}…</td>
                    <td className="px-4 py-2 text-foreground">{o.parentOrder?.buyer?.name || "—"}</td>
                    <td className="px-4 py-2 font-semibold">₹{((o.sellerPayout || o.subtotal || 0) / 100).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor(o.status)}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <b className="text-[13px] block mb-3">Top Selling Products</b>
          {topProducts.length === 0 ? (
            <div className="py-8 text-center text-muted text-[13px]">No sales data yet</div>
          ) : (
            topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-black/5 dark:border-white/5 last:border-0">
                <span className="text-[11px] font-bold text-muted w-4">{i + 1}</span>
                <div className="flex-1 min-w-0"><span className="text-[11px] font-semibold block truncate">{p.name}</span><span className="text-[9px] text-muted">{p.count} units sold</span></div>
                <div className="text-right"><span className="text-[11px] font-bold">₹{(p.revenue / 100).toLocaleString("en-IN")}</span></div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
