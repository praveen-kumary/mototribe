import { useState } from "react";
import { CreditCard, Search, Plus, Tag, ToggleLeft, ToggleRight } from "lucide-react";
import { useCoupons, useCreateCoupon, useToggleCouponStatus } from "../../../../features/platform/api/coupons";

export function SellerCouponsView() {
  const { data: coupons = [], isLoading } = useCoupons();
  const createCoupon = useCreateCoupon();
  const toggleStatus = useToggleCouponStatus();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", type: "PERCENTAGE", value: 0 });

  const filteredCoupons = coupons.filter((item: any) => 
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCoupon.mutate(newCoupon, {
      onSuccess: () => {
        setShowForm(false);
        setNewCoupon({ code: "", type: "PERCENTAGE", value: 0 });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted">Loading coupons...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#ff5c1a]" /> Coupons & Discounts
          </h2>
          <p className="text-muted text-[13px] mt-1">Create promotional codes to boost your store sales.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#ff5c1a] text-foreground rounded-lg text-[13px] font-bold hover:bg-[#e04c0d] transition flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Create Coupon</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#12131a] border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Coupon Code</label>
            <input required type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER20" className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50 uppercase" />
          </div>
          <div className="w-[150px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Discount Type</label>
            <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value})} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50">
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Value</label>
            <input required type="number" min="1" value={newCoupon.value} onChange={e => setNewCoupon({...newCoupon, value: parseInt(e.target.value)})} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <button type="submit" className="px-5 py-2 bg-white text-black rounded-lg text-[13px] font-bold hover:bg-zinc-200 transition">Save</button>
        </form>
      )}

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search coupons..." 
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
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Discount</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Usage</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted text-[13px]">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#ff5c1a]" />
                        <b className="text-foreground text-[13px] tracking-wide">{item.code}</b>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground text-[13px] font-bold">
                      {item.type === 'PERCENTAGE' ? `${item.value}% OFF` : `Rs. ${item.value} OFF`}
                    </td>
                    <td className="px-4 py-3 text-muted text-[12px]">
                      {item.usedCount} times used
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => toggleStatus.mutate({ id: item.id, active: !item.active })}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition ${item.active ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-zinc-500/10 text-muted hover:bg-zinc-500/20'}`}
                      >
                        {item.active ? <><ToggleRight className="w-3 h-3" /> Active</> : <><ToggleLeft className="w-3 h-3" /> Disabled</>}
                      </button>
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
