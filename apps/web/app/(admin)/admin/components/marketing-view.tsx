import { useState } from "react";
import { Megaphone, Search, Plus, Trash2, TrendingUp } from "lucide-react";
import { useMarketing, useCreateCampaign, useUpdateCampaignStatus } from "../../../../features/platform/api/marketing";
import { motion, AnimatePresence } from "framer-motion";

export function AdminMarketingView() {
  const { data: campaigns = [], isLoading, error } = useMarketing();
  const createCampaign = useCreateCampaign();
  const updateStatus = useUpdateCampaignStatus();

  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ title: "", type: "BANNER_AD", budget: 25000 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.title) return;
    createCampaign.mutate(newCampaign, {
      onSuccess: () => {
        setNewCampaign({ title: "", type: "BANNER_AD", budget: 25000 });
        setShowForm(false);
      }
    });
  };

  const filteredCampaigns = campaigns.filter((item: any) => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.seller?.storeName || "Platform Admin").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-orange-500" />
            <span>Platform Advertisement & Marketing</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Monitor seller ad investments, sponsored placement slots, and campaign conversions.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-orange-600 text-foreground rounded-xl text-xs font-black hover:bg-orange-500 transition-all flex items-center gap-2 shadow-lg shadow-orange-600/30"
        >
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} /> 
          <span>{showForm ? "Cancel" : "Launch Campaign"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            onSubmit={handleCreate} 
            className="bg-surface border border-orange-500/30 p-5 sm:p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 shadow-xl"
          >
            <div>
              <label className="block text-[11px] font-extrabold text-muted mb-1.5 uppercase">Campaign Name</label>
              <input required type="text" value={newCampaign.title} onChange={e => setNewCampaign({...newCampaign, title: e.target.value})} placeholder="e.g. Diwali Helmet Bonanza" className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-muted mb-1.5 uppercase">Ad Slot Type</label>
              <select value={newCampaign.type} onChange={e => setNewCampaign({...newCampaign, type: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none">
                <option value="BANNER_AD">Homepage Banner Ad</option>
                <option value="SPONSORED_PRODUCT">Sponsored Product Placement</option>
                <option value="FEATURED_STORE">Featured Seller Showcase</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-muted mb-1.5 uppercase">Budget allocation (₹)</label>
              <input required type="number" min="1000" step="500" value={newCampaign.budget} onChange={e => setNewCampaign({...newCampaign, budget: parseInt(e.target.value) || 0})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
              <button type="submit" disabled={createCampaign.isPending} className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {createCampaign.isPending ? "Activating..." : "Activate Marketing Ad"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-border bg-surface/80">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Filter by campaign name or store..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl pl-9 pr-4 py-2 text-xs text-foreground outline-none focus:border-orange-500 font-semibold transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400 font-bold">Failed to load marketing data.</div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-surface/80 text-muted text-[10px] font-extrabold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-4">Campaign Name</th>
                  <th className="p-4">Store Partner</th>
                  <th className="p-4">Ad Type</th>
                  <th className="p-4">Budget / Spent</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-medium">
                <AnimatePresence>
                  {filteredCampaigns.length === 0 ? (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <td colSpan={6} className="p-12 text-center text-muted font-bold">No matching advertising campaigns found.</td>
                    </motion.tr>
                  ) : (
                    filteredCampaigns.map((item: any, idx: number) => (
                      <motion.tr 
                        key={item.id} 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-4 font-black text-foreground group-hover:text-orange-400 transition-colors">{item.title}</td>
                        <td className="p-4 text-orange-400 font-bold">{item.seller?.storeName || "Platform Admin"}</td>
                        <td className="p-4 text-foreground font-semibold text-[10px] uppercase tracking-wider">{item.type.replace('_', ' ')}</td>
                        <td className="p-4">
                          <span className="text-emerald-400 font-black">₹{(item.budget / 100).toLocaleString("en-IN")}</span>
                          <span className="text-muted text-xs ml-2">/ ₹{(item.spent / 100).toLocaleString("en-IN")}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black tracking-wider uppercase border ${
                            item.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 
                            item.status === 'PAUSED' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                            'bg-zinc-500/15 text-muted border-zinc-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            disabled={updateStatus.isPending}
                            onClick={() => updateStatus.mutate({ id: item.id, status: item.status === "ACTIVE" ? "PAUSED" : "ACTIVE" })}
                            className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-extrabold transition-colors disabled:opacity-50 ${item.status === 'ACTIVE' ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'}`}
                          >
                            {item.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </motion.div>
  );
}
