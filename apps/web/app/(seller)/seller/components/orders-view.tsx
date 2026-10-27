import { Loader2, AlertTriangle } from "lucide-react";
import { useSellerOrders, useUpdateOrderStatus } from "../../../../features/marketplace/hooks/useOrders";

export function SellerOrdersView() {
  const { data: orders = [], isLoading, isError } = useSellerOrders();
  const updateStatusMutation = useUpdateOrderStatus();

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const statusColor = (s: string) => {
    if (s === "PAYMENT_PENDING" || s === "CREATED") return "bg-yellow-500/10 text-yellow-500";
    if (s === "CONFIRMED" || s === "PACKING") return "bg-blue-500/10 text-blue-400";
    if (s === "READY_TO_SHIP" || s === "PICKED_UP" || s === "IN_TRANSIT" || s === "OUT_FOR_DELIVERY") return "bg-purple-500/10 text-purple-400";
    if (s === "DELIVERED") return "bg-emerald-500/10 text-emerald-400";
    if (s === "CANCELLED" || s === "PAYMENT_FAILED") return "bg-red-500/10 text-red-400";
    if (s === "RETURN_REQUESTED" || s === "RETURN_APPROVED") return "bg-orange-500/10 text-orange-400";
    return "bg-zinc-500/10 text-muted";
  };

  // Valid status transitions for sellers
  const nextStatuses: Record<string, string[]> = {
    CONFIRMED: ["PACKING"],
    PACKING: ["READY_TO_SHIP"],
    READY_TO_SHIP: ["PICKED_UP"],
    RETURN_REQUESTED: ["RETURN_APPROVED"],
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-[14px]">Loading orders...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertTriangle className="w-8 h-8 mb-4" />
        <p className="text-[14px]">Failed to load orders. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-[18px] font-bold mb-4">Orders ({orders.length})</h2>
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-black/5 dark:border-white/5 text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Order ID</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Items</th>
              <th className="px-4 py-3 text-left font-medium">Payout</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                <td className="px-4 py-3 text-[#ff5c1a] font-semibold font-mono text-[11px]">{o.id.slice(0, 10)}…</td>
                <td className="px-4 py-3 text-muted">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="px-4 py-3 text-foreground">{o.parentOrder?.buyer?.name || "—"}</td>
                <td className="px-4 py-3 text-muted max-w-[200px] truncate">{(o.items || []).map((i: any) => i.name).join(", ") || "—"}</td>
                <td className="px-4 py-3 font-bold">₹{((o.sellerPayout || 0) / 100).toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor(o.status)}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {nextStatuses[o.status] ? (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) handleUpdateOrderStatus(o.id, e.target.value);
                      }}
                      className="bg-surface border border-border rounded px-2 py-1 text-[10px] outline-none"
                    >
                      <option value="">Update…</option>
                      {nextStatuses[o.status].map((s) => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-[10px] text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="text-center py-12 text-muted text-[13px]">No orders yet.</div>}
      </div>
    </div>
  );
}
