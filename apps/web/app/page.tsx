"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../components/app-shell";
import { ProductCard } from "../components/product-card";
import { useCarousel, useScrollCarousel } from "../lib/use-carousel";
import {
  CATEGORIES_NAV, HERO_SLIDES, TRUST_BADGES, BIKE_MODELS,
  BIKE_CATALOG, SHOP_CATEGORIES, TRENDING_PRODUCTS, COMMUNITY_POSTS,
  BRANDS, CREATOR_VIDEOS, YEAR_OPTIONS,
} from "../lib/home-data";
import {
  ChevronRight, ChevronLeft, Star, Search, Heart,
  MessageCircle, ThumbsUp, Play, Mail, MapPin,
  Store, HelpCircle, Bike,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const availableModels = selectedMake ? BIKE_CATALOG[selectedMake] ?? [] : [];

  const handleFindProducts = () => {
    const params = new URLSearchParams();
    if (selectedModel) params.set("q", selectedModel);
    else if (selectedMake) params.set("q", selectedMake);
    router.push(`/marketplace${params.toString() ? `?${params}` : ""}`);
  };

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const hero = useCarousel(HERO_SLIDES.length, 5000);

  const bikeScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const communityScrollRef = useRef<HTMLDivElement>(null);
  const creatorScrollRef = useRef<HTMLDivElement>(null);

  useScrollCarousel(bikeScrollRef, 0.6);
  useScrollCarousel(trendingScrollRef, 0.8);
  useScrollCarousel(communityScrollRef, 0.7);
  useScrollCarousel(creatorScrollRef, 0.7);

  return (
    <AppShell>
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden">

        {/* 1. CATEGORY TABS BAR */}
        <nav className="border-b border-border bg-surface overflow-x-auto hide-scrollbar">
          <div className="max-w-[1200px] mx-auto px-3 sm:px-4 flex items-center gap-1">
            {CATEGORIES_NAV.map(cat => (
              <Link
                key={cat}
                href={`/marketplace?q=${encodeURIComponent(cat)}`}
                className="shrink-0 px-3.5 py-3 text-xs font-semibold text-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition rounded-md whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
            <Link
              href="/marketplace"
              className="shrink-0 px-3.5 py-3 text-xs font-bold text-red-500 hover:text-red-400 hover:bg-red-500/5 transition rounded-md whitespace-nowrap"
            >
              SALE 🔥
            </Link>
          </div>
        </nav>

        {/* 2. HERO AUTO-CAROUSEL */}
        <section className="relative w-full h-[380px] sm:h-[460px] md:h-[540px] overflow-hidden">
          {HERO_SLIDES.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700 ease-in-out"
              style={{ opacity: hero.idx === i ? 1 : 0, zIndex: hero.idx === i ? 1 : 0 }}
            >
              <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/20 md:to-transparent" />
            </div>
          ))}

          <div className="relative z-10 flex h-full items-center max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="max-w-[540px] w-full py-6">
              <p className="text-[11px] sm:text-[13px] font-semibold tracking-wider uppercase text-orange-400 mb-2 sm:mb-3 leading-relaxed">
                {HERO_SLIDES[hero.idx].tag}
              </p>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.05] tracking-tight text-foreground mb-5 drop-shadow-lg max-w-full">
                {HERO_SLIDES[hero.idx].title}
              </h1>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-1">
                <Link href="/marketplace" className="px-6 py-3.5 bg-[#ff5c1a] text-foreground font-bold text-center text-xs sm:text-[13px] rounded-lg hover:bg-[#e04c0d] transition shadow-lg shadow-[#ff5c1a]/30 w-full sm:w-auto">
                  {HERO_SLIDES[hero.idx].cta1}
                </Link>
                <Link href="/community" className="px-6 py-3.5 border border-white/30 bg-black/40 backdrop-blur text-foreground font-bold text-center text-xs sm:text-[13px] rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition w-full sm:w-auto">
                  {HERO_SLIDES[hero.idx].cta2}
                </Link>
              </div>
            </div>
          </div>

          <button onClick={hero.prev} className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-black/50 backdrop-blur place-items-center hover:bg-white hover:text-black transition">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={hero.next} className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-black/20 dark:border-white/20 bg-black/50 backdrop-blur place-items-center hover:bg-[#ff5c1a] hover:border-[#ff5c1a] transition">
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => hero.go(i)}
                className={`h-2 rounded-full transition-all duration-300 ${hero.idx === i ? "w-7 bg-[#ff5c1a]" : "w-2 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </section>

        {/* 3. TRUST BADGES */}
        <section className="border-b border-border bg-surface py-4 sm:py-6">
          <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((b, i) => (
              <div key={i} className="flex items-center gap-3.5 p-3 sm:p-2 rounded-xl bg-white/[0.02] border border-black/5 dark:border-white/5 sm:border-0 sm:bg-transparent">
                <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 grid place-items-center text-[#ff5c1a] shrink-0">
                  <b.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <b className="block text-xs font-bold text-foreground truncate">{b.title}</b>
                  <span className="text-[11px] text-muted line-clamp-1">{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. FIND PRODUCTS FOR YOUR BIKE */}
        <section className="bg-surface border-b border-border py-6 sm:py-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight flex items-center gap-2 text-foreground">
                <Bike className="w-5 h-5 text-orange-500" />
                <span>Find Gear For Your Bike</span>
              </h2>
              <Link href="/garage" className="text-xs text-[#ff5c1a] font-bold hover:underline flex items-center gap-1">
                <span>Open My Garage & Mods</span> <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <select
                value={selectedMake}
                onChange={(e) => { setSelectedMake(e.target.value); setSelectedModel(""); }}
                className="w-full sm:flex-1 bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-3 text-xs sm:text-[13px] text-foreground outline-none focus:border-[#ff5c1a] transition appearance-none min-w-0 truncate font-semibold"
              >
                <option value="">1. Select Manufacturer</option>
                {Object.keys(BIKE_CATALOG).map((make) => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={!selectedMake}
                className="w-full sm:flex-1 bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-3 text-xs sm:text-[13px] text-foreground outline-none focus:border-[#ff5c1a] transition appearance-none min-w-0 truncate disabled:opacity-40 font-semibold"
              >
                <option value="">2. Select Model & Gen</option>
                {availableModels.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full sm:flex-1 bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-3 text-xs sm:text-[13px] text-foreground outline-none focus:border-[#ff5c1a] transition appearance-none min-w-0 truncate font-semibold"
              >
                <option value="">3. Select Year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <button
                onClick={handleFindProducts}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ff5c1a] text-foreground font-bold text-xs sm:text-[13px] rounded-xl hover:bg-[#e04c0d] transition shrink-0 shadow-lg shadow-[#ff5c1a]/20 uppercase tracking-wide cursor-pointer"
              >
                Find Compatible Gear
              </button>
            </div>
          </div>
        </section>

        {/* 5. SHOP BY BIKE MODEL */}
        <section className="max-w-[1200px] mx-auto px-4 py-8 sm:py-10">
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-foreground">Shop By Popular Models</h2>
            <Link href="/marketplace" className="text-xs font-bold text-[#ff5c1a] hover:underline flex items-center">VIEW ALL <ChevronRight className="w-4 h-4" /></Link>
          </div>
          <div ref={bikeScrollRef} className="flex gap-4 sm:gap-6 overflow-x-auto hide-scrollbar pb-2 cursor-grab">
            {[...BIKE_MODELS, ...BIKE_MODELS].map((bike, i) => (
              <Link href={`/marketplace?q=${encodeURIComponent(bike.name)}`} key={i} className="shrink-0 flex flex-col items-center gap-2 group">
                <div className="w-[80px] sm:w-[90px] h-[80px] sm:h-[90px] rounded-full overflow-hidden border-2 border-border group-hover:border-[#ff5c1a] transition-all duration-300 bg-[#15171b]">
                  <img src={bike.img} alt={bike.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <span className="text-[11px] text-foreground font-semibold text-center max-w-[90px] leading-tight group-hover:text-[#ff5c1a] transition">{bike.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. SHOP BY CATEGORY */}
        <section className="bg-surface border-y border-border py-8 sm:py-10">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-foreground">Shop By Category</h2>
              <Link href="/marketplace" className="text-xs font-bold text-[#ff5c1a] hover:underline flex items-center">VIEW ALL <ChevronRight className="w-4 h-4" /></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
              {SHOP_CATEGORIES.map((cat, i) => (
                <Link href={`/marketplace?q=${encodeURIComponent(cat.name)}`} key={i} className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-surface border border-black/5 dark:border-white/5 hover:border-orange-500/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all">
                  <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#15171b]">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                  </div>
                  <span className="text-xs font-bold text-foreground group-hover:text-foreground transition text-center mt-1 truncate w-full">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 7. TRENDING PRODUCTS */}
        <section className="py-8 sm:py-10">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-foreground">Trending Gear</h2>
              <Link href="/marketplace" className="text-xs font-bold text-[#ff5c1a] hover:underline flex items-center">VIEW ALL <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>
          <div ref={trendingScrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-[calc((100%-1200px)/2+16px)] pb-4 cursor-grab">
            {[...TRENDING_PRODUCTS, ...TRENDING_PRODUCTS].map((p, i) => (
              <div key={i} className="min-w-[210px] max-w-[210px] shrink-0 group">
                <div className="rounded-xl overflow-hidden border border-border bg-surface hover:border-[#ff5c1a]/50 transition-all duration-300 shadow-md">
                  <div className="relative h-[160px] overflow-hidden bg-zinc-900">
                    <img src={p.img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {p.discount && (
                      <span className="absolute top-2 right-2 bg-[#ff5c1a] text-foreground text-[10px] font-extrabold px-2 py-0.5 rounded shadow">
                        {p.discount}
                      </span>
                    )}
                    <button className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition">
                      <Heart className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-3.5">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Star className="w-3.5 h-3.5 fill-[#ff5c1a] text-[#ff5c1a]" />
                      <span className="text-[#ff5c1a] font-bold">{p.rating}</span>
                      <span className="text-muted">({p.reviews})</span>
                    </div>
                    <h3 className="mt-1.5 text-xs font-bold text-foreground leading-tight line-clamp-2 min-h-[32px]">{p.name}</h3>
                    <p className="mt-0.5 text-[11px] text-muted">by {p.seller}</p>
                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-base font-black text-foreground">₹{p.price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 8. PROMOTIONAL BANNERS */}
        <section className="max-w-[1200px] mx-auto px-4 pb-8 sm:pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative h-[180px] sm:h-[200px] rounded-2xl overflow-hidden border border-orange-500/30 group shadow-lg">
              <img src="/images/promo_riding_gear.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f07]/95 via-[#1a0f07]/75 to-transparent" />
              <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full">
                <div>
                  <p className="text-[#ff5c1a] text-[11px] font-extrabold tracking-wider uppercase">UP TO 40% OFF</p>
                  <h3 className="text-lg sm:text-xl font-black text-foreground mt-1 leading-tight">RIDING JACKETS & GEAR</h3>
                  <p className="text-xs text-foreground mt-1">CE Level 2 armor & waterproofing.</p>
                </div>
                <Link href="/marketplace" className="inline-block w-fit px-5 py-2.5 bg-[#ff5c1a] text-foreground text-xs font-bold rounded-lg hover:bg-[#e04c0d] transition shadow">
                  SHOP NOW
                </Link>
              </div>
            </div>
            <div className="relative h-[180px] sm:h-[200px] rounded-2xl overflow-hidden border border-blue-500/30 group shadow-lg">
              <img src="/images/promo_new_arrivals.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f1520]/95 via-[#0f1520]/75 to-transparent" />
              <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full">
                <div>
                  <p className="text-blue-400 text-[11px] font-extrabold tracking-wider uppercase">NEW ARRIVALS</p>
                  <h3 className="text-lg sm:text-xl font-black text-foreground mt-1 leading-tight">PERFORMANCE & LUGGAGE</h3>
                  <p className="text-xs text-foreground mt-1">Saddlebags & exhaust kits.</p>
                </div>
                <Link href="/marketplace" className="inline-block w-fit px-5 py-2.5 border border-black/20 dark:border-white/20 bg-black/10 dark:bg-white/10 text-foreground text-xs font-bold rounded-lg hover:bg-white/20 transition">
                  EXPLORE
                </Link>
              </div>
            </div>
            <div className="relative h-[180px] sm:h-[200px] rounded-2xl overflow-hidden border border-red-500/30 group shadow-lg">
              <img src="/images/promo_mega_sale.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a0a]/95 via-[#1a0a0a]/75 to-transparent" />
              <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-between h-full">
                <div>
                  <p className="text-red-400 text-[11px] font-extrabold tracking-wider uppercase">MEGA SALE</p>
                  <h3 className="text-lg sm:text-xl font-black text-foreground mt-1 leading-tight">HELMETS & ACCESSORIES</h3>
                  <p className="text-xs text-foreground mt-1">Limited time clearances.</p>
                </div>
                <Link href="/marketplace" className="inline-block w-fit px-5 py-2.5 bg-red-600 text-foreground text-xs font-bold rounded-lg hover:bg-red-700 transition shadow">
                  SHOP SALE
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 9. COMMUNITY FEED */}
        <section className="bg-surface border-y border-border py-8 sm:py-10">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-foreground">Community Discussions</h2>
              <Link href="/community" className="text-xs font-bold text-[#ff5c1a] hover:underline flex items-center">VIEW FORUM <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>
          <div ref={communityScrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-[calc((100%-1200px)/2+16px)] pb-4 cursor-grab">
            {[...COMMUNITY_POSTS, ...COMMUNITY_POSTS].map((post, i) => (
              <div key={i} className="min-w-[260px] max-w-[260px] sm:min-w-[280px] sm:max-w-[280px] shrink-0 rounded-xl overflow-hidden border border-border bg-surface hover:border-[#ff5c1a]/40 transition-all duration-300 shadow">
                <div className="relative h-[150px] overflow-hidden bg-zinc-900">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full">
                    <div className="w-4 h-4 rounded-full bg-[#ff5c1a] grid place-items-center text-[9px] font-extrabold text-foreground">
                      {post.author[0]}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{post.author}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-muted mt-1.5 line-clamp-2">{post.body}</p>
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-black/5 dark:border-white/5 text-xs text-muted font-medium">
                    <span className="flex items-center gap-1 text-orange-400"><ThumbsUp className="w-3.5 h-3.5" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. TOP BRANDS */}
        <section className="py-8 sm:py-10">
          <div className="max-w-[1200px] mx-auto px-4">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight mb-5 sm:mb-6 text-foreground">Top Brands</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:flex flex-wrap items-center justify-between gap-4 sm:gap-6">
              {BRANDS.map((brand, i) => (
                <Link key={i} href={`/marketplace?q=${encodeURIComponent(brand)}`} className="text-center text-sm sm:text-base md:text-xl font-black tracking-tight text-muted hover:text-foreground transition cursor-pointer opacity-75 hover:opacity-100 p-2 sm:p-0 bg-white/[0.02] sm:bg-transparent rounded-lg border border-black/5 dark:border-white/5 sm:border-0 truncate">
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 11. FROM OUR TOP CREATORS */}
        <section className="bg-surface border-y border-border py-8 sm:py-10">
          <div className="max-w-[1200px] mx-auto px-4 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-tight text-foreground">From Our Top Creators</h2>
          </div>
          <div ref={creatorScrollRef} className="flex gap-4 overflow-x-auto hide-scrollbar px-4 md:px-[calc((100%-1200px)/2+16px)] pb-4 cursor-grab">
            {[...CREATOR_VIDEOS, ...CREATOR_VIDEOS].map((vid, i) => (
              <div key={i} className="min-w-[220px] max-w-[220px] sm:min-w-[240px] sm:max-w-[240px] shrink-0 group cursor-pointer">
                <div className="relative h-[140px] rounded-xl overflow-hidden bg-zinc-900 border border-border group-hover:border-orange-500/50 transition">
                  <img src={vid.img} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur grid place-items-center group-hover:bg-[#ff5c1a] transition shadow-lg">
                      <Play className="w-5 h-5 fill-white text-foreground translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-extrabold px-2 py-0.5 rounded text-foreground">
                    {vid.duration}
                  </span>
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-foreground leading-tight line-clamp-2 group-hover:text-[#ff5c1a] transition">{vid.title}</h3>
                <p className="text-[11px] text-muted mt-1 font-medium">{vid.creator} · {vid.views} views</p>
              </div>
            ))}
          </div>
        </section>

        {/* 12. JOIN THE TRIBE */}
        <section className="bg-gradient-to-r from-[#1a0f07] via-[#0e1015] to-[#1a0f07] border-y border-orange-500/25">
          <div className="max-w-[1200px] mx-auto px-4 py-8 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-orange-500/15 border border-orange-500/30 grid place-items-center p-3 text-orange-400 shadow-inner">
                <Bike className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-foreground">Join The Tribe</h3>
                <p className="text-xs sm:text-sm text-foreground mt-1">Get exclusive discounts, mod guides and riding stories directly to your inbox.</p>
              </div>
            </div>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
              <div className="flex items-center gap-2.5 bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 flex-1 sm:w-[320px] shadow-inner">
                <Mail className="w-4 h-4 text-muted shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your rider email..."
                  required
                  className="bg-transparent text-xs sm:text-sm outline-none w-full text-foreground placeholder:text-muted font-medium min-w-0"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3.5 bg-[#ff5c1a] text-foreground text-xs sm:text-sm font-extrabold rounded-xl hover:bg-[#e04c0d] transition shrink-0 shadow-lg shadow-[#ff5c1a]/25 cursor-pointer uppercase tracking-wide w-full sm:w-auto"
              >
                {subscribed ? "✓ SUBSCRIBED" : "SUBSCRIBE"}
              </button>
            </form>
          </div>
        </section>

        {/* 13. FOOTER */}
        <footer className="bg-[#060709] pt-12 sm:pt-14 pb-10 border-t border-border">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
              <div className="sm:col-span-2">
                <Link href="/" className="inline-block mb-3">
                  <span className="text-2xl font-black italic tracking-[-0.08em] text-foreground">
                    <span className="text-orange-500">🏍</span> Moto<span className="text-[#ff5c1a]">Tribe</span>
                  </span>
                </Link>
                <p className="text-xs text-muted leading-relaxed max-w-sm mb-5 font-normal">
                  India&apos;s ultimate destination for motorcycle enthusiasts. Discover compatible parts, share build sheets, and join rider communities.
                </p>
                <div className="flex gap-2.5">
                  {[
                    { name: "Facebook", url: "https://facebook.com" },
                    { name: "Instagram", url: "https://instagram.com" },
                    { name: "YouTube", url: "https://youtube.com" },
                    { name: "Twitter", url: "https://twitter.com" },
                  ].map(s => (
                    <Link key={s.name} href={s.url} target="_blank" className="px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs text-foreground font-semibold hover:bg-orange-500 hover:text-foreground hover:border-orange-500 transition">{s.name}</Link>
                  ))}
                </div>
              </div>
              <div>
                <b className="block text-xs font-extrabold text-foreground mb-4 uppercase tracking-wider">Shop Gear</b>
                <ul className="space-y-2.5 text-xs text-muted font-medium">
                  {["All Categories", "Helmets", "Riding Gear", "Accessories", "Performance", "Luggage"].map(t => (
                    <li key={t}><Link href={`/marketplace?q=${encodeURIComponent(t === "All Categories" ? "" : t)}`} className="hover:text-foreground transition">{t}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <b className="block text-xs font-extrabold text-foreground mb-4 uppercase tracking-wider">Community</b>
                <ul className="space-y-2.5 text-xs text-muted font-medium">
                  {["Discussions", "Ride Stories", "Clubs", "My Garage", "Events"].map(t => (
                    <li key={t}><Link href={t === "My Garage" ? "/garage" : "/community"} className="hover:text-foreground transition">{t}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <b className="block text-xs font-extrabold text-foreground mb-4 uppercase tracking-wider">Support & Help</b>
                <ul className="space-y-2.5 text-xs text-muted font-medium">
                  {["Help Center", "Fitment Guarantee", "Returns & Refunds", "Track Order"].map(t => (
                    <li key={t}><Link href="/profile" className="hover:text-foreground transition">{t}</Link></li>
                  ))}
                </ul>
              </div>
              <div>
                <b className="block text-xs font-extrabold text-foreground mb-4 uppercase tracking-wider">Company</b>
                <ul className="space-y-2.5 text-xs text-muted font-medium">
                  {["About Us", "Careers", "Partner With Us", "Terms & Conditions", "Privacy Policy"].map(t => (
                    <li key={t}><Link href="/community" className="hover:text-foreground transition">{t}</Link></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-6 border-y border-border">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-muted">
                <span className="font-bold text-foreground mr-2">PAYMENT METHODS</span>
                {["UPI", "Mastercard", "VISA", "Rupay", "NetBanking"].map(p => (
                  <span key={p} className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-border rounded-md text-[11px] font-extrabold text-foreground">{p}</span>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted font-bold">
                <span>🔒 100% Secure & Verified Rider Fitment</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 text-xs text-muted font-medium">
              <p>© 2026 MotoTribe. Built by Riders, for Riders.</p>
              <div className="flex items-center gap-6">
                <Link href="/marketplace" className="hover:text-foreground transition">Sitemap</Link>
                <Link href="/community" className="hover:text-foreground transition">Privacy Policy</Link>
                <Link href="/community" className="hover:text-foreground transition">Terms of Service</Link>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </AppShell>
  );
}
