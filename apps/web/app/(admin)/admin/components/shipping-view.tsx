import { useState } from "react";
import { Truck, Plus } from "lucide-react";
import { useShipping, useCreateShippingProfile, useUpdateShippingStatus } from "../../../../features/platform/api/shipping";
import { motion, AnimatePresence } from "framer-motion";

export function AdminShippingView() {
  const { data: partners = [], isLoading, error } = useShipping();
  const createProfile = useCreateShippingProfile();
  const updateStatus = useUpdateShippingStatus();

  const [showForm, setShowForm] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: "", baseRate: 7500, perKgRate: 1500, regions: ["ALL"] });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartner.name) return;
    createProfile.mutate(newPartner, {
      onSuccess: () => {
        setNewPartner({ name: "", baseRate: 7500, perKgRate: 1500, regions: ["ALL"] });
        setShowForm(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load shipping data. Please try again.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-400" />
            <span>Shipping & Fulfillment Partner Network</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Manage courier gateway integrations, weight-based tariff schedules, and transit SLA tracking.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-foreground font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all">
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
          <span>{showForm ? "Cancel" : "Add Logistics Partner"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            onSubmit={handleAdd} 
            className="rounded-2xl border border-blue-500/30 bg-surface p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Courier Partner Name</label>
              <input required placeholder="e.g. XpressBees India" value={newPartner.name} onChange={e=>setNewPartner({...newPartner, name: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Base Rate (₹)</label>
              <input required type="number" value={newPartner.baseRate / 100} onChange={e=>setNewPartner({...newPartner, baseRate: Number(e.target.value) * 100})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Per Kg Rate (₹)</label>
              <input required type="number" value={newPartner.perKgRate / 100} onChange={e=>setNewPartner({...newPartner, perKgRate: Number(e.target.value) * 100})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
              <button type="submit" disabled={createProfile.isPending} className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {createProfile.isPending ? "Connecting..." : "Connect Gateway"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <AnimatePresence>
          {partners.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No shipping profiles configured.
            </motion.div>
          ) : (
            partners.map((p: any, idx: number) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 sm:p-6 shadow-lg space-y-4 hover:border-blue-500/40 transition-colors group"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <span className="text-base font-black text-foreground block truncate group-hover:text-blue-400 transition-colors">{p.name}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wider border ${p.active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                    {p.active ? "ONLINE" : "OFFLINE"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted font-bold block uppercase text-[10px]">Seller</span>
                    <span className="text-foreground font-extrabold block mt-0.5">{p.seller?.storeName || "Platform Global"}</span>
                  </div>
                  <div>
                    <span className="text-muted font-bold block uppercase text-[10px]">Regions</span>
                    <span className="text-emerald-400 font-extrabold block mt-0.5">{p.regions?.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-muted font-bold block uppercase text-[10px]">Base Tariff Rate</span>
                    <span className="text-orange-400 font-extrabold block mt-0.5">₹{(p.baseRate / 100).toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-muted font-bold block uppercase text-[10px]">Per Kg Tariff Rate</span>
                    <span className="text-foreground font-extrabold block mt-0.5">₹{(p.perKgRate / 100).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-extrabold">
                  <button 
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: p.id, active: !p.active })} 
                    className="text-blue-400 hover:underline disabled:opacity-50 transition-all"
                  >
                    {p.active ? "Disable Gateway" : "Enable Gateway"}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
