import { useState } from "react";
import { RotateCcw, Search, ExternalLink } from "lucide-react";
import { useReturns, useUpdateReturnStatus } from "../../../../features/seller/api/returns";

export function AdminReturnsView() {
  const { data: returns = [], isLoading } = useReturns();
  const updateStatus = useUpdateReturnStatus();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReturns = returns.filter((item: any) => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.parentOrderId && item.parentOrderId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <div className="p-8 text-center text-muted">Loading returns...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#ff5c1a]" /> Returns & Refunds (Admin)
          </h2>
          <p className="text-muted text-[13px] mt-1">Platform-wide overview of returns and refunds.</p>
        </div>
      </div>

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by Order ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1b23] border border-border rounded-lg pl-9 pr-4 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto hide-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Return ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Order ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Seller</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted text-[13px]">
                    No returns found.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-foreground text-[12px] font-mono">{item.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-muted text-[12px] font-mono flex items-center gap-1">
                      {item.parentOrderId.slice(0, 8)}... <ExternalLink className="w-3 h-3" />
                    </td>
                    <td className="px-4 py-3 text-foreground text-[12px]">{item.seller?.name || 'N/A'}</td>
                    <td className="px-4 py-3"><b className="text-foreground text-[13px]">Rs. {(item.subtotal / 100).toFixed(2)}</b></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === 'RETURN_REQUESTED' ? 'bg-amber-500/10 text-amber-400' :
                        item.status === 'REFUNDED' ? 'bg-emerald-500/10 text-emerald-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
