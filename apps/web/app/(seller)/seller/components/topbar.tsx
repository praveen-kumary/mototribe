import { useState } from "react";
import { Search, PlusCircle, Bell, Menu, LogOut, Home } from "lucide-react";
import Link from "next/link";

export const NOTIFICATIONS = [
  { type: "review", text: "New review received", detail: "5 star rating for HJC 4 LED Fog Light", time: "2h ago" },
  { type: "return", text: "Return request approved", detail: "Order #MT-125833", time: "4h ago" },
  { type: "order", text: "New order received", detail: "Order #MT-125843", time: "1d ago" },
  { type: "stock", text: "Low stock alert", detail: "Sarkraft Original Crash Guard", time: "1d ago" },
];

interface TopbarProps {
  user: { name: string; email: string; role: string };
  setMobileMenuOpen: (open: boolean) => void;
  onAddProduct: () => void;
  signOut: () => void;
}

export function SellerTopbar({ user, setMobileMenuOpen, onAddProduct, signOut }: TopbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-5 h-5 text-muted" />
        </button>
        <Link href="/" className="flex items-center gap-1.5 text-muted hover:text-foreground transition text-[12px] font-semibold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 px-3 py-1.5 rounded-lg border border-border">
          <Home className="w-3.5 h-3.5" /> Back to MotoTribe
        </Link>
        <div className="hidden lg:flex items-center gap-2 bg-[#15171b] border border-border rounded-lg px-3 py-2 w-[300px]">
          <Search className="w-4 h-4 text-muted" />
          <input placeholder="Search orders, products, customers..." className="bg-transparent text-[12px] outline-none w-full text-foreground placeholder:text-zinc-600" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="hidden sm:flex px-4 py-2 bg-[#ff5c1a] text-foreground text-[12px] font-bold rounded-lg hover:bg-[#e04c0d] transition items-center gap-1.5" onClick={onAddProduct}>
          <PlusCircle className="w-3.5 h-3.5" /> Add Product
        </button>
        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative hover:text-foreground transition cursor-pointer block">
            <Bell className="w-4.5 h-4.5 text-muted hover:text-foreground transition" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[7px] text-foreground grid place-items-center font-bold">3</span>
          </button>
          {notifOpen && (
            <div className="absolute top-8 right-0 w-[280px] bg-surface border border-border rounded-xl shadow-2xl p-3 z-50 text-left">
              <b className="text-[12px] block border-b border-border pb-2 mb-2 text-foreground">Notifications</b>
              <div className="space-y-2">
                {NOTIFICATIONS.slice(0, 3).map((n, i) => (
                  <div key={i} className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                    <p className="text-[11px] text-foreground font-bold">{n.text}</p>
                    <p className="text-[10px] text-muted leading-snug">{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-7 h-7 rounded-full bg-[#ff5c1a]/20 grid place-items-center text-[10px] font-bold text-[#ff5c1a]">{user.name[0]}</div>
          <div className="text-left hidden sm:block">
            <b className="text-[11px] block leading-tight">{user.name}</b>
            <span className="text-[9px] text-[#ff5c1a]">Pro Seller</span>
          </div>
          <button onClick={signOut} className="ml-1 p-1.5 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Sign out">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}

