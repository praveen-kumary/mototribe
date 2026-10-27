import { useState } from "react";
import { Map, Plus, Users, Calendar } from "lucide-react";
import { useEvents, useCreateEvent, useUpdateEventStatus } from "../../../../features/platform/api/events";
import { motion, AnimatePresence } from "framer-motion";

export function AdminEventsView() {
  const { data: events = [], isLoading, error } = useEvents();
  const createEvent = useCreateEvent();
  const updateStatus = useUpdateEventStatus();

  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", location: "", maxAttendees: 100, date: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title) return;
    createEvent.mutate(newEvent, {
      onSuccess: () => {
        setNewEvent({ title: "", location: "", maxAttendees: 100, date: "" });
        setShowForm(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load events. Please try again.</p>
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
            <Map className="w-6 h-6 text-orange-500" />
            <span>Platform Rides & Meetups</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Manage official community rides, track days, and manufacturer events.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all">
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
          <span>{showForm ? "Cancel" : "Create Official Event"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            onSubmit={handleAdd} 
            className="rounded-2xl border border-orange-500/30 bg-surface p-5 sm:p-6 shadow-xl grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Event Title</label>
              <input required placeholder="e.g. Sunday Breakfast Ride" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Location / Route</label>
              <input required placeholder="e.g. Mumbai to Lonavala" value={newEvent.location} onChange={e=>setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Max Riders</label>
              <input required type="number" min="1" value={newEvent.maxAttendees} onChange={e=>setNewEvent({...newEvent, maxAttendees: Number(e.target.value)})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs font-extrabold text-muted block mb-1 uppercase">Date</label>
              <input required type="date" value={newEvent.date} onChange={e=>setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold outline-none focus:border-orange-500 transition-colors" />
            </div>
            <div className="sm:col-span-2 flex justify-end pt-2">
              <button type="submit" disabled={createEvent.isPending} className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {createEvent.isPending ? "Creating..." : "Publish Event"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <AnimatePresence>
          {events.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No official events scheduled.
            </motion.div>
          ) : (
            events.map((e: any, idx: number) => (
              <motion.div 
                key={e.id} 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 shadow-xl hover:border-orange-500/40 transition-colors group"
              >
                <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
                  <div className="flex flex-col">
                    <b className="text-lg text-foreground font-black group-hover:text-orange-400 transition-colors">{e.title}</b>
                    <span className="text-xs font-bold text-muted flex items-center gap-1 mt-1">
                      <Map className="w-3.5 h-3.5 text-orange-500" /> {e.location}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black border ${e.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}`}>
                    {e.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-black/5 dark:border-white/5">
                    <span className="text-muted font-bold flex items-center gap-1"><Calendar className="w-4 h-4 text-muted" /> Date</span>
                    <span className="text-foreground font-extrabold">{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-2.5 rounded-lg border border-black/5 dark:border-white/5">
                    <span className="text-muted font-bold flex items-center gap-1"><Users className="w-4 h-4 text-muted" /> Riders</span>
                    <span className="text-emerald-400 font-extrabold">{e.currentAttendees} / {e.maxAttendees}</span>
                  </div>
                </div>
                <div className="pt-4 mt-3 border-t border-border flex justify-end">
                  <button 
                    disabled={updateStatus.isPending}
                    onClick={() => updateStatus.mutate({ id: e.id, status: e.status === "ACTIVE" ? "CANCELLED" : "ACTIVE" })} 
                    className="text-orange-400 text-xs font-bold hover:underline disabled:opacity-50"
                  >
                    {e.status === "ACTIVE" ? "Cancel Event" : "Re-activate"}
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
