
import { useState } from "react";

interface SellersViewProps {
  allSellers: any[];
  activeSellers: any[];
  pendingSellers: any[];
  products: any[];
  orders: any[];
  handleApproveSeller: (id: string, status: "APPROVED" | "REJECTED") => void;
  statusColor: (s: string) => string;
  handleToggleProduct: (id: string) => void;
  handleDeleteProduct: (id: string) => void;
}

export function AdminSellersView({
  allSellers, activeSellers, pendingSellers, products, orders,
  handleApproveSeller, statusColor, handleToggleProduct, handleDeleteProduct
}: SellersViewProps) {
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  if (!selectedSellerId) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-[18px] font-bold">Seller Accounts</h2>
            <p className="text-[12px] text-muted">{allSellers.length} total · {activeSellers.length} approved · {pendingSellers.length} pending</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="border-b border-black/5 dark:border-white/5 text-muted">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Store</th>
                <th className="px-5 py-3 text-left font-medium">Email</th>
                <th className="px-5 py-3 text-left font-medium">Products</th>
                <th className="px-5 py-3 text-left font-medium">Orders</th>
                <th className="px-5 py-3 text-left font-medium">Revenue</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allSellers.map((s) => {
                const sellerProducts = products.filter((p) => p.sellerId === s.id);
                const sellerOrders = orders.filter((o: any) => (o.sellerOrders || []).some((so: any) => so.sellerId === s.id));
                const sellerRevenue = sellerOrders.reduce((sum, o: any) => sum + (o.grandTotal || 0), 0);
                return (
                  <tr key={s.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer" onClick={() => setSelectedSellerId(s.id)}>
                    <td className="px-5 py-3 font-bold flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#ff5c1a]/15 grid place-items-center text-[9px] font-bold text-[#ff5c1a]">{s.name[0]}</div>
                      {s.name}
                    </td>
                    <td className="px-5 py-3 text-muted">{s.email}</td>
                    <td className="px-5 py-3">{sellerProducts.length}</td>
                    <td className="px-5 py-3">{sellerOrders.length}</td>
                    <td className="px-5 py-3 font-semibold">₹{(sellerRevenue / 100).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor(s.sellerStatus || "PENDING")}`}>{s.sellerStatus || "PENDING"}</span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {s.sellerStatus === "PENDING" && (
                        <>
                          <button onClick={() => handleApproveSeller(s.id, "APPROVED")} className="px-3 py-1 bg-emerald-500/15 text-emerald-400 rounded text-[10px] font-bold hover:bg-emerald-500/25 transition">Approve</button>
                          <button onClick={() => handleApproveSeller(s.id, "REJECTED")} className="px-3 py-1 bg-red-500/15 text-red-400 rounded text-[10px] font-bold hover:bg-red-500/25 transition">Reject</button>
                        </>
                      )}
                      {s.sellerStatus === "APPROVED" && <button onClick={() => handleApproveSeller(s.id, "REJECTED")} className="px-3 py-1 bg-black/5 dark:bg-white/5 text-muted rounded text-[10px] font-bold hover:bg-red-500/15 hover:text-red-400 transition">Revoke</button>}
                      {s.sellerStatus === "REJECTED" && <button onClick={() => handleApproveSeller(s.id, "APPROVED")} className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-bold">Reinstate</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  // Details View
  const seller = allSellers.find((s) => s.id === selectedSellerId);
  if (!seller) return null;
  const sellerProducts = products.filter((p) => p.sellerId === selectedSellerId);
  const sellerOrders = orders.filter((o: any) => (o.sellerOrders || []).some((so: any) => so.sellerId === selectedSellerId));
  const sellerRevenue = sellerOrders.reduce((sum, o: any) => sum + (o.grandTotal || 0), 0);

  return (
    <div>
      <button onClick={() => setSelectedSellerId(null)} className="mb-4 text-[#ff5c1a] text-[12px] font-bold flex items-center gap-1 hover:underline">
        ← Back to Sellers
      </button>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#ff5c1a]/15 grid place-items-center text-[18px] font-black text-[#ff5c1a]">{seller.name[0]}</div>
          <div>
            <h2 className="text-[22px] font-bold">{seller.name}</h2>
            <p className="text-[12px] text-muted">{seller.email} · {seller.sellerStatus}</p>
          </div>
        </div>
        <div className="flex gap-4 text-[13px]">
          <div className="bg-[#15171b] px-4 py-2 rounded-lg border border-border text-center">
            <p className="text-muted text-[10px] uppercase font-bold tracking-wider">Revenue</p>
            <b className="text-[16px] text-[#ff5c1a]">₹{(sellerRevenue / 100).toLocaleString("en-IN")}</b>
          </div>
          <div className="bg-[#15171b] px-4 py-2 rounded-lg border border-border text-center">
            <p className="text-muted text-[10px] uppercase font-bold tracking-wider">Orders</p>
            <b className="text-[16px] text-foreground">{sellerOrders.length}</b>
          </div>
          <div className="bg-[#15171b] px-4 py-2 rounded-lg border border-border text-center">
            <p className="text-muted text-[10px] uppercase font-bold tracking-wider">Products</p>
            <b className="text-[16px] text-foreground">{sellerProducts.length}</b>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Products */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="p-4 border-b border-border"><b className="text-[14px]">Seller Products</b></div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto hide-scrollbar">
            {sellerProducts.length === 0 ? <div className="p-5 text-center text-muted text-[12px]">No products listed.</div> :
              sellerProducts.map((p) => (
                <div key={p.id} className="p-4 flex gap-3">
                  <img src={p.image} className="w-12 h-12 rounded bg-zinc-900 object-cover" />
                  <div className="flex-1">
                    <b className="text-[13px]">{p.name}</b>
                    <p className="text-[11px] text-muted">₹{(p.price / 100).toLocaleString("en-IN")} · {p.stock} in stock</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${statusColor(p.status)}`}>{p.status}</span>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => handleToggleProduct(p.id)} className="text-[10px] text-muted hover:text-foreground">Toggle Status</button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="p-4 border-b border-border"><b className="text-[14px]">Recent Seller Orders</b></div>
          <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto hide-scrollbar">
            {sellerOrders.length === 0 ? <div className="p-5 text-center text-muted text-[12px]">No orders yet.</div> :
              sellerOrders.map((o) => (
                <div key={o.id} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <b className="text-[12px]">{o.id}</b>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${statusColor(o.status)}`}>{o.status}</span>
                  </div>
                  <p className="text-[11px] text-muted mb-2">Buyer: {o.buyerEmail}</p>
                  {o.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-[11px] text-foreground mb-1">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex justify-between">
                    <span className="text-[11px] font-bold text-foreground">Total</span>
                    <span className="text-[11px] font-bold text-[#ff5c1a]">₹{((o as any).grandTotal / 100 || 0).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
