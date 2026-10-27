"use client";
import { AppShell, PageHeader } from "../../../components/app-shell";
import { Plus, Wrench, ChevronRight, Trash2, ShieldCheck, Share2, Tag, Sparkles, Award, ShoppingBag, X, MapPin, BookOpen, Star, Check } from "lucide-react";
import { useAuth } from "../../../components/auth-provider";
import { useRouter } from "next/navigation";
import { useGarageDashboard, useCreateVehicle } from "../../../features/platform/api/garage";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GLOBAL_MOTORCYCLE_DATABASE, MANUFACTURER_LIST, MODEL_YEARS_LIST } from "../../../lib/data/motorcycles";

type InstalledMod = {
  id: string;
  category: string;
  name: string;
  cost: number;
};

type GarageBike = { 
  id?: string; 
  make: string; 
  model: string; 
  year: string; 
  category?: string;
  nickname?: string;
  mods?: InstalledMod[];
};

const STORAGE_KEY = "mototribe-garage-v3";
const DEFAULT_BIKES: GarageBike[] = [];
const MOD_CATEGORIES = [
  "Performance & Exhaust",
  "Crash Protection & Guard",
  "Luggage & Touring",
  "Lighting & Electricals",
  "Tires & Suspension",
  "Cockpit & Ergonomics",
];

function loadGarage(): GarageBike[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_BIKES;
  } catch {
    return DEFAULT_BIKES;
  }
}

function saveGarage(bikes: GarageBike[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bikes));
}

