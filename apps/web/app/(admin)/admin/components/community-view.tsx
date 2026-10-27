import { useState } from "react";
import { MessageSquare, Users, ShieldAlert, Check } from "lucide-react";
import { useCommunityGroups } from "../../../../features/platform/api/community";
import { motion, AnimatePresence } from "framer-motion";

export function AdminCommunityView() {
  const { data: groups = [], isLoading, error } = useCommunityGroups();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load community groups.</p>
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
            <MessageSquare className="w-6 h-6 text-orange-500" />
            <span>Community Forums & Moderation</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Manage discussion groups, flag toxic content, and oversee rider communities.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {groups.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-3 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No community groups active.
            </motion.div>
          ) : (
            groups.map((g: any, idx: number) => (
              <motion.div 
                key={g.id}
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 shadow-xl hover:border-orange-500/40 transition-colors"
              >
                <div className="flex items-start justify-between border-b border-border pb-3 mb-3">
                  <div>
                    <h3 className="text-base font-black text-foreground">{g.name}</h3>
                    <p className="text-xs text-muted mt-1 line-clamp-2">{g.description || "Community group"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-muted">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4 text-muted" /> {g.membersCount || 0} Members</span>
                  <span className="flex items-center gap-1 text-orange-400"><MessageSquare className="w-4 h-4" /> {g.postsCount || 0} Posts</span>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <button className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1 w-full justify-center">
                    <ShieldAlert className="w-4 h-4" /> View Reported Posts
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
