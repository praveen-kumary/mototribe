import { useState } from "react";
import { Megaphone, Search, Plus, TrendingUp } from "lucide-react";
import { useMarketing, useCreateCampaign } from "../../../../features/platform/api/marketing";

export function SellerMarketingView() {
  const { data: campaigns = [], isLoading } = useMarketing();
  const createCampaign = useCreateCampaign();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: "", type: "SPONSORED_PRODUCT", budget: 0 });

  const filteredCampaigns = campaigns.filter((item: any) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCampaign.mutate({...newCampaign, budget: newCampaign.budget * 100}, {
      onSuccess: () => {
        setShowForm(false);
        setNewCampaign({ title: "", type: "SPONSORED_PRODUCT", budget: 0 });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted">Loading campaigns...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#ff5c1a]" /> Marketing & Ads
          </h2>
          <p className="text-muted text-[13px] mt-1">Boost visibility with sponsored listings.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#ff5c1a] text-foreground rounded-lg text-[13px] font-bold hover:bg-[#e04c0d] transition flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Create Campaign</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#12131a] border border-black/5 dark:border-white/5 p-5 rounded-xl flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Campaign Title</label>
            <input required type="text" value={newCampaign.title} onChange={e => setNewCampaign({...newCampaign, title: e.target.value})} placeholder="e.g. Summer Sale Boost" className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <div className="w-[180px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Ad Type</label>
            <select value={newCampaign.type} onChange={e => setNewCampaign({...newCampaign, type: e.target.value})} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50">
              <option value="SPONSORED_PRODUCT">Sponsored Product</option>
              <option value="BANNER">Store Banner</option>
            </select>
          </div>
          <div className="w-[150px]">
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Budget (Rs.)</label>
            <input required type="number" min="100" value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: parseInt(e.target.value) || 0})} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <button type="submit" className="px-5 py-2 bg-white text-black rounded-lg text-[13px] font-bold hover:bg-zinc-200 transition">Launch</button>
        </form>
      )}

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[500px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search campaigns..." 
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
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Campaign</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Budget / Spent</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-muted text-[13px]">
                    No campaigns found.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-foreground text-[13px] font-bold">{item.title}</td>
                    <td className="px-4 py-3 text-muted text-[12px]">{item.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-[12px]">
                      <span className="text-foreground">Rs. {(item.spent / 100).toFixed(2)}</span>
                      <span className="text-muted"> / Rs. {(item.budget / 100).toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.status === 'DRAFT' ? 'bg-zinc-500/10 text-muted' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.status}
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
