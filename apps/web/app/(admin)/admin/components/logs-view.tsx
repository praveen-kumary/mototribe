import { Terminal, ShieldAlert } from "lucide-react";
import { useSystemLogs } from "../../../../features/platform/api/logs";
import { motion, AnimatePresence } from "framer-motion";

export function AdminLogsView() {
  const { data: logs = [], isLoading, error } = useSystemLogs();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="h-96 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load system logs.</p>
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
            <Terminal className="w-6 h-6 text-orange-500" />
            <span>Platform Audit Logs</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Immutable security audit trail of all administrative actions and system alerts.</p>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-border rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
        <div className="p-3 border-b border-border bg-surface flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="ml-3 text-muted font-bold tracking-wider">root@mototribe-production-cluster:~# tail -f /var/log/admin_audit.log</span>
        </div>
        <div className="p-4 sm:p-6 h-[60vh] overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence>
            {logs.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-600">No logs generated yet.</motion.div>
            ) : (
              logs.map((log: any, idx: number) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }}
                  className="flex flex-col sm:flex-row sm:items-start gap-2 hover:bg-white/[0.02] p-1.5 rounded transition-colors"
                >
                  <span className="text-muted shrink-0 select-none">
                    [{new Date(log.createdAt).toISOString()}]
                  </span>
                  <span className={`shrink-0 font-bold ${
                    log.level === 'CRITICAL' ? 'text-red-500' :
                    log.level === 'WARN' ? 'text-amber-500' :
                    log.level === 'INFO' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>
                    [{log.level}]
                  </span>
                  <span className="text-muted shrink-0 font-bold">[{log.module}]</span>
                  <span className="text-foreground break-words">{log.message}</span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
