"use client";

import { useGarageDashboard } from "../../../../features/platform/api/garage";
import { Loader2, Wrench } from "lucide-react";

export function SellerGarageView() {
  const { data: vehicles, isLoading, error } = useGarageDashboard();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff5c1a]" /></div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-500/10 rounded-xl">Failed to load garage network</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Garage Network</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles?.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-2xl">
            <Wrench className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No vehicles in the network.</p>
          </div>
        ) : (
          vehicles?.map((bike: any) => (
            <div key={bike.id} className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-3 hover:border-[#ff5c1a]/30 transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center font-bold text-foreground">
                  {bike.user.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-muted">Owner</div>
                  <div className="text-foreground font-bold">{bike.user.name}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <h3 className="text-xl font-black text-foreground italic">{bike.make} {bike.model}</h3>
                <div className="text-sm text-[#ff5c1a] font-bold">{bike.year}</div>
              </div>
              
              {bike.mods && (
                <div className="mt-2 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5 text-xs text-muted">
                  <span className="font-bold text-foreground block mb-1">Mods:</span>
                  {bike.mods}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
