import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";

export const NOTIFICATIONS = [
  { type: "system", text: "New Seller Application", detail: "GearMoto Inc requested approval", time: "10m ago" },
  { type: "alert", text: "High Server Load", detail: "API instances scaling up", time: "1h ago" },
  { type: "event", text: "New Event Proposal", detail: "Sunday Breakfast Ride", time: "3h ago" },
  { type: "content", text: "Blog post flagged", detail: "Community guidelines violation", time: "1d ago" },
  { type: "payment", text: "Payouts processed", detail: "Weekly settlement completed", time: "1d ago" }
];

interface TopbarProps {
  setMobileMenuOpen: (open: boolean) => void;
}

export function AdminTopbar({ setMobileMenuOpen }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-5 h-5 text-muted" />
        </button>
        <div className="hidden lg:flex items-center gap-2 bg-[#15171b] border border-border rounded-lg px-3 py-2 w-[400px]">
          <Search className="w-4 h-4 text-muted" />
          <input placeholder="Search orders, users, products, sellers..." className="bg-transparent text-[12px] outline-none w-full text-foreground placeholder:text-zinc-600" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative hover:text-foreground transition cursor-pointer block">
            <Bell className="w-4.5 h-4.5 text-muted hover:text-foreground transition" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[7px] text-foreground grid place-items-center font-bold">5</span>
          </button>
          {notifOpen && (
            <div className="absolute top-8 right-0 w-[280px] bg-surface border border-border rounded-xl shadow-2xl p-3 z-50 text-left">
              <b className="text-[12px] block border-b border-border pb-2 mb-2 text-foreground">System Alerts</b>
              <div className="space-y-2">
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer">
                    <p className="text-[11px] text-foreground font-bold">{n.text}</p>
                    <p className="text-[10px] text-muted leading-snug">{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff5c1a] to-[#e04c0d] grid place-items-center text-[11px] font-bold text-foreground shrink-0">P</div>
          <div className="text-left hidden sm:block"><b className="text-[11px] block leading-tight">Praveen Kumar</b><span className="text-[9px] text-muted">Super Admin</span></div>
        </div>
      </div>
    </header>
  );
}
