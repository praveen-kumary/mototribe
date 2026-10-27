import { Activity, Users, ShoppingBag, Map } from "lucide-react";
import { useAnalytics } from "../../../../features/platform/api/analytics";
import { motion, AnimatePresence } from "framer-motion";

export function AdminAnalyticsView() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load platform analytics. Please try again.</p>
      </div>
    );
  }

  const kpis = [
    { title: "Total Users", value: analytics.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Total Sellers", value: analytics.totalSellers.toLocaleString(), icon: ShoppingBag, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
    { title: "Active Orders", value: analytics.totalOrders.toLocaleString(), icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Active Events", value: analytics.activeEvents.toLocaleString(), icon: Map, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Activity className="w-6 h-6 text-orange-500" />
          <span>Platform Growth & Analytics</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted mt-1">Real-time metrics on user adoption, GMV, and community engagement across the app ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
            className={`p-5 sm:p-6 rounded-2xl border bg-surface/80 backdrop-blur-md shadow-xl ${kpi.border} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase text-muted tracking-wider">{kpi.title}</span>
              <div className={`p-2 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
            </div>
            <div className="text-3xl font-black text-foreground tracking-tight">{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl border border-border bg-surface/80 backdrop-blur-md shadow-xl"
        >
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 border-b border-border pb-3">Monthly GMV Trend</h3>
          <div className="h-48 flex items-end gap-2 justify-between pt-4">
            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
              <div key={i} className="w-full bg-orange-500/20 rounded-t-lg relative group transition-all hover:bg-orange-500/40" style={{ height: `${h}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-orange-400">
                  {h}k
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl border border-border bg-surface/80 backdrop-blur-md shadow-xl"
        >
          <h3 className="text-sm font-black text-foreground uppercase tracking-wider mb-4 border-b border-border pb-3">User Acquisition</h3>
          <div className="h-48 flex items-end gap-2 justify-between pt-4">
            {[30, 45, 60, 50, 70, 85, 100].map((h, i) => (
              <div key={i} className="w-full bg-emerald-500/20 rounded-t-lg relative group transition-all hover:bg-emerald-500/40" style={{ height: `${h}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black text-emerald-400">
                  {h}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
