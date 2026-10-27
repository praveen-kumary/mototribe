import { Award, Play, Trash2 } from "lucide-react";
import { useCreatorsDashboard, useUpdateCreatorStatus } from "../../../../features/platform/api/creators";
import { motion, AnimatePresence } from "framer-motion";

export function AdminCreatorsView() {
  const { data: creators = [], isLoading, error } = useCreatorsDashboard();
  const updateStatus = useUpdateCreatorStatus();

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
        <p className="text-red-400 font-bold">Failed to load creators dashboard. Please try again.</p>
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
            <Award className="w-6 h-6 text-orange-500" />
            <span>Top Motorcycle Creators & Ambassador Program</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Manage verified motorcycle influencers, sponsored product review allocations, and video embed feeds.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <AnimatePresence>
          {creators.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No creator applications found.
            </motion.div>
          ) : (
            creators.map((c: any, idx: number) => (
              <motion.div 
                key={c.id} 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 sm:p-6 shadow-lg space-y-4 hover:border-orange-500/40 transition-colors group"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    {c.user?.avatar ? (
                      <img src={c.user.avatar} alt={c.user.name} className="w-10 h-10 rounded-full border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold uppercase">
                        {c.user?.name?.charAt(0) || "C"}
                      </div>
                    )}
                    <div>
                      <b className="text-base text-foreground font-black block truncate group-hover:text-orange-400 transition-colors">{c.user?.name}</b>
                      <span className="text-xs text-orange-400 font-bold block mt-0.5">Creator ID: <span className="text-foreground">{c.id.slice(-6)}</span></span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] uppercase tracking-wider font-black border ${c.status === "APPROVED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : c.status === "PENDING" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                    {c.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-muted font-bold uppercase text-[10px] block">Creator Bio</span>
                  <p className="text-foreground font-bold leading-relaxed bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">{c.bio || "No bio provided"}</p>
                </div>
                <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-extrabold">
                  <button 
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: c.id, status: c.status === "APPROVED" ? "REJECTED" : "APPROVED" })} 
                    className="text-orange-400 hover:underline disabled:opacity-50 transition-all"
                  >
                    {c.status === "APPROVED" ? "Revoke Approval" : "Approve Creator"}
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
