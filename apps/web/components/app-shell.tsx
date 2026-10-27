"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bike, CircleHelp, Heart, Home, Menu, MessageCircle, PackageOpen, Search, ShoppingCart, Sparkles, Star, Users, Wrench, X, LogOut, Copy, Check, Gift, Award, Coins, Plus, User, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useCartStore } from "../lib/cart-store";
import { useAuth } from "./auth-provider";
import { useTheme } from "next-themes";

const links = [
  [Home, "Home", "/"],
  [ShoppingCart, "Marketplace", "/marketplace"],
  [MessageCircle, "Community", "/community"],
  [Bike, "Garage", "/garage"],
  [Wrench, "Rides & Events", "/rides"],
  [PackageOpen, "Used Marketplace", "/marketplace"],
  [CircleHelp, "Support", "/community"],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    if (user && typeof window !== "undefined") {
      const code = user.referralCode || "REF" + user.id.slice(0, 5).toUpperCase();
      setReferralLink(`${window.location.origin}/sign-up?ref=${code}`);
    }
  }, [user]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/marketplace?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  };

  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Desktop Sidebar */}
        <aside className="hidden min-h-screen border-r border-border px-3 pt-5 lg:block">
          <Link href="/" className="px-3 text-3xl font-black italic tracking-[-.1em]">
            Moto<span className="text-orange-500">Tribe</span>
            <small className="mt-1 block text-[9px] not-italic tracking-[.15em]">BUILT BY RIDERS, FOR RIDERS</small>
          </Link>
          <nav className="mt-7 space-y-1">
            {links.map(([Icon, label, href]) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-md px-4 py-2.5 text-sm transition ${
                  pathname === href ? "bg-[#ff5c1a]/15 text-[#ff5c1a] font-semibold" : "text-foreground hover:bg-white/7"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />{label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 rounded-xl border border-orange-900/40 bg-gradient-to-br from-[#21140c] to-[#572000] p-4 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-all duration-500" />
            <div className="flex items-center gap-2 text-orange-400 font-bold text-[13px]">
              <Gift className="w-4 h-4 animate-bounce shrink-0" />
              <span>Invite & Earn ₹100</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground font-medium">Invite friends and earn <b className="text-foreground">MotoTribe Cash</b> (1 Point = ₹1).</p>
            <button
              onClick={() => setInviteModalOpen(true)}
              className="mt-4 w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 px-3 py-2.5 text-xs font-bold text-foreground shadow-lg shadow-orange-600/30 hover:from-orange-400 hover:to-orange-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Invite Now</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">+100 Pts</span>
            </button>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            <aside className="relative z-10 w-[280px] h-full bg-surface border-r border-border overflow-y-auto p-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                  <span className="text-2xl font-black italic">Moto<span className="text-[#ff5c1a]">Tribe</span></span>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-muted hover:text-foreground rounded-lg bg-black/5 dark:bg-white/5"><X className="w-5 h-5" /></button>
                </div>
                {user ? (
                  <div className="mb-6 p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#ff5c1a] font-bold flex items-center justify-center text-foreground shrink-0">
                        {user.name?.[0]?.toUpperCase() || "R"}
                      </div>
                      <div className="min-w-0">
                        <b className="text-sm text-foreground block truncate">{user.name}</b>
                        <span className="text-[10px] text-orange-400 font-bold block uppercase">{user.role}</span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border text-xs">
                      <Link href={user.role === "SELLER" ? "/seller" : user.role === "ADMIN" ? "/admin" : "/profile"} onClick={() => setMobileMenuOpen(false)} className="text-foreground hover:text-foreground font-semibold">
                        View Dashboard →
                      </Link>
                      <button onClick={() => { signOut(); setMobileMenuOpen(false); }} className="text-red-400 hover:text-red-300 p-1" title="Log out">
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-3.5 rounded-xl bg-gradient-to-r from-[#21140c] to-[#15171b] border border-orange-500/20">
                    <p className="text-xs text-foreground font-medium mb-3">Sign in to sync your Garage & unlock exclusive discounts.</p>
                    <div className="flex gap-2">
                      <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-[#ff5c1a] text-foreground font-bold text-xs rounded-lg shadow-lg">Sign In</Link>
                      <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center py-2 bg-black/10 dark:bg-white/10 text-foreground font-bold text-xs rounded-lg">Sign Up</Link>
                    </div>
                  </div>
                )}
                <nav className="space-y-1.5">
                  {links.map(([Icon, label, href]) => (
                    <Link key={label} href={href} onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition ${pathname === href ? "bg-[#ff5c1a] text-foreground font-bold shadow-md shadow-[#ff5c1a]/25" : "text-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}>
                      <Icon className="h-4 w-4 shrink-0" />{label}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="mt-6 border-t border-border pt-4 text-center">
                <button onClick={() => { setMobileMenuOpen(false); setInviteModalOpen(true); }} className="w-full py-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center justify-center gap-2">
                  <Gift className="w-4 h-4" /> Invite Friends & Earn ₹100
                </button>
              </div>
            </aside>
          </div>
        )}

        <div className="min-w-0 w-full overflow-hidden">
          {/* Desktop & Mobile Header Structure */}
          <header className="border-b border-border bg-surface">
            {/* Row 1: Brand, hamburger, notifications, cart */}
            <div className="flex h-16 md:h-[72px] items-center justify-between gap-3 px-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-foreground hover:text-foreground lg:hidden" onClick={() => setMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </button>
                <Link href="/" className="text-xl sm:text-2xl font-black italic tracking-[-.08em] lg:hidden">
                  Moto<span className="text-orange-500">Tribe</span>
                </Link>
                <div className="hidden rounded-lg bg-[#15171b] px-4 py-2.5 text-xs font-semibold md:block border border-black/5 dark:border-white/5">All Categories</div>
              </div>

              {/* Desktop Search Bar */}
              <form onSubmit={handleSearch} className="hidden lg:flex h-10 max-w-[500px] flex-1 items-center rounded-lg border border-border bg-[#15171b] px-4 text-xs text-muted">
                <Search className="mr-3 h-4 w-4 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for accessories, parts, gear, bikes..."
                  className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted"
                />
                <button type="submit" className="ml-auto -mr-4 grid h-10 w-11 place-items-center rounded-r-lg bg-orange-600 text-foreground hover:bg-orange-700 transition shrink-0">
                  <Search className="h-5 w-5" />
                </button>
              </form>

              {/* Action buttons (Notifs, Cart, Profile) */}
              <div className="flex items-center gap-3 sm:gap-5 text-center text-[11px] text-muted">
                <Link href="/community" className="hidden xl:block hover:text-foreground transition"><Users className="mx-auto h-5 w-5" />Community</Link>
                <Link href="/rides" className="hidden xl:block hover:text-foreground transition"><Wrench className="mx-auto h-5 w-5" />Rides</Link>
                <Link href="/garage" className="hidden sm:block hover:text-foreground transition"><Bike className="mx-auto h-5 w-5" />Garage</Link>
                
                {mounted && (
                  <button 
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                    className="p-2 sm:p-0 hover:text-foreground transition cursor-pointer text-center block"
                    title="Toggle Theme"
                  >
                    {theme === "dark" ? <Sun className="mx-auto h-5 w-5" /> : <Moon className="mx-auto h-5 w-5" />}
                    <span className="hidden sm:inline">Theme</span>
                  </button>
                )}

                <div className="relative">
                  <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 sm:p-0 hover:text-foreground transition cursor-pointer relative block text-center">
                    <Bell className="mx-auto h-5 w-5" /><span className="hidden sm:inline">Alerts</span>
                    <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-foreground grid place-items-center font-bold">2</span>
                  </button>
                  {notifOpen && (
                    <div className="absolute top-10 sm:top-12 -right-10 sm:-right-4 w-[280px] sm:w-[320px] bg-surface border border-black/15 dark:border-white/15 rounded-xl shadow-2xl p-3 z-50 text-left">
                      <div className="flex justify-between items-center border-b border-border pb-2 mb-2">
                        <b className="text-[13px] text-foreground">Notifications</b>
                        <button onClick={() => setNotifOpen(false)} className="text-muted hover:text-foreground text-xs">Close</button>
                      </div>
                      <div className="space-y-2">
                        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                          <p className="text-xs text-foreground font-bold">Order Shipped 🏍️</p>
                          <p className="text-[11px] text-muted leading-snug mt-0.5">Your SMK Typhoon helmet is on the way to your doorstep.</p>
                        </div>
                        <div className="p-2.5 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                          <p className="text-xs text-foreground font-bold">New Community Event</p>
                          <p className="text-[11px] text-muted leading-snug mt-0.5">Sunday morning breakfast ride to Nandi Hills just posted!</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link href="/cart" className="relative p-2 sm:p-0 hover:text-foreground transition text-center block">
                  <ShoppingCart className="mx-auto h-5 w-5" /><span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-4 h-4 bg-[#ff5c1a] rounded-full text-[9px] text-foreground grid place-items-center font-bold">{cartCount}</span>}
                </Link>
                
                {user ? (
                  <div className="hidden sm:flex items-center gap-2 border-l border-border pl-4">
                    <Link href={user.role === "SELLER" ? "/seller" : user.role === "ADMIN" ? "/admin" : "/profile"} className="text-left text-xs hover:text-foreground transition">
                      <b className="truncate max-w-[90px] block">{user.name}</b>
                      <small className="mt-0.5 block text-orange-400 font-bold uppercase text-[9px]">{user.role}</small>
                    </Link>
                    <button onClick={() => signOut()} className="ml-1 hover:text-red-400 text-muted transition p-1" title="Log out">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link href="/sign-in" className="hidden sm:flex items-center border-l border-border pl-4 text-left text-xs hover:text-foreground transition text-[#ff5c1a] font-bold">
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Dedicated Mobile Search Bar Row */}
            <div className="px-3 pb-3 lg:hidden">
              <form onSubmit={handleSearch} className="flex h-10 w-full items-center rounded-xl border border-black/15 dark:border-white/15 bg-[#15171b] px-3 text-xs text-muted shadow-inner">
                <Search className="mr-2.5 h-4 w-4 shrink-0 text-orange-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gear, parts, bikes, brands..."
                  className="flex-1 bg-transparent text-foreground outline-none placeholder:text-muted min-w-0"
                />
                <button type="submit" className="ml-2 bg-[#ff5c1a] text-foreground font-bold px-3.5 py-1.5 rounded-lg text-[11px] shrink-0">
                  Search
                </button>
              </form>
            </div>
          </header>
          {children}
        </div>
      </div>

      {/* Modern iOS/Android Mobile Bottom Navigation with Lucide Icons */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-border bg-surface/95 backdrop-blur-md px-2 py-2 lg:hidden shadow-2xl">
        <Link href="/" className={`flex flex-col items-center gap-1 min-w-[50px] transition ${pathname === "/" ? "text-orange-500 font-bold" : "text-muted hover:text-foreground"}`}>
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/marketplace" className={`flex flex-col items-center gap-1 min-w-[50px] transition ${pathname === "/marketplace" ? "text-orange-500 font-bold" : "text-muted hover:text-foreground"}`}>
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[10px]">Market</span>
        </Link>
        <Link href="/seller" className="-mt-6 grid h-13 w-13 p-3.5 place-items-center rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-foreground shadow-lg shadow-orange-600/40 hover:scale-105 active:scale-95 transition-transform border-4 border-[#0c0d12]">
          <Plus className="w-6 h-6 stroke-[3]" />
        </Link>
        <Link href="/garage" className={`flex flex-col items-center gap-1 min-w-[50px] transition ${pathname === "/garage" ? "text-orange-500 font-bold" : "text-muted hover:text-foreground"}`}>
          <Bike className="w-5 h-5" />
          <span className="text-[10px]">Garage</span>
        </Link>
        <Link href={user ? (user.role === "SELLER" ? "/seller" : user.role === "ADMIN" ? "/admin" : "/profile") : "/sign-in"} className={`flex flex-col items-center gap-1 min-w-[50px] transition ${pathname.startsWith("/profile") || pathname.startsWith("/sign-in") ? "text-orange-500 font-bold" : "text-muted hover:text-foreground"}`}>
          <User className="w-5 h-5" />
          <span className="text-[10px]">{user ? "Profile" : "Sign In"}</span>
        </Link>
      </nav>

      {/* Bottom spacing for mobile nav */}
      <div className="h-18 lg:hidden" />

      {/* Invite & Earn Modal Overlay */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="relative w-full max-w-[480px] rounded-2xl border border-orange-500/20 bg-gradient-to-b from-[#181310] via-[#0e0f14] to-[#0a0b0e] p-5 sm:p-6 shadow-2xl shadow-orange-500/10 text-foreground overflow-hidden my-auto">
            {/* Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border relative z-10">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 shadow-inner shrink-0">
                  <Gift className="w-6 h-6 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-foreground flex items-center gap-2 truncate">
                    Invite & Earn <span className="text-[10px] bg-gradient-to-r from-orange-500 to-amber-500 text-black px-2 py-0.5 rounded-full font-extrabold shrink-0">VIP</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-muted font-medium truncate">Earn MotoTribe Cash for every rider!</p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg bg-black/5 dark:bg-white/5 text-muted hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-5 sm:mt-6 space-y-5 sm:space-y-6 relative z-10">
              {/* Reward Explanation Box */}
              <div className="rounded-xl bg-white/[0.03] border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/15 text-amber-400 shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <b className="text-sm block text-foreground font-bold">100 Points Per Invite</b>
                    <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">💰 Guaranteed Rate: 1 Point = ₹1 Rupee</p>
                  </div>
                </div>
                <div className="text-left sm:text-right sm:border-l sm:border-border sm:pl-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-border">
                  <span className="text-[10px] text-muted uppercase tracking-wider font-bold block">Your Balance</span>
                  <span className="text-xl font-black text-emerald-400">₹{user ? (user.motoTribeCash ?? 250) : 0}</span>
                  <span className="block text-[9px] text-muted">MotoTribe Cash</span>
                </div>
              </div>

              {user ? (
                <>
                  {/* Shareable Link Box */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted mb-2 flex items-center justify-between">
                      <span>Referral Link</span>
                      <span className="text-orange-400 font-normal lowercase">Code: <strong className="uppercase">{user.referralCode || "REF" + user.id.slice(0, 5).toUpperCase()}</strong></span>
                    </label>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-black/60 p-1.5 shadow-inner">
                      <input
                        readOnly
                        value={referralLink}
                        className="flex-1 bg-transparent px-2.5 text-xs font-mono text-foreground outline-none select-all truncate min-w-0"
                      />
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 shadow-md ${
                          copied
                            ? "bg-emerald-600 text-foreground"
                            : "bg-orange-600 hover:bg-orange-500 text-foreground shadow-orange-600/30"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Leaderboard / Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="rounded-xl border border-black/5 dark:border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">Friends Joined</div>
                      <div className="mt-1 text-xl sm:text-2xl font-black text-foreground flex items-center justify-center gap-1">
                        <span>{(user as any).referralsCount ?? 2}</span>
                        <span className="text-xs font-normal text-muted">riders</span>
                      </div>
                    </div>
                    <div className="rounded-xl border border-black/5 dark:border-white/5 bg-white/[0.02] p-3.5 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted font-semibold">Total Earned</div>
                      <div className="mt-1 text-xl sm:text-2xl font-black text-orange-400 flex items-center justify-center gap-1">
                        <span>₹{((user as any).referralsCount ?? 2) * 100}</span>
                        <span className="text-xs font-normal text-muted">cash</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-6 border border-dashed border-border rounded-xl p-6 bg-white/[0.01]">
                  <Award className="w-10 h-10 text-orange-400 mx-auto mb-2 animate-bounce" />
                  <b className="text-sm text-foreground block">Sign in to claim your Referral Code!</b>
                  <p className="text-xs text-muted mt-1 mb-4">Start inviting your biker friends to earn MotoTribe Cash on accessories and riding gear.</p>
                  <Link
                    href="/sign-in"
                    onClick={() => setInviteModalOpen(false)}
                    className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-foreground hover:bg-orange-500 transition shadow-lg shadow-orange-600/30 w-full sm:w-auto"
                  >
                    Sign In to Earn
                  </Link>
                </div>
              )}

              <p className="text-[10px] text-center text-muted leading-normal pt-2 border-t border-border">
                ⚡ Earned MotoTribe Cash is automatically deposited to your account instantly when your friend registers. 1 Point equals ₹1 Off!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, body, action }: { eyebrow: string; title: string; body?: string; action?: React.ReactNode }) {
  return (
    <section className="border-b border-border bg-[radial-gradient(circle_at_80%_0%,#22201c,transparent_42%)] overflow-hidden">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-6 py-6 sm:py-9">
        <p className="text-[10px] font-extrabold uppercase tracking-[.2em] text-orange-500">{eyebrow}</p>
        <div className="mt-2.5 sm:mt-3 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-5">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-.04em] text-foreground truncate max-w-full">{title}</h1>
            {body && <p className="mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm leading-6 text-muted">{body}</p>}
          </div>
          {action && <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">{action}</div>}
        </div>
      </div>
    </section>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-[#15171b] p-4 sm:p-5 shadow-sm">
      <p className="text-[10px] uppercase tracking-wider text-muted font-semibold truncate">{label}</p>
      <p className="mt-1 sm:mt-2 text-xl sm:text-2xl font-black text-foreground">{value}</p>
      <small className="mt-1 sm:mt-2 block text-emerald-400 text-xs font-semibold">▲ 12.4% this week</small>
    </div>
  );
}
