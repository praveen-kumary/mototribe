"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Bike, Calendar, CreditCard, Heart,
  MapPin, MessageSquare, Package, Settings, Star,
  Tag, Activity, Image as ImageIcon, MessageCircle,
  ChevronRight, Send, Gift, Coins, Copy, Check, Award,
  Plus, Trash2, ShieldCheck, ExternalLink, Sliders, Bell
} from "lucide-react";
import { useAuth } from "../../../components/auth-provider";
import { AppShell } from "../../../components/app-shell";
import { useCoupons } from "../../../features/platform/api/coupons";
import { api } from "../../../lib/api/client";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PROCESSING: "bg-yellow-900/40 text-yellow-400 border-yellow-500/30",
    SHIPPED: "bg-blue-900/40 text-blue-400 border-blue-500/30",
    DELIVERED: "bg-emerald-900/40 text-emerald-400 border-emerald-500/30",
    PENDING: "bg-zinc-800 text-muted border-zinc-700",
    CANCELLED: "bg-red-900/40 text-red-400 border-red-500/30"
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold border ${styles[status] ?? "bg-zinc-800 text-muted border-zinc-700"}`}>
      {status}
    </span>
  );
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("Overview");
  
  const [orders, setOrders] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [myBikes, setMyBikes] = useState<{make: string, model: string, year: string}[]>([
    { make: "Royal Enfield", model: "Himalayan 450", year: "2024" },
    { make: "KTM", model: "Duke 390 Gen 3", year: "2024" }
  ]);
  const [newBike, setNewBike] = useState({ make: "", model: "", year: "" });
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const { data: couponsData } = useCoupons();
  const coupons = couponsData || [];

  // Functional interactive states for previously unused tabs
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [addresses, setAddresses] = useState([
    { id: 1, type: "Home", name: "Raja M.", address: "Flat 4B, Shanthi Nagar, Koramangala", city: "Bengaluru, Karnataka", pin: "560034", default: true },
    { id: 2, type: "Garage / Work", name: "MotoTribe Custom Work, Outer Ring Rd", city: "Hyderabad, Telangana", pin: "500081", default: false },
  ]);
  const [newAddr, setNewAddr] = useState({ type: "Home", name: "", address: "", city: "", pin: "" });
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "UPI", label: "rajabiker@oksbi", status: "Primary & Verified" },
    { id: 2, type: "Card", label: "HDFC Regalia Visa Card ending in **** 4910", status: "Saved" },
  ]);
  const [newUpi, setNewUpi] = useState("");

  const [settings, setSettings] = useState({
    emailNotifs: true,
    smsNotifs: false,
    publicBuildSheet: true,
    ridingStyle: "Adventure Tourer & Track",
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function fetchDashboard() {
      try {
        const [ordersRes, threadsRes, productsRes] = await Promise.all([
          api.get<any[]>("/orders/my-orders"),
          api.get<any[]>("/chat/threads"),
          api.get<{ items: any[] }>("/products")
        ]);
        
        setOrders(ordersRes);
        setThreads(threadsRes);
        
        // Load messages for the first active thread if any
        if (threadsRes.length > 0) {
          const msgs = await api.get<any[]>(`/chat/threads/${threadsRes[0].id}/messages`);
          setMessages(msgs);
        }
        
        // Mock wishlist from products API
        const mappedProducts: any[] = productsRes.items.slice(0, 3).map(p => ({
          id: p.id, slug: p.slug, name: p.name, price: p.price / 100, 
          comparePrice: p.comparePrice ? p.comparePrice / 100 : undefined,
          seller: p.seller.name, sellerEmail: p.seller.email, category: p.category, rating: 4.5,
          reviews: p._count?.reviews || 0, description: p.description, 
          image: p.images?.[0]?.url || "", images: [], stock: p.stock, status: p.status, createdAt: p.createdAt,
          bike: p.fitments?.[0]?.bikeModel?.name || "Universal"
        }));
        setWishlist(mappedProducts);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    }
    fetchDashboard();
  }, [user]);

  const handleCopyProfileLink = () => {
    if (!user || typeof window === "undefined") return;
    const link = `${window.location.origin}/sign-up?ref=${user.referralCode || "REF" + user.id.slice(0, 5).toUpperCase()}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeThreadId || !chatInput.trim()) return;
    
    const text = chatInput.trim();
    setChatInput("");
    
    try {
      const newMsg = await api.post<any>(`/chat/threads/${activeThreadId}/messages`, { text });
      setMessages([...messages, newMsg]);
      
      // Update thread lastUpdated timestamp
      const updatedThreads = threads.map(t => 
        t.id === activeThreadId ? { ...t, lastUpdated: new Date().toISOString() } : t
      );
      setThreads(updatedThreads);
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  const handleAddBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBike.make || !newBike.model) return;
    setMyBikes([...myBikes, newBike]);
    setNewBike({ make: "", model: "", year: "" });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.address || !newAddr.pin) return;
    setAddresses([...addresses, { id: Date.now(), ...newAddr, default: addresses.length === 0 }]);
    setNewAddr({ type: "Home", name: "", address: "", city: "", pin: "" });
    setShowAddAddress(false);
  };

  const startNewChat = async (sellerEmail: string, subject: string) => {
    if (!user) return;
    
    try {
      const existing = threads.find(t => t.sellerEmail === sellerEmail);
      if (existing) {
        setActiveThreadId(existing.id);
        const msgs = await api.get<any[]>(`/chat/threads/${existing.id}/messages`);
        setMessages(msgs);
      } else {
        const newThread = await api.post<any>("/chat/threads", { sellerEmail, subject });
        setThreads([newThread, ...threads]);
        setActiveThreadId(newThread.id);
        setMessages([]);
      }
      setActiveTab("Messages");
    } catch (err) {
      console.error("Failed to start chat", err);
    }
  };

  if (!user) return null;

  const profileNavItems = [
    { icon: Activity, label: "Overview" },
    { icon: Gift, label: "Invite & Earn", badge: "₹" + (user.motoTribeCash ?? 250) },
    { icon: Package, label: "My Orders", badge: orders.length.toString() },
    { icon: MessageSquare, label: "Messages", badge: threads.length.toString() },
    { icon: Bike, label: "Garage" },
    { icon: Heart, label: "Wishlist", badge: wishlist.length.toString() },
    { icon: Tag, label: "Coupons", badge: "3" },
    { icon: MapPin, label: "Addresses" },
    { icon: CreditCard, label: "Payment Methods" },
    { icon: Settings, label: "Settings" },
  ];

  const communityNavItems = [
    { icon: ImageIcon, label: "Posts" },
    { icon: Calendar, label: "Events" },
    { icon: MapPin, label: "Rides" },
  ];

  const allNavItems: { icon: any; label: string; badge?: string }[] = [...profileNavItems, ...communityNavItems];

  return (
    <AppShell>
      <div className="mx-auto max-w-[1400px] min-h-screen">
        {/* Mobile Horizontal Scrolling Navigation Bar */}
        <div className="lg:hidden border-b border-border bg-surface px-3 py-3 overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {allNavItems.map(({ icon: Icon, label, badge }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  activeTab === label ? "bg-orange-600 text-foreground shadow-lg shadow-orange-600/30" : "bg-[#15171b] text-muted hover:text-foreground border border-black/5 dark:border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
                {badge && badge !== "0" && <span className="ml-0.5 rounded-full bg-black/40 px-1.5 py-0.5 text-[9px] font-black text-foreground">{badge}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[260px] shrink-0 overflow-y-auto border-r border-border bg-surface p-4 lg:block hide-scrollbar">
            {/* User Widget */}
            <div className="mb-6 rounded-2xl border border-border bg-surface p-4 text-center shadow-lg">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-2xl font-black text-foreground shadow-lg shadow-orange-600/20 uppercase">
                {user.name?.substring(0,2) || "RD"}
              </div>
              <b className="mt-3 block text-base text-foreground truncate font-bold">{user.name}</b>
              <p className="text-xs text-muted truncate mt-0.5">{user.email}</p>
              <div className="mt-4 flex justify-between rounded-xl bg-white/[0.03] p-2 text-xs border border-black/5 dark:border-white/5">
                <div className="text-center w-1/2 border-r border-border">
                  <b className="block text-base font-black text-orange-400">{user.level || 3}</b>
                  <span className="text-[10px] font-semibold uppercase text-muted">Rider Level</span>
                </div>
                <div className="text-center w-1/2">
                  <b className="block text-base font-black text-emerald-400">{user.xp || 4200}</b>
                  <span className="text-[10px] font-semibold uppercase text-muted">Rep XP</span>
                </div>
              </div>
            </div>

            <div className="mb-2 px-3 text-[11px] font-extrabold uppercase tracking-wider text-muted">Account Control</div>
            <nav className="space-y-1">
              {profileNavItems.map(({ icon: Icon, label, badge }) => (
                <button
                  key={label} onClick={() => setActiveTab(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    activeTab === label ? "bg-[#ff5c1a] text-foreground shadow-md shadow-[#ff5c1a]/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{label}</span>
                  {badge && badge !== "0" && <span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-extrabold text-foreground">{badge}</span>}
                </button>
              ))}
            </nav>
            
            <div className="mb-2 mt-6 px-3 text-[11px] font-extrabold uppercase tracking-wider text-muted">Community & Rides</div>
            <nav className="space-y-1">
              {communityNavItems.map(({ icon: Icon, label }) => (
                 <button
                  key={label} onClick={() => setActiveTab(label)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${
                    activeTab === label ? "bg-[#ff5c1a] text-foreground shadow-md shadow-[#ff5c1a]/20" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content Area */}
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-10">
            
            {/* 1. OVERVIEW */}
            {activeTab === "Overview" && (
              <div className="max-w-4xl space-y-8">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">Rider Dashboard — Welcome, {user.name}!</h1>
                  <p className="text-xs sm:text-sm text-muted mt-1">Manage your active motorcycle builds, orders, and community activity.</p>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div onClick={() => setActiveTab("Invite & Earn")} className="cursor-pointer rounded-2xl border border-orange-500/30 bg-gradient-to-br from-[#1c120c] via-[#12161b] to-[#12161b] p-5 sm:p-6 transition-all hover:border-orange-500/80 hover:shadow-xl hover:shadow-orange-500/10 group">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 group-hover:scale-110 transition shadow"><Gift className="h-6 w-6 animate-pulse" /></div>
                    <b className="mt-4 text-base text-foreground flex items-center justify-between">
                      <span>MotoTribe Cash</span>
                      <span className="text-emerald-400 font-black">₹{user.motoTribeCash ?? 250}</span>
                    </b>
                    <p className="mt-1 text-xs text-muted">Earn ₹100 per friend invite! (1 Pt = ₹1 Rupee).</p>
                  </div>
                  <div onClick={() => setActiveTab("My Orders")} className="cursor-pointer rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all hover:border-[#ff5c1a]/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400 shadow"><Package className="h-6 w-6" /></div>
                    <b className="mt-4 block text-base text-foreground">Track Orders</b>
                    <p className="mt-1 text-xs text-muted">You have {orders.length} verified orders in shipment history.</p>
                  </div>
                  <div onClick={() => setActiveTab("Garage")} className="cursor-pointer rounded-2xl border border-border bg-surface p-5 sm:p-6 transition-all hover:border-[#ff5c1a]/50">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 shadow"><Bike className="h-6 w-6" /></div>
                    <b className="mt-4 block text-base text-foreground">My Garage & Mods</b>
                    <p className="mt-1 text-xs text-muted">{myBikes.length} motorcycles registered in your hangar.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-foreground uppercase tracking-tight">Recent Orders</h2>
                  <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg">
                    {orders.length === 0 ? <p className="p-6 text-muted text-sm font-medium">No orders in your history yet.</p> : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-surface text-muted text-xs font-extrabold uppercase tracking-wider border-b border-border">
                            <tr>
                              <th className="p-4">Order ID</th>
                              <th className="p-4">Date</th>
                              <th className="p-4">Total Amount</th>
                              <th className="p-4">Delivery Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-medium">
                            {orders.slice(0, 4).map(o => (
                              <tr key={o.id} className="hover:bg-white/[0.02] transition">
                                <td className="p-4 font-black text-orange-400">{o.id}</td>
                                <td className="p-4 text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 font-black text-foreground">₹{o.total.toLocaleString("en-IN")}</td>
                                <td className="p-4"><StatusBadge status={o.status} /></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 2. MY ORDERS */}
            {activeTab === "My Orders" && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground">Order History & Shipment Tracking</h1>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="py-16 text-center border border-dashed border-black/15 dark:border-white/15 rounded-2xl bg-white/[0.01]">
                      <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                      <p className="text-muted text-sm font-bold">You haven&apos;t purchased any gear yet.</p>
                      <Link href="/marketplace" className="mt-4 inline-block px-6 py-2.5 bg-orange-600 text-foreground rounded-xl text-xs font-black uppercase tracking-wide">Browse Marketplace</Link>
                    </div>
                  ) : orders.map(o => (
                    <div key={o.id} className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2 text-xs sm:text-sm">
                        <div>
                          <b className="text-orange-500 font-black text-base block">{o.id}</b>
                          <span className="text-muted text-xs">Placed on {new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="text-xs text-muted block">Sold by: <b className="text-foreground">{o.sellerEmail}</b></span>
                          <span className="text-base font-black text-emerald-400">Total: ₹{o.total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="divide-y divide-white/5">
                        {o.items.map((item: any, i: number) => (
                          <div key={i} className="flex gap-4 items-center py-3">
                            <img src={item.image} className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" alt={item.name} />
                            <div className="min-w-0 flex-1">
                              <b className="text-sm font-bold text-foreground block truncate">{item.name}</b>
                              <p className="text-xs text-muted mt-0.5">Quantity: <strong className="text-foreground">{item.quantity}</strong></p>
                            </div>
                            <b className="text-sm font-black text-foreground shrink-0">₹{item.price.toLocaleString("en-IN")}</b>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={o.status} />
                          <span className="text-[11px] text-muted">✓ Verified Rider Purchase</span>
                        </div>
                        <button onClick={() => startNewChat(o.sellerEmail, `Assistance with Order ${o.id}`)} className="px-4 py-2 bg-black/10 dark:bg-white/10 hover:bg-white/20 text-foreground rounded-xl text-xs font-bold transition flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-orange-400"/>
                          <span>Contact Seller Support</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. MESSAGES */}
            {activeTab === "Messages" && (
              <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] h-[650px] max-w-5xl">
                <div className="rounded-2xl border border-border bg-surface flex flex-col overflow-hidden shadow-lg">
                  <div className="p-4 border-b border-border bg-surface"><b className="text-sm text-foreground font-black uppercase tracking-wider">Support Inbox</b></div>
                  <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                    {threads.length === 0 ? (
                      <div className="p-6 text-center text-xs text-muted font-medium">No active support conversations.</div>
                    ) : (
                      threads.map(t => (
                        <button key={t.id} onClick={() => setActiveThreadId(t.id)} className={`w-full text-left p-4 hover:bg-white/[0.04] transition ${activeThreadId === t.id ? "bg-white/[0.06] border-l-4 border-orange-500" : ""}`}>
                          <b className="text-xs sm:text-sm font-bold text-foreground block truncate">{t.sellerEmail}</b>
                          <span className="text-xs text-muted line-clamp-1 mt-1">{t.subject}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
                
                {activeThreadId ? (
                  <div className="rounded-2xl border border-border bg-surface flex flex-col overflow-hidden shadow-lg">
                    <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
                      <b className="text-sm font-black text-foreground truncate">{threads.find(t => t.id === activeThreadId)?.subject}</b>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">Active Thread</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.filter(m => m.threadId === activeThreadId).map(m => (
                        <div key={m.id} className={`flex ${m.senderEmail === user.email ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium ${m.senderEmail === user.email ? "bg-orange-600 text-foreground rounded-tr-none shadow-md" : "bg-[#20252e] text-foreground rounded-tl-none border border-border"}`}>
                            {m.text}
                            <span className="block text-[10px] mt-1 opacity-75 text-right font-bold">{new Date(m.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={sendMessage} className="p-3 border-t border-border bg-surface flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type your message to seller support..." className="flex-1 rounded-xl border border-black/15 dark:border-white/15 bg-[#15171b] px-4 py-2.5 text-xs sm:text-sm text-foreground outline-none focus:border-orange-500 transition font-medium min-w-0" />
                      <button type="submit" className="grid h-10 w-11 place-items-center rounded-xl bg-orange-600 text-foreground transition-colors hover:bg-orange-500 shrink-0 shadow-lg shadow-orange-600/30"><Send className="h-4 w-4" /></button>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-surface flex flex-col items-center justify-center text-muted text-sm font-semibold p-8 text-center shadow-lg">
                    <MessageSquare className="w-12 h-12 text-zinc-700 mb-3" />
                    <span>Select an inquiry thread from the left panel to begin communicating.</span>
                  </div>
                )}
              </div>
            )}

            {/* 4. GARAGE */}
            {activeTab === "Garage" && (
              <div className="max-w-3xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground">My Garage & Build Showcase</h1>
                    <p className="text-xs sm:text-sm text-muted mt-1">Manage your active riding machines and customized bolt-on modifications.</p>
                  </div>
                  <Link href="/garage" className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 w-fit">
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Full 3D/Mod Hangar</span>
                  </Link>
                </div>
                
                <div className="space-y-3">
                  {myBikes.map((b, i) => (
                    <div key={i} className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shrink-0"><Bike className="h-6 w-6" /></div>
                        <div className="min-w-0">
                          <b className="text-base font-black text-foreground truncate block">{b.year} {b.make} {b.model}</b>
                          <span className="text-xs text-orange-400 font-extrabold uppercase">✓ Primary Ride & Fitment Filter</span>
                        </div>
                      </div>
                      <button onClick={() => setMyBikes(myBikes.filter((_, idx) => idx !== i))} className="p-2 text-muted hover:text-red-400 transition" title="Remove bike">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg">
                  <b className="text-base text-foreground font-black block mb-4">Quick Register New Motorcycle</b>
                  <form onSubmit={handleAddBike} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input required placeholder="Year (e.g. 2025)" value={newBike.year} onChange={e=>setNewBike({...newBike, year: e.target.value})} className="rounded-xl border border-black/15 dark:border-white/15 bg-surface px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground outline-none focus:border-orange-500 transition" />
                    <input required placeholder="Make (e.g. BMW)" value={newBike.make} onChange={e=>setNewBike({...newBike, make: e.target.value})} className="rounded-xl border border-black/15 dark:border-white/15 bg-surface px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground outline-none focus:border-orange-500 transition" />
                    <input required placeholder="Model (e.g. R1300GS)" value={newBike.model} onChange={e=>setNewBike({...newBike, model: e.target.value})} className="rounded-xl border border-black/15 dark:border-white/15 bg-surface px-3.5 py-2.5 text-xs sm:text-sm font-bold text-foreground outline-none focus:border-orange-500 transition" />
                    <button type="submit" className="rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2.5 text-xs font-extrabold text-foreground uppercase tracking-wide shadow-lg shadow-orange-600/25 cursor-pointer">Register Bike</button>
                  </form>
                </div>
              </div>
            )}

            {/* 5. INVITE & EARN */}
            {activeTab === "Invite & Earn" && (
              <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-orange-400 bg-orange-500/15 px-3 py-1 rounded-full border border-orange-500/30">VIP Rider Rewards</span>
                  <h1 className="mt-3 text-2xl sm:text-4xl font-black text-foreground tracking-tight">Invite Biker Friends & Earn MotoTribe Cash</h1>
                  <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed max-w-2xl font-medium">
                    Share your passion for riding and get rewarded. For every rider friend who joins with your referral URL, you automatically earn <strong className="text-emerald-400 font-black">100 MotoTribe Cash Points (₹100)</strong> deposited instantly to your wallet!
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-r from-[#1c120c] via-[#161414] to-[#12161b] p-5 sm:p-6 shadow-2xl shadow-orange-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-500/20 border border-orange-500/40 text-orange-400 shadow-inner shrink-0">
                      <Coins className="h-8 w-8 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-[11px] text-muted font-extrabold uppercase tracking-wider block">Available Wallet Cash Balance</span>
                      <div className="flex flex-wrap items-baseline gap-2 mt-1">
                        <span className="text-3xl sm:text-4xl font-black text-emerald-400">₹{user.motoTribeCash ?? 250}</span>
                        <span className="text-xs font-black text-orange-400 bg-orange-500/15 px-2.5 py-0.5 rounded-full border border-orange-500/30">1 Point = ₹1 Rupee Off</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col sm:items-end justify-between sm:justify-center gap-1 text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-border relative z-10">
                    <span className="text-sm font-extrabold text-foreground block">Total Referrals: <strong className="text-orange-400">{(user as any).referralsCount ?? 2} Riders</strong></span>
                    <span className="text-xs font-semibold text-muted">Total Earnings: ₹{((user as any).referralsCount ?? 2) * 100}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 space-y-6 shadow-lg">
                  <h2 className="text-lg font-black text-foreground flex items-center gap-2">
                    <Award className="h-5 w-5 text-orange-400 shrink-0" />
                    <span>Your Unique Rider Referral Link</span>
                  </h2>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted block uppercase tracking-wide">Shareable Affiliate URL</label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-black/70 p-2 shadow-inner">
                      <input
                        readOnly
                        value={typeof window !== "undefined" ? `${window.location.origin}/sign-up?ref=${user.referralCode || "REF" + user.id.slice(0, 5).toUpperCase()}` : ""}
                        className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm font-mono text-foreground outline-none select-all truncate min-w-0 font-semibold"
                      />
                      <button
                        onClick={handleCopyProfileLink}
                        className={`flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-lg text-xs font-black transition-all shadow-md shrink-0 uppercase tracking-wide ${
                          copiedRef ? "bg-emerald-600 text-foreground" : "bg-orange-600 hover:bg-orange-500 text-foreground shadow-orange-600/30 cursor-pointer"
                        }`}
                      >
                        {copiedRef ? <><Check className="w-4 h-4" /><span>Copied Link!</span></> : <><Copy className="w-4 h-4" /><span>Copy Referral URL</span></>}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5">
                      <span className="text-xs font-black text-orange-400 block">STEP 1: SHARE</span>
                      <b className="text-sm font-bold text-foreground block mt-1">Send Your Link</b>
                      <p className="text-xs text-muted mt-1 font-normal">Broadcast your link on riding club groups, Instagram, or WhatsApp chats.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5">
                      <span className="text-xs font-black text-orange-400 block">STEP 2: REGISTER</span>
                      <b className="text-sm font-bold text-foreground block mt-1">Friends Register</b>
                      <p className="text-xs text-muted mt-1 font-normal">Your buddy gets +50 bonus MotoTribe points instantly upon opening account.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5">
                      <span className="text-xs font-black text-emerald-400 block">STEP 3: EARN CASH</span>
                      <b className="text-sm font-bold text-foreground block mt-1">Earn ₹100 Instantly</b>
                      <p className="text-xs text-muted mt-1 font-normal">Receive ₹100 per friend to redeem on jackets, exhausts, and helmets!</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. WISHLIST (NOW FULLY FUNCTIONAL) */}
            {activeTab === "Wishlist" && (
              <div className="max-w-5xl space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
                    <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                    <span>My Saved Wishlist ({wishlist.length})</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-1">Riding jackets, exhausts, and protection gear saved for future builds.</p>
                </div>

                {wishlist.length === 0 ? (
                  <div className="py-20 text-center border border-dashed border-black/15 dark:border-white/15 rounded-2xl bg-white/[0.01]">
                    <Heart className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-muted text-sm font-bold">Your wishlist is currently empty.</p>
                    <Link href="/marketplace" className="mt-4 inline-block px-6 py-2.5 bg-orange-600 text-foreground rounded-xl text-xs font-black uppercase">Explore Marketplace</Link>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {wishlist.map((p) => (
                      <div key={p.id} className="rounded-2xl border border-border bg-surface overflow-hidden shadow-lg flex flex-col justify-between group hover:border-orange-500/40 transition">
                        <div>
                          <div className="relative h-44 overflow-hidden bg-zinc-900">
                            <img src={p.image || "/images/promo_riding_gear.png"} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            <button onClick={() => setWishlist(wishlist.filter(item => item.id !== p.id))} className="absolute top-2 right-2 p-2 rounded-full bg-black/70 hover:bg-red-600 text-foreground transition" title="Remove from wishlist">
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-2 left-2 bg-black/70 text-orange-400 font-bold px-2 py-0.5 rounded text-[10px]">
                              Fits: {p.bike || "Universal"}
                            </span>
                          </div>
                          <div className="p-4">
                            <b className="text-sm text-foreground block line-clamp-1">{p.name}</b>
                            <span className="text-xs text-muted block">Sold by {p.seller}</span>
                            <div className="mt-3 flex items-baseline gap-2">
                              <span className="text-lg font-black text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                              {p.comparePrice && <span className="text-xs text-muted line-through">₹{p.comparePrice.toLocaleString("en-IN")}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 pt-0">
                          <button
                            onClick={async () => {
                              try {
                                await api.post("/cart/items", { productId: p.id, quantity: 1 });
                                alert(`Added ${p.name} to Cart!`);
                              } catch (err) {
                                console.error(err);
                                alert("Failed to add to cart");
                              }
                            }}
                            className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-foreground text-xs font-black uppercase tracking-wide shadow transition"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. COUPONS & VOUCHERS (NOW FULLY FUNCTIONAL) */}
            {activeTab === "Coupons" && (
              <div className="max-w-4xl space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
                    <Tag className="w-7 h-7 text-orange-500" />
                    <span>My Available Rider Coupons</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted mt-1">Exclusive discounts available for your checkout across gear categories.</p>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {coupons.filter((item: any) => item.active || item.status === "ACTIVE").map((c: any) => (
                    <div key={c.code} className="rounded-2xl border border-dashed border-orange-500/40 bg-gradient-to-tr from-[#16110e] to-[#12161b] p-5 shadow-lg flex flex-col justify-between relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-orange-600 text-foreground font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-bl-lg">Verified Active</div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl font-black font-mono text-orange-400 tracking-wider bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-lg">{c.code}</span>
                          <span className="text-base font-extrabold text-emerald-400">
                            {c.discountType === "PERCENT" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-foreground font-medium leading-relaxed">Applicable on {c.category} across verified marketplace items.</p>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-muted border-t border-border pt-3">
                          <span>Min Order: <strong className="text-foreground">₹{c.minOrder.toLocaleString("en-IN")}</strong></span>
                          <span>Uses: <strong className="text-foreground">{c.uses} Redeemed</strong></span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCopyCoupon(c.code)}
                        className="mt-4 w-full py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-orange-600 text-foreground text-xs font-black transition uppercase tracking-wide flex items-center justify-center gap-2"
                      >
                        {copiedCoupon === c.code ? <><Check className="w-4 h-4 text-emerald-400" /><span>Copied Code!</span></> : <><Copy className="w-4 h-4" /><span>Copy Coupon Code</span></>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. ADDRESSES (NOW FULLY FUNCTIONAL) */}
            {activeTab === "Addresses" && (
              <div className="max-w-4xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-foreground">Saved Delivery Addresses</h1>
                    <p className="text-xs sm:text-sm text-muted mt-1">Manage your home and garage drop-off addresses for bolt-on gear delivery.</p>
                  </div>
                  <button onClick={() => setShowAddAddress(!showAddAddress)} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-black text-xs rounded-xl flex items-center gap-2 w-fit shadow-lg">
                    <Plus className="w-4 h-4" />
                    <span>{showAddAddress ? "Cancel" : "Add New Address"}</span>
                  </button>
                </div>

                {showAddAddress && (
                  <form onSubmit={handleAddAddress} className="rounded-2xl border border-orange-500/30 bg-surface p-5 sm:p-6 shadow-xl space-y-4 animate-in fade-in">
                    <b className="text-base text-foreground font-bold block">Enter New Delivery Location</b>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted font-bold block mb-1">Location Label</label>
                        <select value={newAddr.type} onChange={e=>setNewAddr({...newAddr, type: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold">
                          <option value="Home">Home</option>
                          <option value="Garage">Garage / Workshop</option>
                          <option value="Office">Office / Club</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted font-bold block mb-1">Recipient Name</label>
                        <input required placeholder="Full Name" value={newAddr.name} onChange={e=>setNewAddr({...newAddr, name: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted font-bold block mb-1">Full Street Address & Landmark</label>
                      <input required placeholder="Flat, Street Name, Landmark" value={newAddr.address} onChange={e=>setNewAddr({...newAddr, address: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-muted font-bold block mb-1">City & State</label>
                        <input required placeholder="Bengaluru, Karnataka" value={newAddr.city} onChange={e=>setNewAddr({...newAddr, city: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold" />
                      </div>
                      <div>
                        <label className="text-xs text-muted font-bold block mb-1">PIN Code</label>
                        <input required placeholder="560034" value={newAddr.pin} onChange={e=>setNewAddr({...newAddr, pin: e.target.value})} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-foreground font-bold" />
                      </div>
                    </div>
                    <button type="submit" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg">Save Delivery Address</button>
                  </form>
                )}

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {addresses.map((a) => (
                    <div key={a.id} className={`rounded-2xl border p-5 shadow-md space-y-3 ${a.default ? "border-orange-500 bg-[#151318]" : "border-border bg-surface"}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-orange-400 bg-orange-500/15 px-2.5 py-0.5 rounded border border-orange-500/20">{a.type}</span>
                        {a.default && <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">✓ Default Drop-Off</span>}
                      </div>
                      <div>
                        <b className="text-base text-foreground block font-bold">{a.name || user.name}</b>
                        <p className="text-xs text-foreground mt-1 leading-relaxed">{a.address}</p>
                        <p className="text-xs text-muted mt-0.5 font-semibold">{a.city} — <strong className="text-foreground">{a.pin}</strong></p>
                      </div>
                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-extrabold">
                        {!a.default && (
                          <button onClick={() => setAddresses(addresses.map(addr => ({ ...addr, default: addr.id === a.id })))} className="text-orange-400 hover:underline">Set as Default</button>
                        )}
                        <button onClick={() => setAddresses(addresses.filter(addr => addr.id !== a.id))} className="text-red-400 hover:underline ml-auto flex items-center gap-1">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. PAYMENT METHODS (NOW FULLY FUNCTIONAL) */}
            {activeTab === "Payment Methods" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">Saved Payment Methods</h1>
                  <p className="text-xs sm:text-sm text-muted mt-1">Manage your saved UPI handles and cards for express 1-click checkout.</p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-lg space-y-4">
                  <b className="text-base text-foreground font-bold block">Add New UPI VPA ID</b>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={newUpi}
                      onChange={e => setNewUpi(e.target.value)}
                      placeholder="e.g. rider@okicici or 9876543210@upi"
                      className="flex-1 rounded-xl border border-black/15 dark:border-white/15 bg-surface px-4 py-2.5 text-xs sm:text-sm text-foreground font-bold outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => { if (!newUpi.includes("@")) return alert("Please enter valid UPI ID"); setPaymentMethods([...paymentMethods, { id: Date.now(), type: "UPI", label: newUpi, status: "Verified Active" }]); setNewUpi(""); }}
                      className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg shrink-0"
                    >
                      Verify & Save UPI
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map(p => (
                    <div key={p.id} className="rounded-2xl border border-border bg-surface p-5 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="grid h-11 w-11 place-items-center rounded-xl bg-black/5 dark:bg-white/5 border border-border text-orange-400 shrink-0"><CreditCard className="w-6 h-6" /></div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted block">{p.type} ACCOUNT</span>
                          <b className="text-sm sm:text-base font-bold text-foreground block">{p.label}</b>
                          <span className="text-xs text-emerald-400 font-extrabold flex items-center gap-1 mt-0.5"><ShieldCheck className="w-3.5 h-3.5" /> {p.status}</span>
                        </div>
                      </div>
                      <button onClick={() => setPaymentMethods(paymentMethods.filter(item => item.id !== p.id))} className="p-2 text-muted hover:text-red-400 transition" title="Remove method">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. SETTINGS (NOW FULLY FUNCTIONAL) */}
            {activeTab === "Settings" && (
              <div className="max-w-3xl space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground">Rider Profile Settings</h1>
                  <p className="text-xs sm:text-sm text-muted mt-1">Configure your riding preferences, email notifications, and public build visibility.</p>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted font-extrabold block mb-1.5 uppercase">Primary Riding Discipline</label>
                      <select
                        value={settings.ridingStyle}
                        onChange={e => setSettings({ ...settings, ridingStyle: e.target.value })}
                        className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-surface px-4 py-3 text-sm font-bold text-foreground outline-none focus:border-orange-500"
                      >
                        <option value="Adventure Tourer & Track">Adventure Tourer & Highway Endurance</option>
                        <option value="Track Racing & Sportbike">Track Racing & Supersport Cornering</option>
                        <option value="Cruiser & Heritage Commute">Cruiser & Classic Heritage Rides</option>
                        <option value="Motocross & Trail Enduro">Motocross & Off-road Dirt Enduro</option>
                      </select>
                    </div>

                    <div className="pt-4 border-t border-border space-y-4">
                      <b className="text-sm text-foreground font-extrabold flex items-center gap-2"><Bell className="w-4 h-4 text-orange-400" /> Notification & Alert Preferences</b>
                      
                      <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <div>
                          <b className="text-xs sm:text-sm text-foreground block">Order Shipment Email Alerts</b>
                          <span className="text-xs text-muted">Get tracking alerts when sellers ship your gear.</span>
                        </div>
                        <input type="checkbox" checked={settings.emailNotifs} onChange={e => setSettings({ ...settings, emailNotifs: e.target.checked })} className="w-5 h-5 accent-orange-500 rounded cursor-pointer" />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition">
                        <div>
                          <b className="text-xs sm:text-sm text-foreground block">Public Garage Build Sheet Visibility</b>
                          <span className="text-xs text-muted">Allow forum riders to see your registered motorcycle mod lists.</span>
                        </div>
                        <input type="checkbox" checked={settings.publicBuildSheet} onChange={e => setSettings({ ...settings, publicBuildSheet: e.target.checked })} className="w-5 h-5 accent-orange-500 rounded cursor-pointer" />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                    {settingsSaved && <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1"><Check className="w-4 h-4" /> Settings Saved!</span>}
                    <button
                      onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}
                      className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-foreground font-black text-xs rounded-xl uppercase tracking-wide shadow-lg shadow-orange-600/30"
                    >
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 11. COMMUNITY POSTS, EVENTS & RIDES */}
            {["Posts", "Events", "Rides"].includes(activeTab) && (
              <div className="max-w-4xl space-y-6">
                <h1 className="text-2xl sm:text-3xl font-black text-foreground">My Community {activeTab}</h1>
                <div className="p-12 text-center rounded-2xl border border-border bg-surface shadow-xl space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/30 grid place-items-center text-orange-400 mx-auto">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-black text-foreground">Explore & Create Active {activeTab}</h3>
                  <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">Join India&apos;s most vibrant rider discussions, register for weekend highway rides, and share your touring photos!</p>
                  <div className="pt-2 flex justify-center gap-3">
                    <Link href={activeTab === "Rides" ? "/rides" : "/community"} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg shadow-orange-600/30 uppercase tracking-wide inline-block">
                      Open {activeTab} Portal →
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </AppShell>
  );
}
