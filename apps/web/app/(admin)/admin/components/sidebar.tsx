import { LayoutDashboard, Users, Store, Package, ShoppingBag, CreditCard, FileText, AlertTriangle, Tag, Megaphone, Truck, Globe, Activity, MessageSquare, BarChart3, TrendingUp, Database, Settings, Shield, LogOut, X } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  signOut: () => void;
  pendingSellersCount: number;
  productsCount: number;
  ordersCount: number;
}

export function AdminSidebar({ activeTab, setActiveTab, mobileMenuOpen, setMobileMenuOpen, signOut, pendingSellersCount, productsCount, ordersCount }: SidebarProps) {
  const navSections = [
    { title: "MANAGEMENT", items: [
      { icon: Users, label: "Users" }, 
      { icon: Store, label: "Sellers", badge: pendingSellersCount || undefined },
      { icon: Package, label: "Products", badge: productsCount }, 
      { icon: ShoppingBag, label: "Orders", badge: ordersCount },
      { icon: CreditCard, label: "Returns & Refunds" }, 
      { icon: CreditCard, label: "Payouts" },
      { icon: FileText, label: "Reviews" }, 
      { icon: AlertTriangle, label: "Disputes & Chats" },
    ]},
    { title: "OPERATIONS", items: [
      { icon: Tag, label: "Coupons & Offers" }, 
      { icon: Megaphone, label: "Marketing" },
      { icon: Truck, label: "Shipping" }, 
      { icon: Globe, label: "Garage Network" },
      { icon: Activity, label: "Events" },
    ]},
    { title: "CONTENT", items: [
      { icon: MessageSquare, label: "Community" }, 
      { icon: FileText, label: "Blog & Guides" },
      { icon: Users, label: "Creators" },
    ]},
    { title: "REPORTS & ANALYTICS", items: [
      { icon: BarChart3, label: "Analytics" }, 
      { icon: TrendingUp, label: "Sales Reports" },
      { icon: Database, label: "System Logs" },
    ]},
    { title: "SYSTEM", items: [
      { icon: Settings, label: "Settings" }, 
      { icon: Shield, label: "Roles & Permissions" },
    ]},
  ];

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex w-[240px] flex-shrink-0 bg-surface border-r border-border flex-col h-full overflow-y-auto hide-scrollbar">
        <div className="p-4 flex items-center gap-2 border-b border-border shrink-0">
          <span className="text-[16px] font-black italic tracking-[-0.06em]"><span className="text-[#ff5c1a]">🏍</span> MOTOTRIBE</span>
          <span className="text-[7px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded ml-auto uppercase tracking-wider">SuperAdmin</span>
        </div>
        <div className="flex-1 px-2 py-3 space-y-3 overflow-y-auto hide-scrollbar">
          <button onClick={() => setActiveTab("Dashboard")} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition ${activeTab === "Dashboard" ? "bg-[#ff5c1a] text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </button>
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.15em] px-3 mb-1">{section.title}</p>
              {section.items.map((item: any) => (
                <button key={item.label} onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${activeTab === item.label ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
                  <div className="flex items-center gap-2.5"><item.icon className={`h-3.5 w-3.5 ${activeTab === item.label ? "text-[#ff5c1a]" : ""}`} />{item.label}</div>
                  {item.badge !== undefined && <span className="text-[8px] bg-black/5 dark:bg-white/5 text-muted font-bold px-1.5 py-0.5 rounded">{item.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border shrink-0">
          <button onClick={signOut} className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg text-[11px] font-bold transition">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE SIDEBAR ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative z-10 w-[260px] h-full bg-surface flex flex-col overflow-y-auto hide-scrollbar">
            <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
              <span className="text-[16px] font-black italic tracking-[-0.06em]"><span className="text-[#ff5c1a]">🏍</span> MOTOTRIBE</span>
              <button onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5 text-muted" /></button>
            </div>
            <div className="flex-1 px-2 py-3 space-y-3 overflow-y-auto hide-scrollbar">
              <button onClick={() => { setActiveTab("Dashboard"); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition ${activeTab === "Dashboard" ? "bg-[#ff5c1a] text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </button>
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-[0.15em] px-3 mb-1 mt-3">{section.title}</p>
                  {section.items.map((item: any) => (
                    <button key={item.label} onClick={() => { setActiveTab(item.label); setMobileMenuOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition ${activeTab === item.label ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}>
                      <div className="flex items-center gap-2.5"><item.icon className={`h-4 w-4 ${activeTab === item.label ? "text-[#ff5c1a]" : ""}`} />{item.label}</div>
                      {item.badge !== undefined && <span className="text-[8px] bg-black/5 dark:bg-white/5 text-muted font-bold px-1.5 py-0.5 rounded">{item.badge}</span>}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
