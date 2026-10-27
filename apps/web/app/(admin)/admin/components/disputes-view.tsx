import { AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useDisputes, useUpdateDisputeStatus } from "../../../../features/platform/api/disputes";
import { motion, AnimatePresence } from "framer-motion";

export function AdminDisputesView() {
  const { data: disputes = [], isLoading, error } = useDisputes();
  const updateStatus = useUpdateDisputeStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load order disputes.</p>
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
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Order Disputes & Resolutions</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Review and mediate conflicts between buyers and sellers on the platform.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <AnimatePresence>
          {disputes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No active disputes requiring mediation.
            </motion.div>
          ) : (
            disputes.map((d: any, idx: number) => (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 shadow-xl hover:border-red-500/40 transition-colors flex flex-col md:flex-row gap-4 justify-between"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${
                      d.status === 'RESOLVED' ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : 
                      "bg-red-500/15 text-red-400 border-red-500/30"
                    }`}>
                      {d.status}
                    </span>
                    <span className="text-xs font-bold text-muted">Order #{d.orderId}</span>
                  </div>
                  <h3 className="text-sm font-black text-foreground">Dispute Reason: {d.reason}</h3>
                  <p className="text-xs text-muted">{d.description}</p>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px] border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-4">
                  <div className="text-xs bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
                    <span className="text-muted block uppercase text-[10px] font-bold">Buyer</span>
                    <strong className="text-foreground">{d.buyer?.name || "Unknown"}</strong>
                  </div>
                  <div className="text-xs bg-black/40 p-2 rounded-lg border border-black/5 dark:border-white/5">
                    <span className="text-muted block uppercase text-[10px] font-bold">Seller</span>
                    <strong className="text-orange-400">{d.seller?.storeName || "Unknown Seller"}</strong>
                  </div>
                  {d.status !== "RESOLVED" && (
                    <button 
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ id: d.id, status: 'RESOLVED' })}
                      className="mt-2 w-full px-4 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
