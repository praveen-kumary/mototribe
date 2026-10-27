"use client";

import { useAnalytics } from "../../../../features/platform/api/analytics";
import { Loader2, TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";

export function SellerAnalyticsView() {
  const { data: analytics, isLoading, error } = useAnalytics();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff5c1a]" /></div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-500/10 rounded-xl">Failed to load analytics</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Platform Analytics</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-muted mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold">Total Revenue</span>
          </div>
          <div className="text-3xl font-black text-foreground">${analytics?.revenue?.toFixed(2)}</div>
        </div>
        
        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-muted mb-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">Total Users</span>
          </div>
          <div className="text-3xl font-black text-foreground">{analytics?.users}</div>
        </div>

        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-muted mb-2">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">Total Orders</span>
          </div>
          <div className="text-3xl font-black text-foreground">{analytics?.orders}</div>
        </div>

        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-muted mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">Products</span>
          </div>
          <div className="text-3xl font-black text-foreground">{analytics?.products}</div>
        </div>
      </div>
      
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 h-[300px] flex items-center justify-center">
        <p className="text-muted italic">Advanced charts visualization would go here</p>
      </div>
    </div>
  );
}