export default function Garage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: apiBikes } = useGarageDashboard();
  const createVehicleMutation = useCreateVehicle();
  
  const [bikes, setBikes] = useState<GarageBike[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const initialMake = MANUFACTURER_LIST[0] || "Royal Enfield";
  const initialModel = (GLOBAL_MOTORCYCLE_DATABASE[initialMake] || ["Himalayan 450 (2023 - 2026)"])[0];
  
  const [newBike, setNewBike] = useState<GarageBike>({ 
    make: initialMake, 
    model: initialModel, 
    year: "2024", 
    category: "Adventure / Tourer", 
    nickname: "", 
    mods: [] 
  });

  const [activeBikeIdx, setActiveBikeIdx] = useState<number | null>(null);
  const [modCategory, setModCategory] = useState(MOD_CATEGORIES[0]);
  const [modName, setModName] = useState("");
  const [modCost, setModCost] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (Array.isArray(apiBikes) && apiBikes.length > 0) {
      setBikes(apiBikes);
      saveGarage(apiBikes);
    } else {
      setBikes(loadGarage());
    }
  }, [apiBikes]);

  if (!user) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center">
          <Wrench className="w-16 h-16 text-zinc-700 mb-6" />
          <h1 className="text-2xl font-bold mb-2">Sign in to view your Garage</h1>
          <p className="text-muted mb-8 max-w-[400px]">Register your machines, build interactive mod lists, track upgrade investments, and instantly filter guaranteed-to-fit gear.</p>
          <button onClick={() => router.push("/sign-in?redirect=/garage")} className="bg-[#ff5c1a] px-6 py-3 rounded-xl font-bold text-foreground transition hover:bg-[#e04c0d]">Sign In</button>
        </div>
      </AppShell>
    );
  }

  const handleAddBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBike.make || !newBike.model || !newBike.year) return;
    const updated = [...bikes, { ...newBike, id: Date.now().toString(), mods: [] }];
    setBikes(updated);
    saveGarage(updated);
    try {
      createVehicleMutation.mutate(newBike);
    } catch {
      // Offline sync fallback
    }
    setIsAdding(false);
    const defaultMake = MANUFACTURER_LIST[0];
    const defaultModel = GLOBAL_MOTORCYCLE_DATABASE[defaultMake][0];
    setNewBike({ make: defaultMake, model: defaultModel, year: "2024", category: "Adventure / Tourer", nickname: "", mods: [] });
  };

  const handleRemoveBike = (idx: number) => {
    const updated = bikes.filter((_, i) => i !== idx);
    setBikes(updated);
    saveGarage(updated);
  };

  const handleAddMod = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeBikeIdx === null || !modName.trim()) return;
    
    const targetBike = bikes[activeBikeIdx];
    const newMod: InstalledMod = {
      id: Date.now().toString(),
      category: modCategory,
      name: modName.trim(),
      cost: Number(modCost) || 0,
    };
    
    const updatedMods = [...(targetBike.mods || []), newMod];
    const updatedBikes = [...bikes];
    updatedBikes[activeBikeIdx] = { ...targetBike, mods: updatedMods };
    
    setBikes(updatedBikes);
    saveGarage(updatedBikes);
    setActiveBikeIdx(null);
    setModName("");
    setModCost("");
  };

  const handleRemoveMod = (bikeIdx: number, modId: string) => {
    const targetBike = bikes[bikeIdx];
    const updatedMods = (targetBike.mods || []).filter(m => m.id !== modId);
    const updatedBikes = [...bikes];
    updatedBikes[bikeIdx] = { ...targetBike, mods: updatedMods };
    setBikes(updatedBikes);
    saveGarage(updatedBikes);
  };

  const handleShareBuild = (idx: number) => {
    const bike = bikes[idx];
    const totalCost = (bike.mods || []).reduce((acc, curr) => acc + (curr.cost || 0), 0);
    const modListText = (bike.mods || []).map(m => `• [${m.category}] ${m.name} (₹${m.cost.toLocaleString()})`).join("\n");
    const summary = `🏍️ My MotoTribe Build: ${bike.year} ${bike.make} ${bike.model} ${bike.nickname ? `"${bike.nickname}"` : ""}\nTotal Upgrades Value: ₹${totalCost.toLocaleString()}\n\nInstalled Mods:\n${modListText || "Stock configuration"}\n\nBuild & Shop Guaranteed Parts at MotoTribe!`;
    
    navigator.clipboard.writeText(summary);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 3000);
  };

  return (
    <AppShell>
      <PageHeader 
        eyebrow="My Garage & Build Showcase" 
        title="Organize your dream machines & upgrade specs." 
        body="Track your custom build sheet, log upgrade expenditures, share your setup, and directly shop guaranteed bolt-on parts." 
        action={
          <button onClick={() => setIsAdding(!isAdding)} className="rounded-xl bg-[#ff5c1a] hover:bg-[#e04c0d] transition px-5 py-3 text-sm font-bold text-foreground flex items-center gap-2 shadow-[0_4px_20px_rgba(255,92,26,0.35)]">
            <Plus className="w-4 h-4" /> Add Motorcycle
          </button>
        }
      />
      
      <main className="mx-auto max-w-[1200px] px-5 py-10">
        {isAdding && (
          <div className="mb-10 bg-surface border border-border rounded-2xl p-7 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#ff5c1a]" /> Register & Showcase Your Motorcycle
              </h3>
              <span className="text-xs text-muted font-medium">Hundreds of Indian & Global models with production years indexed</span>
            </div>
            
            <form onSubmit={handleAddBike} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs text-foreground mb-1.5 block font-semibold">Make / Manufacturer *</label>
                <select 
                  required 
                  value={newBike.make} 
                  onChange={e => {
                    const make = e.target.value;
                    const models = GLOBAL_MOTORCYCLE_DATABASE[make] || [];
                    setNewBike({...newBike, make, model: models[0] || ""});
                  }} 
                  className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-foreground font-semibold outline-none focus:border-[#ff5c1a] transition"
                >
                  {MANUFACTURER_LIST.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground mb-1.5 block font-semibold">Exact Model & Generation *</label>
                <select 
                  required 
                  value={newBike.model} 
                  onChange={e => setNewBike({...newBike, model: e.target.value})} 
                  className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-foreground font-semibold outline-none focus:border-[#ff5c1a] transition"
                >
                  {(GLOBAL_MOTORCYCLE_DATABASE[newBike.make] || []).map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground mb-1.5 block font-semibold">Registration Model Year *</label>
                <select 
                  required 
                  value={newBike.year} 
                  onChange={e => setNewBike({...newBike, year: e.target.value})} 
                  className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-foreground font-semibold outline-none focus:border-[#ff5c1a] transition" 
                >
                  {MODEL_YEARS_LIST.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-foreground mb-1.5 block font-semibold">Motorcycle Category Class</label>
                <select 
                  value={newBike.category} 
                  onChange={e => setNewBike({...newBike, category: e.target.value})} 
                  className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-foreground font-semibold outline-none focus:border-[#ff5c1a] transition"
                >
                  <option>Adventure / Tourer</option>
                  <option>Naked Streetfighter</option>
                  <option>Modern Retro & Cafe Racer</option>
                  <option>Cruiser & Touring</option>
                  <option>Supersport / Fairing</option>
                  <option>Off-Road & Dual Sport</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-foreground mb-1.5 block font-semibold">Custom Nickname (Optional)</label>
                <input 
                  value={newBike.nickname || ""} 
                  onChange={e => setNewBike({...newBike, nickname: e.target.value})} 
                  placeholder="e.g. Desert Sherpa, Midnight Shadow" 
                  className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-[#ff5c1a] transition" 
                />
              </div>
              <div className="md:col-span-3 flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-3 font-bold text-sm bg-black/5 dark:bg-white/5 text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition">Cancel</button>
                <button type="submit" className="px-7 py-3 font-bold text-sm bg-[#ff5c1a] text-foreground hover:bg-[#e04c0d] rounded-xl transition shadow-[0_4px_20px_rgba(255,92,26,0.35)]">Save to My Garage</button>
              </div>
            </form>
          </div>
        )}

        {activeBikeIdx !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
            <div className="bg-surface border border-black/15 dark:border-white/15 rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-5 border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-[#ff5c1a]" /> Log Installed Upgrade
                </h3>
                <button onClick={() => setActiveBikeIdx(null)} className="text-muted hover:text-foreground p-1 rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAddMod} className="space-y-4">
                <div>
                  <label className="text-xs text-muted mb-1 block font-semibold">Upgrade Category</label>
                  <select value={modCategory} onChange={e => setModCategory(e.target.value)} className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-[#ff5c1a]">
                    {MOD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block font-semibold">Brand & Part Name</label>
                  <input required value={modName} onChange={e => setModName(e.target.value)} placeholder="e.g. Akrapovič Slip-On Exhaust, Givi Outback Box" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-[#ff5c1a]" />
                </div>
                <div>
                  <label className="text-xs text-muted mb-1 block font-semibold">Investment Cost (₹)</label>
                  <input type="number" min="0" required value={modCost} onChange={e => setModCost(e.target.value)} placeholder="e.g. 24500" className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-[#ff5c1a]" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setActiveBikeIdx(null)} className="px-5 py-2.5 font-bold text-sm bg-black/5 dark:bg-white/5 text-foreground rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 font-bold text-sm bg-[#ff5c1a] text-foreground rounded-xl hover:bg-[#e04c0d] transition shadow-lg">Save Upgrade</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {bikes.length === 0 && !isAdding && (
          <div className="border border-border bg-surface rounded-3xl p-12 text-center my-10 shadow-2xl">
            <Wrench className="w-14 h-14 text-[#ff5c1a] mx-auto mb-4 opacity-90" />
            <h3 className="text-2xl font-bold text-foreground mb-3">Your Garage is Empty</h3>
            <p className="text-muted max-w-md mx-auto mb-8 text-sm leading-relaxed">
              Add your motorcycles above to create custom build sheets, log upgrade expenditures, and unlock guaranteed bolt-on part fitment across our marketplace.
            </p>
            <button onClick={() => setIsAdding(true)} className="rounded-xl bg-[#ff5c1a] hover:bg-[#e04c0d] transition px-6 py-3.5 font-bold text-sm text-foreground inline-flex items-center gap-2 shadow-[0_4px_20px_rgba(255,92,26,0.3)]">
              <Plus className="w-4 h-4" /> Add Your First Machine
            </button>
          </div>
        )}

        <div className="space-y-8">
          {bikes.map((bike, idx) => {
            const mods = bike.mods || [];
            const totalModCost = mods.reduce((acc, curr) => acc + (curr.cost || 0), 0);
            
            return (
              <div key={idx} className="border border-border bg-surface rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-7 md:p-9 bg-gradient-to-r from-[#1b120c] via-[#110e13] to-[#0c0d12] border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <span className="px-3 py-1 rounded-full bg-[#ff5c1a]/15 border border-[#ff5c1a]/30 text-[#ff5c1a] text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> 100% Fitment Guaranteed
                      </span>
                      <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-border text-muted text-xs font-semibold">
                        {bike.category || "Standard Motorcycle"}
                      </span>
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-foreground tracking-tight break-words max-w-full">{bike.year} {bike.make} {bike.model}</h2>
                    {bike.nickname && <p className="text-sm sm:text-md font-bold text-muted italic mt-1">"{bike.nickname}"</p>}
                  </div>

                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => handleShareBuild(idx)}
                      className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-border rounded-xl text-xs font-bold text-foreground transition flex items-center gap-2"
                      title="Copy complete build sheet to clipboard"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#ff5c1a]" />
                      {copiedIdx === idx ? "Build Sheet Copied!" : "Share Build"}
                    </button>
                    
                    <button 
                      onClick={() => setActiveBikeIdx(idx)}
                      className="w-full sm:w-auto justify-center px-4 py-3 sm:py-2.5 bg-[#141820] hover:bg-[#1f2530] border border-black/15 dark:border-white/15 rounded-xl text-xs font-bold text-foreground transition flex items-center gap-2 shadow-lg"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#ff5c1a]" /> Log Mod / Upgrade
                    </button>

                    <button 
                      onClick={() => handleRemoveBike(idx)}
                      className="w-full sm:w-auto justify-center p-3 sm:p-2.5 bg-black/5 dark:bg-white/5 hover:bg-red-500/20 text-muted hover:text-red-400 transition rounded-xl flex items-center gap-1.5"
                      title="Remove motorcycle from garage"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sm:hidden text-xs font-bold">Remove Motorcycle</span>
                    </button>
                  </div>
                </div>

                <div className="p-7 md:p-9 grid gap-8 md:grid-cols-3">
                  <div className="md:col-span-1 space-y-5">
                    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-inner">
                      <div>
                        <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-1">Total Upgrades Installed</span>
                        <div className="text-2xl font-black text-foreground flex items-center gap-2">
                          <Tag className="w-5 h-5 text-[#ff5c1a]" /> {mods.length} {mods.length === 1 ? "Component" : "Components"}
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-black/5 dark:border-white/5">
                        <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-1">Total Mod Investment</span>
                        <div className="text-2xl font-black text-emerald-400">
                          ₹{totalModCost.toLocaleString()}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-black/5 dark:border-white/5">
                        <span className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Marketplace Compatibility</span>
                        <p className="text-xs text-muted leading-relaxed mb-4">
                          All performance exhausts, crash guards, and luggage in our catalog are checked for bolt-on compatibility with your {bike.model}.
                        </p>
                        <Link 
                          href={`/marketplace?q=${encodeURIComponent(bike.model.split(" (")[0])}`} 
                          className="w-full py-3 bg-[#ff5c1a] hover:bg-[#e04c0d] rounded-xl text-xs font-bold text-foreground transition flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,92,26,0.3)]"
                        >
                          <ShoppingBag className="w-4 h-4" /> Shop Fitted Accessories
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-xl flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-6 border-b border-border pb-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h3 className="font-bold text-foreground text-md">Custom Build Sheet & Mod Log</h3>
                      </div>
                      <span className="text-[11px] font-semibold text-muted bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full border border-border">
                        {mods.length === 0 ? "Stock Configuration" : "Modified Stage"}
                      </span>
                    </div>

                    {mods.length === 0 ? (
                      <div className="text-center py-12 px-4 my-auto border border-dashed border-border rounded-2xl bg-black/20">
                        <Wrench className="w-10 h-10 text-zinc-600 mx-auto mb-3 opacity-60" />
                        <h4 className="text-foreground font-bold text-sm mb-1">No modifications logged yet</h4>
                        <p className="text-muted text-xs max-w-sm mx-auto mb-6">
                          Keep track of every exhaust, crash bar, Aux light, and tuning kit you add to your machine.
                        </p>
                        <button 
                          onClick={() => setActiveBikeIdx(idx)}
                          className="px-5 py-2.5 bg-[#ff5c1a]/10 hover:bg-[#ff5c1a]/20 border border-[#ff5c1a]/30 text-[#ff5c1a] rounded-xl text-xs font-bold transition inline-flex items-center gap-2"
                        >
                          <Plus className="w-3.5 h-3.5" /> Record First Upgrade
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {mods.map((mod) => (
                          <div key={mod.id} className="flex items-center justify-between p-4 bg-surface hover:bg-[#151820] rounded-xl border border-black/5 dark:border-white/5 transition group">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-[#ff5c1a]/10 border border-[#ff5c1a]/20 flex items-center justify-center font-bold text-[#ff5c1a]">
                                <Wrench className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#ff5c1a] block">{mod.category}</span>
                                <h4 className="text-foreground font-bold text-sm">{mod.name}</h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-black text-foreground">₹{mod.cost.toLocaleString()}</span>
                              <button 
                                onClick={() => handleRemoveMod(idx, mod.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted hover:text-red-400 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition"
                                title="Delete upgrade record"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                      <span>💡 Click <b>Share Build</b> above to generate your build sheet summary for Instagram or Forums.</span>
                      <Link href={`/marketplace?q=${encodeURIComponent(bike.model.split(" (")[0])}`} className="text-[#ff5c1a] hover:underline font-bold inline-flex items-center gap-1">
                        Explore more parts for {bike.model.split(" (")[0]} <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── AUTHORIZED GARAGE & FITMENT PARTNER NETWORK (SYNCED TO SUPERADMIN) ─── */}
        <div className="mt-16 pt-12 border-t border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-orange-500" />
                <span>Authorized Fitment & Dyno Tuning Network</span>
              </h2>
              <p className="text-sm text-muted mt-1">Book professional installation for your marketplace upgrades at MotoTribe certified workshops across India.</p>
            </div>
            <div className="px-4 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-black uppercase tracking-wide flex items-center gap-2 self-start md:self-auto">
              <Check className="w-4 h-4" /> 100% Fitment Warranty Included
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Fitment Network items would go here. Removed admin-manager mock. */}
          </div>
        </div>

        {/* ─── OFFICIAL TECHNICAL GUIDES & MOD KNOWLEDGEBASE (SYNCED TO SUPERADMIN BLOGS) ─── */}
        <div className="mt-16 pt-12 border-t border-border mb-10">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-emerald-400" />
              <span>Official Maintenance & Technical Guides</span>
            </h2>
            <p className="text-sm text-muted mt-1">Curated torque specifications, chain lubrication walkthroughs, and gear buying guides from MotoTribe editorial experts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blogs would go here. Removed admin-manager mock. */}
          </div>
        </div>
      </main>
    </AppShell>
  );
}
