"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, PageHeader } from "../../components/app-shell";
import { ProductCard, Product } from "../../components/product-card";
import { api } from "../../lib/api/client";
import { Search, SlidersHorizontal, X } from "lucide-react";

export default function Marketplace() {
  return (
    <Suspense fallback={<AppShell><div className="min-h-[60vh] grid place-items-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#ff5c1a] block" /></div></AppShell>}>
      <MarketplaceContent />
    </Suspense>
  );
}

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        // Build query params
        const params: any = {};
        if (search.trim()) params.q = search;
        if (category !== "All") params.category = category;
        if (priceRange[0] > 0) params.minPrice = priceRange[0] * 100; // API expects paise
        if (priceRange[1] < 50000) params.maxPrice = priceRange[1] * 100;
        params.sort = sort;
        params.limit = 50;

        const res = await api.get<{ items: any[] }>("/products", { params });
        
        // Map API model to UI Product shape
        const mapped: Product[] = res.items.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price / 100, // convert from paise
          comparePrice: p.comparePrice ? p.comparePrice / 100 : undefined,
          costPrice: p.costPrice ? p.costPrice / 100 : undefined,
          bike: p.fitments?.[0]?.bikeModel?.name || "Universal fit",
          seller: p.seller.name,
          sellerEmail: p.seller.email,
          category: p.category || "Accessories",
          rating: 4.5, // Mock rating until review system is ready
          reviews: p._count?.reviews || 0,
          description: p.description,
          image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
          images: p.images?.map((i: any) => i.url) || [],
          stock: p.stock,
          status: p.status,
          createdAt: p.createdAt
        }));

        setProducts(mapped);
        setFiltered(mapped);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [search, category, sort, priceRange]);

  const categories = ["All", "Accessories", "Luggage", "Protection", "Performance", "Riding Gear", "Helmets", "Tires", "Maintenance", "Electronics", "Apparel"];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Marketplace"
        title="Find gear that fits."
        body="Every listing is mapped to the bikes it fits, backed by real rider feedback and verified fitment."
      />
      <main className="mx-auto grid max-w-[1400px] gap-5 sm:gap-6 px-3.5 sm:px-6 py-6 sm:py-8 lg:grid-cols-[250px_minmax(0,1fr)]">

        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl text-xs sm:text-sm font-extrabold text-foreground shadow-md lg:hidden active:scale-[0.99] transition"
        >
          <SlidersHorizontal className="w-4 h-4 text-orange-500" />
          <span>{showFilters ? "Hide Filter Options" : "Filter Gear & Categories"}</span>
          {category !== "All" && <span className="ml-1 bg-orange-500 text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold">Active</span>}
        </button>

        {/* Sidebar Filters */}
        <aside className={`h-fit rounded-2xl border border-border bg-surface p-5 text-sm sticky top-[80px] z-20 ${showFilters ? "block mb-2" : "hidden lg:block"}`}>
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <b className="text-base font-black text-foreground">Filter Products</b>
            {showFilters && (
              <button onClick={() => setShowFilters(false)} className="p-1 rounded-lg text-muted hover:text-foreground lg:hidden">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="mt-4">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Search Keywords</label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name, model, or brand..."
                className="w-full rounded-xl border border-black/15 dark:border-white/15 bg-surface py-2.5 pl-9 pr-3 text-xs text-foreground outline-none focus:border-[#ff5c1a] transition"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Category</label>
            <div className="mt-3 flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              {categories.map((c) => (
                <label key={c} className="flex items-center gap-3 text-foreground cursor-pointer hover:text-foreground transition text-xs sm:text-[13px] font-medium py-1">
                  <div className={`grid h-4 w-4 place-items-center rounded border transition-colors ${category === c ? "border-[#ff5c1a] bg-[#ff5c1a]" : "border-zinc-700 bg-surface"}`}>
                    {category === c && <div className="h-2 w-2 rounded-sm bg-white" />}
                  </div>
                  <input type="radio" name="category" value={c} checked={category === c} onChange={() => { setCategory(c); if (showFilters) setShowFilters(false); }} className="hidden" />
                  <span className="truncate">{c}</span>
                  <span className="ml-auto text-[11px] text-muted font-semibold">{c === "All" ? products.length : products.filter((p) => p.category === c).length}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <label className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Price Range (₹)</label>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full px-3 py-2 border border-black/15 dark:border-white/15 bg-surface rounded-lg text-xs outline-none text-foreground font-bold" placeholder="Min" />
              <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full px-3 py-2 border border-black/15 dark:border-white/15 bg-surface rounded-lg text-xs outline-none text-foreground font-bold" placeholder="Max" />
            </div>
          </div>

          {(category !== "All" || search || priceRange[0] > 0 || priceRange[1] < 50000) && (
            <button onClick={() => { setSearch(""); setCategory("All"); setPriceRange([0, 50000]); }} className="mt-5 w-full py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs text-red-400 font-bold hover:bg-red-500/20 transition">
              Reset All Filters
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <div className="min-w-0 w-full">
          <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted border-b border-border pb-4">
            <span>Showing <b className="text-foreground font-black">{filtered.length}</b> verified picks {category !== "All" && <span>in <b className="text-[#ff5c1a]">{category}</b></span>}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="w-full sm:w-auto bg-[#15171b] border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2 text-xs font-bold outline-none text-foreground">
              <option value="popular">Sort: Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-black/15 dark:border-white/15 rounded-2xl bg-white/[0.01]">
              <p className="text-muted text-sm font-semibold">No products matched your filtering criteria.</p>
              <button onClick={() => { setSearch(""); setCategory("All"); setPriceRange([0, 50000]); }} className="mt-4 px-6 py-2.5 bg-orange-600 text-foreground rounded-xl text-xs font-extrabold shadow-lg hover:bg-orange-500 transition">Reset Filters</button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
