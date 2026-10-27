import { useState } from "react";
import { Ticket, Plus, Tag, Trash2 } from "lucide-react";
import { useCoupons, useCreateCoupon, useToggleCouponStatus } from "../../../../features/platform/api/coupons";
import { motion, AnimatePresence } from "framer-motion";

export function AdminCouponsView() {
  const { data: coupons = [], isLoading, error } = useCoupons();
  const createCoupon = useCreateCoupon();
  const toggleStatus = useToggleCouponStatus();

  const [showForm, setShowForm] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: "", discountPercent: 10, maxUses: 100 });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    createCoupon.mutate(newCoupon, {
      onSuccess: () => {
        setNewCoupon({ code: "", discountPercent: 10, maxUses: 100 });
        setShowForm(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load coupons. Please try again.</p>
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
            <Ticket className="w-6 h-6 text-orange-500" />
            <span>Platform Coupons & Promos</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Manage discount codes for marketing campaigns and events.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all">
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
          <span>{showForm ? "Cancel" : "Create Coupon"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            onSubmit={handleAdd} 
            className="rounded-2xl border border-orange-500/30 bg-surface p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Coupon Code</label>
              <input required placeholder="e.g. DIWALI25" value={newCoupon.code} onChange={e=>setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors uppercase" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Discount (%)</label>
              <input required type="number" min="1" max="100" value={newCoupon.discountPercent} onChange={e=>setNewCoupon({...newCoupon, discountPercent: Number(e.target.value)})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Max Uses</label>
              <input required type="number" min="1" value={newCoupon.maxUses} onChange={e=>setNewCoupon({...newCoupon, maxUses: Number(e.target.value)})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div className="sm:col-span-3 flex justify-end pt-2">
              <button type="submit" disabled={createCoupon.isPending} className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {createCoupon.isPending ? "Generating..." : "Generate Coupon Code"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {coupons.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No active coupons.
            </motion.div>
          ) : (
            coupons.map((c: any, idx: number) => (
              <motion.div 
                key={c.id} 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 shadow-xl hover:border-orange-500/40 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-400" />
                    <b className="text-lg text-foreground font-black">{c.code}</b>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${c.active ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                    {c.active ? "ACTIVE" : "INACTIVE"}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted font-bold uppercase text-[10px]">Discount</span>
                    <span className="text-emerald-400 font-extrabold">{c.discountPercent}% OFF</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted font-bold uppercase text-[10px]">Usage Limit</span>
                    <span className="text-foreground font-extrabold">{c.uses} / {c.maxUses}</span>
                  </div>
                </div>
                <div className="pt-4 mt-3 border-t border-border flex justify-end">
                  <button 
                    disabled={toggleStatus.isPending}
                    onClick={() => toggleStatus.mutate({ id: c.id, active: !c.active })} 
                    className="text-orange-400 text-xs font-bold hover:underline disabled:opacity-50"
                  >
                    {c.active ? "Deactivate" : "Activate"}
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
