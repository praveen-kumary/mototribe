import { BarChart3, ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { useAllOrders } from "../../../../features/marketplace/hooks/useOrders";
import { useSellers, useApproveSeller, useRejectSeller } from "../../../../features/seller/hooks/useSellers";
import { useAllProducts } from "../../../../features/marketplace/hooks/useProducts";
import { useDisputes } from "../../../../features/platform/api/disputes";

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  statusColor: (s: string) => string;
}

export function AdminDashboardView({ setActiveTab, statusColor }: DashboardViewProps) {
  const { data: orders = [], isLoading: oLoading } = useAllOrders();
  const { data: users = [], isLoading: uLoading } = useSellers();
  const { data: products = [], isLoading: pLoading } = useAllProducts();
  const { data: disputes = [] } = useDisputes();

  const approveMutation = useApproveSeller();
  const rejectMutation = useRejectSeller();

  if (oLoading || uLoading || pLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-[14px]">Loading dashboard...</p>
      </div>
    );
  }

  const handleApproveSeller = (id: string, action: "APPROVED" | "REJECTED") => {
    if (action === "APPROVED") approveMutation.mutate(id);
    else rejectMutation.mutate(id);
  };

  // Compute all stats from real data — zero hardcoded values
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
  const totalOrders = orders.length;
  const allSellers = users.filter((u: any) => u.role === "SELLER");
  const pendingSellers = allSellers.filter((u: any) => u.sellerStatus === "PENDING");
  const activeSellers = allSellers.filter((u: any) => u.sellerStatus === "APPROVED");
  const platformCommission = orders.reduce((sum: number, o: any) => {
    const sellerOrders = o.sellerOrders || [];
    return sum + sellerOrders.reduce((s: number, so: any) => s + (so.platformFee || 0), 0);
  }, 0);

  // Sales chart from real order data (last 7 days)
  const salesByDay: Record<string, number> = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    salesByDay[key] = 0;
  }
  for (const order of orders) {
    const date = new Date((order as any).createdAt);
    const key = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (salesByDay[key] !== undefined) {
      salesByDay[key] += (order as any).grandTotal || 0;
    }
  }
  const chartData = Object.entries(salesByDay).map(([day, val]) => ({ day, val }));
  const maxChartVal = Math.max(...chartData.map(d => d.val), 1);

  // Recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Top sellers by product count
  const sellerProductCounts: Record<string, { name: string; count: number }> = {};
  for (const p of products) {
    const sellerName = (p as any).seller?.name || (p as any).seller?.storeName || "Unknown";
    const sellerId = (p as any).seller?.id || (p as any).sellerId || "unknown";
    if (!sellerProductCounts[sellerId]) {
      sellerProductCounts[sellerId] = { name: sellerName, count: 0 };
    }
    sellerProductCounts[sellerId].count++;
  }
  const topSellers = Object.values(sellerProductCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[22px] font-bold">Platform Overview 👑</h1>
          <p className="text-[13px] text-muted mt-0.5">Real-time platform metrics and operations.</p>
        </div>
      </div>

      {/* Stats Row — all computed from real data */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "GMV", value: `₹${(totalRevenue / 100).toLocaleString("en-IN")}`, color: "from-orange-500/10", iconBg: "bg-orange-500/20 text-orange-400" },
          { label: "Total Orders", value: totalOrders.toLocaleString("en-IN"), color: "from-blue-500/10", iconBg: "bg-blue-500/20 text-blue-400" },
          { label: "Total Users", value: users.length.toLocaleString("en-IN"), color: "from-emerald-500/10", iconBg: "bg-emerald-500/20 text-emerald-400" },
          { label: "Active Sellers", value: activeSellers.length.toString(), color: "from-violet-500/10", iconBg: "bg-violet-500/20 text-violet-400" },
          { label: "Commission", value: `₹${(platformCommission / 100).toLocaleString("en-IN")}`, color: "from-cyan-500/10", iconBg: "bg-cyan-500/20 text-cyan-400" },
          { label: "Pending Sellers", value: pendingSellers.length.toString(), color: "from-red-500/10", iconBg: "bg-red-500/20 text-red-400" },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border border-border bg-gradient-to-br ${s.color} to-transparent bg-surface p-4`}>
            <div className="flex items-center gap-1.5 mb-2"><div className={`w-6 h-6 rounded-full grid place-items-center ${s.iconBg}`}><BarChart3 className="w-3 h-3" /></div><span className="text-[10px] text-muted font-medium">{s.label}</span></div>
            <b className="text-[17px] font-black block">{s.value}</b>
          </div>
        ))}
      </div>

      {/* Charts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="rounded-xl border border-border bg-surface p-5">
          <b className="text-[14px] block mb-4">Sales Overview (Last 7 Days)</b>
          {chartData.every(d => d.val === 0) ? (
            <div className="flex items-center justify-center h-[200px] text-muted text-[13px]">No sales data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-[200px]">
              {chartData.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t bg-gradient-to-t from-[#ff5c1a] to-[#ff5c1a]/40" style={{ height: `${(d.val / maxChartVal) * 180}px` }} />
                  <span className="text-[9px] text-zinc-600">{d.day}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex justify-between items-center mb-3"><b className="text-[13px]">Recent Orders</b><button onClick={() => setActiveTab("Orders")} className="text-[10px] text-[#ff5c1a] font-semibold">View All</button></div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-muted text-[13px]">No orders yet</div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
                  <div><b className="text-[11px] font-mono">{o.id.slice(0, 10)}…</b><span className="block text-[9px] text-muted">{o.buyer?.name || o.buyerId?.slice(0, 8)}</span></div>
                  <div className="text-right"><span className="text-[11px] font-bold">₹{((o.grandTotal || 0) / 100).toLocaleString("en-IN")}</span><br /><span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${statusColor(o.status)}`}>{o.status}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Pending Sellers */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex justify-between items-center mb-3"><b className="text-[13px]">Pending Sellers</b><button onClick={() => setActiveTab("Sellers")} className="text-[10px] text-[#ff5c1a] font-semibold">View All</button></div>
          {pendingSellers.length === 0 ? <p className="text-[11px] text-muted">All caught up! ✅</p> : pendingSellers.slice(0, 5).map((s: any) => (
            <div key={s.id} className="flex items-center justify-between py-2 border-b border-black/5 dark:border-white/5 last:border-0">
              <div><b className="text-[11px]">{s.name}</b><span className="block text-[9px] text-muted">{s.email}</span></div>
              <div className="flex gap-1">
                <button onClick={() => handleApproveSeller(s.id, "APPROVED")} disabled={approveMutation.isPending} className="px-2 py-1 bg-emerald-500/15 text-emerald-400 rounded text-[9px] font-bold disabled:opacity-50">✓</button>
                <button onClick={() => handleApproveSeller(s.id, "REJECTED")} disabled={rejectMutation.isPending} className="px-2 py-1 bg-red-500/15 text-red-400 rounded text-[9px] font-bold disabled:opacity-50">✗</button>
              </div>
            </div>
          ))}
        </div>

        {/* Top Sellers */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <b className="text-[13px] block mb-3">Top Sellers by Products</b>
          {topSellers.length === 0 ? (
            <p className="text-[11px] text-muted">No sellers yet</p>
          ) : (
            topSellers.map((s, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-black/5 dark:border-white/5 last:border-0">
                <span className="text-[11px] font-bold text-muted w-4">{i + 1}</span>
                <div className="w-6 h-6 rounded-full bg-[#ff5c1a]/15 grid place-items-center text-[8px] font-bold text-[#ff5c1a]">{(s.name || "S")[0]}</div>
                <span className="text-[11px] font-semibold flex-1">{s.name}</span>
                <span className="text-[11px] text-muted">{s.count} products</span>
              </div>
            ))
          )}
        </div>

        {/* Platform Stats */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <b className="text-[13px] block mb-3">Platform Stats</b>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: "Products", v: products.length.toString() },
              { l: "Active", v: products.filter((p: any) => p.status === "ACTIVE").length.toString() },
              { l: "Disputes", v: disputes.length.toString() },
              { l: "Sellers", v: allSellers.length.toString() },
            ].map((m, i) => (
              <div key={i} className="text-center p-2 bg-black/5 dark:bg-white/5 rounded-lg"><span className="text-[9px] text-zinc-600 block">{m.l}</span><span className="text-[11px] font-bold text-foreground">{m.v}</span></div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <b className="text-[13px] block mb-3">Quick Actions</b>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "All Products", action: () => setActiveTab("Products"), color: "bg-[#ff5c1a]/15 text-[#ff5c1a]" },
              { label: "All Orders", action: () => setActiveTab("Orders"), color: "bg-blue-500/15 text-blue-400" },
              { label: "Manage Sellers", action: () => setActiveTab("Sellers"), color: "bg-violet-500/15 text-violet-400" },
              { label: "View Disputes", action: () => setActiveTab("Disputes"), color: "bg-red-500/15 text-red-400" },
              { label: "Manage Users", action: () => setActiveTab("Users"), color: "bg-emerald-500/15 text-emerald-400" },
              { label: "Settings", action: () => setActiveTab("Settings"), color: "bg-yellow-500/15 text-yellow-400" },
            ].map((q, i) => (
              <button key={i} onClick={q.action} className={`p-2.5 rounded-lg text-[11px] font-semibold ${q.color} hover:opacity-80 transition text-left`}>{q.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Disputes */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center"><b className="text-[13px]">Recent Disputes</b><button onClick={() => setActiveTab("Disputes")} className="text-[10px] text-[#ff5c1a] font-semibold">View All</button></div>
        {disputes.length === 0 ? (
          <div className="p-8 text-center text-muted text-[13px]">No disputes</div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="border-b border-black/5 dark:border-white/5 text-muted"><tr><th className="px-4 py-2.5 text-left font-medium">ID</th><th className="px-4 py-2.5 text-left font-medium">Order</th><th className="px-4 py-2.5 text-left font-medium">Buyer</th><th className="px-4 py-2.5 text-left font-medium">Reason</th><th className="px-4 py-2.5 text-left font-medium">Status</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {disputes.slice(0, 5).map((d: any) => (
                <tr key={d.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="px-4 py-2.5 font-semibold font-mono text-[10px]">{d.id.slice(0, 8)}…</td>
                  <td className="px-4 py-2.5 text-[#ff5c1a] font-mono text-[10px]">{(d.orderId || "").slice(0, 8)}…</td>
                  <td className="px-4 py-2.5">{d.buyer?.name || "—"}</td>
                  <td className="px-4 py-2.5 text-muted max-w-[200px] truncate">{d.reason}</td>
                  <td className="px-4 py-2.5"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${statusColor(d.status)}`}>{d.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
