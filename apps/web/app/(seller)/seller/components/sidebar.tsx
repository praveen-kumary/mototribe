import { Box, ShoppingBag, RotateCcw, Package, DollarSign, CreditCard, Settings, Truck, BarChart3, TrendingUp, Store, Star, X, MessageSquare, LogOut } from "lucide-react";

export const SIDEBAR_SECTIONS = [
  { title: "SELL", items: [
    { icon: Box, label: "Products", badge: true },
    { icon: ShoppingBag, label: "Orders", badge: true },
    { icon: MessageSquare, label: "Buyer Messages", badge: true },
    { icon: RotateCcw, label: "Returns & Refunds" },
  ]},
  { title: "MANAGE", items: [
    { icon: Package, label: "Inventory" },
    { icon: DollarSign, label: "Pricing" },
    { icon: CreditCard, label: "Coupons" },
    { icon: Settings, label: "Store Settings" },
    { icon: Truck, label: "Shipping Settings" },
  ]},
  { title: "GROW", items: [
    { icon: BarChart3, label: "Analytics" },
    { icon: TrendingUp, label: "Marketing", isNew: true },
    { icon: Store, label: "Store Performance" },
    { icon: Star, label: "Reviews" },
  ]},
  { title: "PAYOUTS", items: [
    { icon: DollarSign, label: "Payouts" },
    { icon: CreditCard, label: "Transactions" },
  ]},
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  productsCount: number;
  ordersCount: number;
  messagesCount?: number;
  signOut: () => void;
}

export function SellerSidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, productsCount, ordersCount, messagesCount = 0, signOut }: SidebarProps) {
  const getBadge = (label: string) => {
    if (label === "Products") return productsCount;
    if (label === "Orders") return ordersCount;
    if (label === "Buyer Messages") return messagesCount > 0 ? messagesCount : undefined;
    return undefined;
  };

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex w-[240px] flex-shrink-0 bg-surface border-r border-border flex-col h-full overflow-y-auto hide-scrollbar">
        <div className="p-4 flex items-center gap-3 border-b border-border shrink-0">
          <span className="text-[18px] font-black italic tracking-[-0.06em]"><span className="text-[#ff5c1a]">🏍</span> MOTOTRIBE</span>
          <span className="text-[8px] bg-[#ff5c1a]/20 text-[#ff5c1a] font-bold px-1.5 py-0.5 rounded ml-auto">SELLER</span>
        </div>

        <div className="flex-1 px-2 py-3 space-y-3 overflow-y-auto hide-scrollbar">
          <button onClick={() => setActiveTab("Dashboard")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition ${activeTab === "Dashboard" ? "bg-[#ff5c1a] text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>

          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-1">{section.title}</p>
              {section.items.map((link: any) => (
                <button key={link.label} onClick={() => setActiveTab(link.label)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition ${activeTab === link.label ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
                  <div className="flex items-center gap-2.5">
                    <link.icon className={`h-3.5 w-3.5 ${activeTab === link.label ? "text-[#ff5c1a]" : ""}`} />
                    {link.label}
                  </div>
                  <div className="flex items-center gap-1">
                    {link.isNew && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">New</span>}
                    {link.badge && getBadge(link.label) !== undefined && <span className="text-[10px] bg-black/5 dark:bg-white/5 text-muted px-1.5 py-0.5 rounded">{getBadge(link.label)}</span>}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-border shrink-0 space-y-2">
          <div className="rounded-xl bg-gradient-to-br from-[#1a0f07] to-[#0c0d12] border border-orange-900/30 p-3 text-center">
            <b className="text-[12px]">Increase your sales</b>
            <p className="text-[10px] text-muted mt-0.5">Reach more riders</p>
            <button onClick={() => setActiveTab("Marketing")} className="mt-2 w-full py-2 bg-[#ff5c1a] text-foreground text-[11px] font-bold rounded-lg hover:bg-[#e04c0d] transition">Promote Products</button>
          </div>
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold hover:bg-red-500/20 transition">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE SIDEBAR ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-[260px] h-full bg-surface flex flex-col overflow-y-auto hide-scrollbar">
            <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
              <span className="text-[18px] font-black italic tracking-[-0.06em]"><span className="text-[#ff5c1a]">🏍</span> MOTOTRIBE</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5 text-muted" /></button>
            </div>
            
            <div className="flex-1 px-2 py-3 space-y-3 overflow-y-auto hide-scrollbar">
              <button onClick={() => { setActiveTab("Dashboard"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition ${activeTab === "Dashboard" ? "bg-[#ff5c1a] text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                <BarChart3 className="w-4 h-4" /> Dashboard
              </button>

              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.title}>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-1 mt-3">{section.title}</p>
                  {section.items.map((link: any) => (
                    <button key={link.label} onClick={() => { setActiveTab(link.label); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition ${activeTab === link.label ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
                      <div className="flex items-center gap-2.5">
                        <link.icon className={`h-4 w-4 ${activeTab === link.label ? "text-[#ff5c1a]" : ""}`} />
                        {link.label}
                      </div>
                      <div className="flex items-center gap-1">
                        {link.isNew && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">New</span>}
                        {link.badge && getBadge(link.label) !== undefined && <span className="text-[10px] bg-black/5 dark:bg-white/5 text-muted px-1.5 py-0.5 rounded">{getBadge(link.label)}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-border shrink-0">
              <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[12px] font-bold hover:bg-red-500/20 transition">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

