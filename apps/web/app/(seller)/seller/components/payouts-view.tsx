import { useState } from "react";
import { DollarSign, Search, ExternalLink, Plus } from "lucide-react";
import { usePayouts, useRequestPayout } from "../../../../features/platform/api/payouts";

export function SellerPayoutsView() {
  const { data: payouts = [], isLoading } = usePayouts();
  const requestPayout = useRequestPayout();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState(0);

  const filteredPayouts = payouts.filter((item: any) => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    requestPayout.mutate(amount * 100, {
      onSuccess: () => {
        setShowForm(false);
        setAmount(0);
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted">Loading payouts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#ff5c1a]" /> Payouts & Transactions
          </h2>
          <p className="text-muted text-[13px] mt-1">Manage your earnings and request withdrawals.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#ff5c1a] text-foreground rounded-lg text-[13px] font-bold hover:bg-[#e04c0d] transition flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Request Payout</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleRequest} className="bg-[#12131a] border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-wrap gap-4 items-end">
          <div className="w-[250px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Amount (Rs.)</label>
            <input required type="number" min="1" value={amount} onChange={e => setAmount(parseInt(e.target.value) || 0)} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <button type="submit" className="px-5 py-2 bg-white text-black rounded-lg text-[13px] font-bold hover:bg-zinc-200 transition">Submit Request</button>
        </form>
      )}

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search payouts by ID..." 
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
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Date Requested</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Reference</th>
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
                    <td className="px-4 py-3 text-foreground text-[12px] font-mono">{item.id}</td>
                    <td className="px-4 py-3 text-muted text-[12px]">
                      {new Date(item.requestedAt).toLocaleDateString()}
                    </td>
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
                    <td className="px-4 py-3 text-muted text-[12px] font-mono">
                      {item.reference || '-'}
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
