"use client";
import { useState, useEffect } from "react";
import { AppShell, PageHeader } from "../../../components/app-shell";
import { Check, Calendar, MapPin, Users, Award, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from "next/navigation";
import { useEvents } from "../../../features/platform/api/events";

const INITIAL_RIDES = [
  { id: "r1", name: "Nandi Hills Sunrise Run", date: "Saturday · 5:30 AM", location: "Bengaluru", riders: 38, joined: false, isOfficial: false, type: "Community Run" },
  { id: "r2", name: "Coorg Coffee Loop", date: "3 August · 6:00 AM", location: "Mysore", riders: 16, joined: false, isOfficial: false, type: "Hill Loop" },
  { id: "r3", name: "Himalayan Owners Meetup", date: "10 August · 8:00 AM", location: "Pune", riders: 42, joined: false, isOfficial: false, type: "Model Meetup" }
];

export default function Rides() {
  const { user } = useAuth();
  const router = useRouter();
  const [rides, setRides] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const { data: apiEvents } = useEvents();

  useEffect(() => {
    const officialEvents = (apiEvents || []).filter((e: any) => e.status === "ACTIVE").map((e: any) => ({
      id: e.id,
      name: e.title,
      date: new Date(e.date).toLocaleDateString(),
      location: e.location,
      riders: e.currentAttendees || e.attendees || 0,
      joined: false,
      isOfficial: true,
      type: "Official Event"
    }));
    setRides([...officialEvents, ...INITIAL_RIDES]);
  }, [apiEvents]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleRSVP = (id: string) => {
    if (!user) {
      router.push("/sign-in?redirect=/rides");
      return;
    }
    setRides(rides.map(r => {
      if (r.id === id) {
        const isJoining = !r.joined;
        showToast(isJoining ? `RSVP Confirmed for ${r.name}!` : `RSVP Cancelled`);
        // Future improvement: use mutate to save attendees for official events
        return { ...r, joined: isJoining, riders: r.riders + (isJoining ? 1 : -1) };
      }
      return r;
    }));
  };

  return (
    <AppShell>
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-surface border border-emerald-500/30 text-emerald-400 rounded-xl shadow-2xl text-[13px] font-bold animate-in slide-in-from-right">
          {toast}
        </div>
      )}
      <PageHeader
        eyebrow="Community Rides & Official Events"
        title="Find your next road."
        body="Register for official MotoTribe national track days, join regional rider meetups, and tour India's best highways."
        action={<button onClick={() => { if (!user) router.push("/sign-in"); else showToast("Creating rides is currently available via Club & Admin portals."); }} className="rounded-xl bg-[#ff5c1a] hover:bg-[#e04c0d] transition px-5 py-3 text-sm font-bold">Create a ride</button>}
      />
      <main className="mx-auto max-w-[1200px] px-5 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rides.map(r => (
            <article key={r.id} className={`rounded-3xl border ${r.isOfficial ? "border-orange-500/60 bg-gradient-to-br from-[#1c1512] to-[#12161b] shadow-xl shadow-orange-500/5" : "border-border bg-surface"} p-6 hover:border-[#ff5c1a]/80 transition group flex flex-col justify-between relative overflow-hidden`}>
              {r.isOfficial && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-600 to-amber-500 text-foreground font-black text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>Official MotoTribe Event</span>
                </div>
              )}
              <div>
                <div className="h-32 rounded-2xl bg-[linear-gradient(135deg,#293b35,#17211d)] mb-5 relative overflow-hidden flex items-end p-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/60 text-foreground px-2.5 py-1 rounded-lg backdrop-blur-md border border-border">
                    {r.type}
                  </span>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                </div>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff5c1a] flex items-center gap-1.5 mb-2">
                  <Calendar className="w-3.5 h-3.5" /> {r.date}
                </p>
                <h2 className="text-xl font-black tracking-tight mb-3 text-foreground leading-snug">{r.name}</h2>
                <div className="flex items-center gap-4 text-xs font-bold text-muted mb-6">
                  <span className="flex items-center gap-1 text-foreground"><MapPin className="w-3.5 h-3.5 text-orange-500" /> {r.location}</span>
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-emerald-400" /> {r.riders} going</span>
                </div>
              </div>
              <button
                onClick={() => handleRSVP(r.id)}
                className={`w-full rounded-xl py-3.5 text-xs uppercase tracking-wider font-black transition flex items-center justify-center gap-2 shadow-md ${r.joined ? 'bg-emerald-500 text-black shadow-emerald-500/20' : r.isOfficial ? 'bg-orange-600 hover:bg-orange-500 text-foreground shadow-orange-600/30' : 'bg-black/10 dark:bg-white/10 hover:bg-white text-foreground hover:text-black'}`}
              >
                {r.joined ? <><Check className="w-4 h-4 text-black" /> RSVP Confirmed</> : r.isOfficial ? "Register for Official Event" : "RSVP to Ride"}
              </button>
            </article>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
