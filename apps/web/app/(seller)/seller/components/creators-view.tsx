"use client";

import { useCreatorsDashboard, useUpdateCreatorStatus } from "../../../../features/platform/api/creators";
import { Loader2, Star, Youtube, Instagram, CheckCircle, XCircle } from "lucide-react";

export function SellerCreatorsView() {
  const { data: creators, isLoading, error } = useCreatorsDashboard();
  const updateStatus = useUpdateCreatorStatus();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff5c1a]" /></div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-500/10 rounded-xl">Failed to load creators</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Creator Applications</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {creators?.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-2xl">
            <Star className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No creators found.</p>
          </div>
        ) : (
          creators?.map((creator: any) => (
            <div key={creator.id} className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center text-xl font-bold text-foreground">
                    {creator.user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold">{creator.user.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${creator.status === "APPROVED" ? "bg-emerald-500/20 text-emerald-500" : creator.status === "PENDING" ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"}`}>
                      {creator.status}
                    </span>
                  </div>
                </div>
                {creator.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus.mutate({ id: creator.id, status: "APPROVED" })} className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition" title="Approve">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button onClick={() => updateStatus.mutate({ id: creator.id, status: "REJECTED" })} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition" title="Reject">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted italic line-clamp-3">"{creator.bio}"</p>
              
              {creator.platforms && (
                <div className="flex gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                  {creator.platforms.youtube && (
                    <a href={creator.platforms.youtube} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 transition">
                      <Youtube className="w-4 h-4" /> YouTube
                    </a>
                  )}
                  {creator.platforms.instagram && (
                    <a href={creator.platforms.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-pink-500 hover:text-pink-400 transition">
                      <Instagram className="w-4 h-4" /> Instagram
                    </a>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
