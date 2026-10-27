import { useState } from "react";
import { Wrench, MapPin, Plus, Trash2, ShieldCheck, Star } from "lucide-react";
import { useGarageDashboard } from "../../../../features/platform/api/garage";
import { motion, AnimatePresence } from "framer-motion";

export function AdminGarageView() {
  const { data: vehicles = [], isLoading, error } = useGarageDashboard();

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
        <p className="text-red-400 font-bold">Failed to load garage network data. Please try again.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Wrench className="w-6 h-6 text-orange-500" />
            <span>Live Garage & Fitment Network Dashboard</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Real-time feed of riders' garage vehicles and fitment activities across the platform.
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <AnimatePresence>
          {vehicles.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-2 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border"
            >
              No vehicles found in the network yet.
            </motion.div>
          ) : (
            vehicles.map((v: any, idx: number) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 sm:p-6 shadow-xl flex flex-col justify-between hover:border-orange-500/40 transition group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                    <span className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED RIDER
                    </span>
                    <span className="text-xs font-bold text-muted">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-start gap-3">
                    {v.user?.avatar ? (
                      <img src={v.user.avatar} alt={v.user.name} className="w-10 h-10 rounded-full border border-border" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold uppercase">
                        {v.user?.name?.charAt(0) || "R"}
                      </div>
                    )}
                    <div>
                      <b className="text-base font-black text-foreground block group-hover:text-orange-400 transition-colors">
                        {v.year} {v.bikeModelId || "Custom Build"} {v.nickname ? `"${v.nickname}"` : ""}
                      </b>
                      <span className="text-xs font-bold text-muted flex items-center gap-1 mt-0.5">
                        Owner: {v.user?.name || "Unknown Rider"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between text-xs font-extrabold">
                  <span className="text-foreground bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5">
                    <strong>{v.odometerKm?.toLocaleString() || 0}</strong> KM Clocked
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
