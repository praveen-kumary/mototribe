import { useState } from "react";
import { DollarSign, Search, ExternalLink, Check, X } from "lucide-react";
import { usePayouts, useUpdatePayoutStatus } from "../../../../features/platform/api/payouts";

export function AdminPayoutsView() {
  const { data: payouts = [], isLoading } = usePayouts();
  const updateStatus = useUpdatePayoutStatus();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayouts = payouts.filter((item: any) => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.seller?.storeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center text-muted">Loading payouts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#ff5c1a]" /> Payouts Management
          </h2>
          <p className="text-muted text-[13px] mt-1">Review and process seller withdrawal requests.</p>
        </div>
      </div>

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by ID or Store Name..." 
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
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Payout ID</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Seller</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayouts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted text-[13px]">
                    No payouts found.
                  </td>
                </tr>
              ) : (
                filteredPayouts.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-foreground text-[12px] font-mono">{item.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-foreground text-[12px] font-bold">{item.seller?.storeName || item.seller?.name}</td>
                    <td className="px-4 py-3 text-foreground text-[13px] font-bold">
                      Rs. {(item.amount / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.status === 'FAILED' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {item.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => updateStatus.mutate({ id: item.id, status: 'COMPLETED', reference: 'TRX-' + Math.random().toString(36).substring(2, 8).toUpperCase() })}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded transition"
                            title="Approve & Mark Paid"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => updateStatus.mutate({ id: item.id, status: 'FAILED' })}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
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
