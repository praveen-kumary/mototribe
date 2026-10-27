"use client";

import { useEvents, useUpdateEventStatus } from "../../../../features/platform/api/events";
import { Loader2, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";

export function SellerEventsView() {
  const { data: events, isLoading, error } = useEvents();
  const updateStatus = useUpdateEventStatus();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff5c1a]" /></div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-500/10 rounded-xl">Failed to load events</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Platform Events</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events?.length === 0 ? (
          <div className="col-span-full p-12 text-center border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-2xl">
            <Calendar className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No events scheduled.</p>
          </div>
        ) : (
          events?.map((ev: any) => (
            <div key={ev.id} className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 group hover:border-[#ff5c1a]/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-foreground text-lg">{ev.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <MapPin className="w-3 h-3" />
                    <span>{ev.location}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${ev.status === "UPCOMING" ? "bg-emerald-500/10 text-emerald-500" : ev.status === "PENDING" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>
                  {ev.status}
                </span>
              </div>
              <p className="text-sm text-muted mb-4 line-clamp-2">{ev.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                <div className="text-xs text-muted">
                  By {ev.seller ? ev.seller.storeName : "Platform"}
                </div>
                
                {ev.status === "PENDING" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus.mutate({ id: ev.id, status: "UPCOMING" })} className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition" title="Approve">
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => updateStatus.mutate({ id: ev.id, status: "CANCELLED" })} className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition" title="Reject">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
