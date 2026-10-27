import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useAllOrders, useUpdateOrderStatus } from "../../../../features/marketplace/hooks/useOrders";

interface OrdersViewProps {
  statusColor: (s: string) => string;
}

export function AdminOrdersView({ statusColor }: OrdersViewProps) {
  const { data: orders = [], isLoading } = useAllOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-[14px]">Loading orders...</p>
      </div>
    );
  }

  const filteredOrders = orders
    .filter((o) => orderStatusFilter === "All" || o.status === orderStatusFilter)
    .filter((o) => o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.buyerId?.toLowerCase().includes(orderSearch.toLowerCase()));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold">All Platform Orders ({orders.length})</h2>
        <div className="flex gap-2">
          <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="bg-[#15171b] border border-border rounded-lg px-3 py-1.5 text-[11px] text-muted outline-none">
            <option value="All">All Statuses</option>
            {["CREATED", "PAYMENT_PENDING", "CONFIRMED", "PACKING", "READY_TO_SHIP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          <div className="flex items-center gap-2 bg-[#15171b] border border-border rounded-lg px-3 py-1.5 w-[200px]">
            <Search className="w-3.5 h-3.5 text-muted" />
            <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder="Search..." className="bg-transparent text-[12px] outline-none w-full text-foreground placeholder:text-zinc-600" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-black/5 dark:border-white/5 text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Buyer</th>
              <th className="px-4 py-3 text-left font-medium">Seller</th>
              <th className="px-4 py-3 text-left font-medium">Items</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map((o) => (
              <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                <td className="px-4 py-3 font-mono text-[11px] text-[#ff5c1a] font-semibold">{o.id.slice(0, 10)}…</td>
                <td className="px-4 py-3 text-muted text-[11px]">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 text-foreground">{(o as any).buyer?.name || o.buyerId?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-muted">{((o as any).sellerOrders || []).map((so: any) => so.seller?.name).filter(Boolean).join(", ") || "—"}</td>
                <td className="px-4 py-3 text-muted text-[11px] max-w-[200px] truncate">{((o as any).sellerOrders || []).flatMap((so: any) => (so.items || []).map((i: any) => i.name)).join(", ") || "—"}</td>
                <td className="px-4 py-3 font-bold">₹{(((o as any).grandTotal || 0) / 100).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded text-[9px] font-bold ${statusColor(o.status)}`}>{o.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <select value={o.status} onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)} className="bg-surface border border-border rounded px-2 py-1 text-[10px] outline-none">
                    {["CREATED", "PAYMENT_PENDING", "CONFIRMED", "PACKING", "READY_TO_SHIP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"].map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && <div className="text-center py-12 text-muted">No orders found.</div>}
      </div>
    </div>
  );
}
