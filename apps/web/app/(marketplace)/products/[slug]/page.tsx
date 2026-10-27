"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Heart, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck, Share2, ChevronRight, MessageSquare, X, Send } from "lucide-react";
import { useCartStore } from "../../../../lib/cart-store";
import { api } from "../../../../lib/api/client";
import { AppShell } from "../../../../components/app-shell";
import { useAuth } from "../../../../components/auth-provider";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("Overview");
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Pre-purchase buyer-seller chat inquiry state
  const [showChatModal, setShowChatModal] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [chatSuccess, setChatSuccess] = useState(false);
  const { user } = useAuth();

  const handleOpenChat = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    setInquiryText(`Hi ${product?.seller || "Seller"}, I am interested in purchasing "${product?.name}" and wanted to ask about fitment compatibility and shipping before placing my order.`);
    setShowChatModal(true);
    setChatSuccess(false);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || !inquiryText.trim()) return;

    try {
      const subject = `Inquiry: ${product.name}`;
      // Create a thread (or backend could handle deduplication)
      const thread = await api.post<any>("/chat/threads", {
        sellerId: product.sellerId,
        subject
      });
      
      // Send the message
      await api.post<any>(`/chat/threads/${thread.id}/messages`, {
        text: inquiryText.trim()
      });

      setChatSuccess(true);
      setTimeout(() => {
        setShowChatModal(false);
        setChatSuccess(false);
      }, 2500);
    } catch (err) {
      console.error("Failed to send inquiry", err);
      alert("Failed to send message. Please try again.");
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const p: any = await api.get(`/products/${slug}`);
        setProduct({
          id: p.id,
          slug: p.slug,
          name: p.name,
          price: p.price / 100,
          comparePrice: p.comparePrice ? p.comparePrice / 100 : undefined,
          costPrice: p.costPrice ? p.costPrice / 100 : undefined,
          bike: p.fitments?.[0]?.bikeModel?.name || "Universal fit",
          seller: p.seller.name,
          sellerEmail: p.seller.email,
          sellerId: p.seller.id,
          category: p.category || "Accessories",
          rating: 4.5,
          reviews: p._count?.reviews || 0,
          description: p.description,
          image: p.images?.[0]?.url || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&q=80",
          images: p.images?.map((i: any) => i.url) || [],
          stock: p.stock,
          status: p.status,
          createdAt: p.createdAt
        });
      } catch (err) {
        console.error("Failed to fetch product", err);
      }
    }
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, sellerEmail: product.sellerEmail || "seller@mototribe.demo", quantity });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (!product) return (
    <AppShell>
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#ff5c1a] block mx-auto mb-4" />
          <p className="text-muted text-[13px]">Loading product...</p>
        </div>
      </div>
    </AppShell>
  );

  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  return (
    <AppShell>
      <main className="min-h-screen text-foreground">

      {/* Breadcrumb */}
      <div className="max-w-[1300px] mx-auto px-4 lg:px-7 py-3 flex items-center gap-2 text-[11px] text-muted">
        <Link href="/" className="hover:text-foreground transition">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/marketplace" className="hover:text-foreground transition">Marketplace</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-muted">{product.category}</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Product Layout */}
      <div className="max-w-[1300px] mx-auto px-4 lg:px-7 pb-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_320px]">
          {/* Image Section */}
          <section>
            <div className="relative rounded-2xl border border-border bg-surface overflow-hidden aspect-square">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.stock === 0 && <span className="absolute right-4 top-4 rounded-full bg-red-600/90 px-3 py-1 text-[10px] font-bold text-foreground">OUT OF STOCK</span>}
              {discount > 0 && <span className="absolute left-4 top-4 rounded-lg bg-[#ff5c1a] px-3 py-1.5 text-[11px] font-bold text-foreground">{discount}% OFF</span>}
              <button onClick={() => setWishlisted(!wishlisted)} className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border ${wishlisted ? "border-red-500 bg-red-500/20" : "border-white/30 bg-black/40"} backdrop-blur transition`}>
                <Heart className={`h-5 w-5 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
              </button>
            </div>
          </section>

          {/* Product Info */}
          <section className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-[12px]">
                <span className="text-[#ff5c1a] font-bold">{product.seller}</span>
                <span className="text-blue-400 text-[10px]">● Verified</span>
              </div>
              <h1 className="mt-2 text-[24px] lg:text-[28px] font-bold leading-tight">{product.name}</h1>
              <p className="text-[14px] text-muted mt-1">For {product.bike}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 text-[13px]">
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-yellow-400" : "fill-zinc-700 text-zinc-700"}`} />)}
              </div>
              <span className="text-muted">{product.rating} ({product.reviews} Reviews)</span>
            </div>

            {/* Price */}
            <div className="border-y border-border py-4">
              <div className="flex items-baseline gap-3">
                <b className="text-[32px] text-[#ff5c1a]">₹{product.price.toLocaleString("en-IN")}</b>
                {product.comparePrice && <span className="text-[18px] text-muted line-through">₹{product.comparePrice.toLocaleString("en-IN")}</span>}
                {discount > 0 && <span className="text-[14px] text-emerald-400 font-bold">({discount}% OFF)</span>}
              </div>
              <p className="mt-1 text-[11px] text-muted">Inclusive of all taxes</p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-[10px] text-muted">
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"><ShieldCheck className="mx-auto mb-1 h-5 w-5 text-emerald-400" />100% Genuine</div>
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"><span className="text-[16px] block mb-0.5">↩</span>Easy Returns<br />7 Days</div>
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"><Truck className="mx-auto mb-1 h-5 w-5 text-blue-400" />Free Shipping<br />Above ₹999</div>
              <div className="p-2 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"><span className="text-[16px] block mb-0.5">🔒</span>Secure Payment</div>
            </div>

            {/* Compatible Bike */}
            <div className="rounded-lg border border-border bg-[#15171b] p-3">
              <p className="text-[11px] text-muted mb-1">Compatible with</p>
              <div className="flex items-center gap-3">
                <span className="text-[#ff5c1a] font-bold text-[14px]">{product.bike.split(" ")[0]}</span>
                <span className="text-[13px]">{product.bike}</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-[14px] font-bold mb-2">Description</h3>
              <p className="text-[13px] text-muted leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((t: string, i: number) => <span key={i} className="px-2.5 py-1 bg-black/5 dark:bg-white/5 border border-border rounded-full text-[10px] text-muted">{t}</span>)}
              </div>
            )}
          </section>

          {/* Buy Box */}
          <aside className="h-fit rounded-xl border border-border bg-surface sticky top-[80px]">
            <div className="border-b border-border p-4 text-[13px]">
              Sold by <b className="ml-1">{product.seller}</b>
              <span className="float-right rounded bg-indigo-900/50 px-2 py-0.5 text-[10px] font-bold text-indigo-300">Preferred</span>
              <p className="mt-1 text-yellow-400 text-[12px]">★ {product.rating} <span className="text-muted">({product.reviews} Reviews)</span></p>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <b className="text-[28px] text-[#ff5c1a]">₹{product.price.toLocaleString("en-IN")}</b>
                {product.comparePrice && <span className="ml-2 text-[14px] text-muted line-through">₹{product.comparePrice.toLocaleString("en-IN")}</span>}
              </div>

              <div className="text-[12px]">
                <p className="text-emerald-400">● FREE Delivery</p>
                <p className="mt-1 text-muted">Get it by <b className="text-foreground">Sunday, 1 Jun</b></p>
              </div>

              <div className="text-[13px]">
                <p className="text-muted mb-2">Quantity</p>
                <div className="flex items-center">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-12 place-items-center rounded-l-lg border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition"><Minus className="h-4 w-4" /></button>
                  <span className="grid h-9 w-14 place-items-center border-y border-black/15 dark:border-white/15 font-bold">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} className="grid h-9 w-12 place-items-center rounded-r-lg border border-black/15 dark:border-white/15 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition"><Plus className="h-4 w-4" /></button>
                  <span className="ml-3 text-[11px] text-muted">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff5c1a] py-3 text-[14px] font-bold text-foreground transition hover:bg-[#e04c0d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-4 w-4" /> {addedToCart ? "✓ Added!" : "Add to Cart"}
              </button>

              <Link href="/cart" className="flex w-full items-center justify-center rounded-lg bg-[#ff5c1a]/15 py-3 text-[14px] font-bold text-[#ff5c1a] transition hover:bg-[#ff5c1a]/25">
                Buy Now
              </Link>

              <button onClick={() => setWishlisted(!wishlisted)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/15 dark:border-white/15 py-3 text-[13px] transition hover:bg-black/5 dark:hover:bg-white/5">
                <Heart className={`h-4 w-4 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} /> {wishlisted ? "Wishlisted ♥" : "Add to Wishlist"}
              </button>

              {/* Pre-Purchase Buyer-Seller Direct Chat */}
              <button 
                onClick={handleOpenChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 py-3 text-[13px] font-black text-foreground shadow-lg shadow-emerald-600/25 transition"
              >
                <MessageSquare className="h-4 w-4 fill-current" /> Ask Seller a Question (Chat)
              </button>

              <p className="text-[11px] text-muted text-center">🔥 37 people added to wishlist in last 24 hours</p>
            </div>
          </aside>
        </div>

        {/* Buyer Inquiry Modal */}
        {showChatModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-surface border border-emerald-500/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
              <button onClick={() => setShowChatModal(false)} className="absolute top-4 right-4 text-muted hover:text-foreground p-1">
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-foreground">Contact Seller: {product.seller}</h3>
                  <span className="text-[11px] text-emerald-400 font-bold block">MotoTribe Direct Messaging • Verified Store Partner</span>
                </div>
              </div>

              {chatSuccess ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-black text-2xl flex items-center justify-center mx-auto">✓</div>
                  <b className="text-foreground text-base block">Question Dispatched Successfully!</b>
                  <p className="text-xs text-muted max-w-xs mx-auto">Your inquiry has been delivered to <b>{product.seller}</b> and recorded in platform audit logs. Track replies under your Profile ➔ Messages tab.</p>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="mt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-muted block mb-1.5 uppercase">Your Pre-Purchase Question</label>
                    <textarea 
                      rows={5} 
                      required 
                      value={inquiryText} 
                      onChange={e => setInquiryText(e.target.value)} 
                      className="w-full rounded-xl bg-surface border border-black/15 dark:border-white/15 p-3.5 text-xs font-medium text-foreground outline-none focus:border-emerald-500 transition leading-relaxed" 
                    />
                  </div>
                  <div className="bg-black/5 dark:bg-white/5 p-3.5 rounded-xl border border-border text-[11px] text-foreground flex items-start gap-2 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><b>Rider Protection Guaranteed:</b> All communications occur directly within MotoTribe's verified platform network to ensure fast seller response times and 100% purchase warranty protection.</span>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setShowChatModal(false)} className="px-5 py-2.5 rounded-xl bg-black/10 dark:bg-white/10 hover:bg-white/20 text-foreground text-xs font-extrabold transition">
                      Cancel
                    </button>
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-foreground text-xs font-black shadow-lg shadow-emerald-600/30 transition flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" /> Send Message
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Product Tabs */}
        <div className="mt-8 rounded-xl border border-border bg-surface overflow-hidden">
          <nav className="flex gap-6 border-b border-border px-5 overflow-x-auto hide-scrollbar">
            {["Overview", "Specifications", `Reviews (${product.reviews})`, "Q&A", "Fitment"].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab.split(" ")[0])} className={`py-4 text-[13px] font-semibold border-b-2 transition whitespace-nowrap ${activeTab === tab.split(" ")[0] ? "border-[#ff5c1a] text-[#ff5c1a]" : "border-transparent text-muted hover:text-foreground"}`}>
                {tab}
              </button>
            ))}
          </nav>
          <div className="p-5 lg:p-7">
            {activeTab === "Overview" && (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="text-[18px] font-bold mb-3">Product Description</h2>
                  <p className="text-[13px] text-foreground leading-relaxed">{product.description}</p>
                  <ul className="mt-4 list-disc pl-5 space-y-1.5 text-[13px] text-foreground">
                    <li>Fits {product.bike} perfectly</li>
                    <li>Premium build quality</li>
                    <li>Easy installation</li>
                    <li>Backed by {product.seller} warranty</li>
                  </ul>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-950/50 border border-border p-6">
                  <h3 className="font-bold mb-4">Why Riders Love It</h3>
                  <div className="flex gap-4 items-start">
                    <div className="text-center">
                      <b className="text-[32px] text-yellow-400 block">{product.rating}</b>
                      <div className="text-yellow-400 text-[12px]">★★★★★</div>
                      <span className="text-[10px] text-muted">{product.reviews} reviews</span>
                    </div>
                    <div className="flex-1 text-[11px] text-muted space-y-1">
                      <div className="flex items-center gap-2">5 ★ <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: "80%" }} /></div></div>
                      <div className="flex items-center gap-2">4 ★ <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: "14%" }} /></div></div>
                      <div className="flex items-center gap-2">3 ★ <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: "4%" }} /></div></div>
                      <div className="flex items-center gap-2">2 ★ <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: "1%" }} /></div></div>
                      <div className="flex items-center gap-2">1 ★ <div className="flex-1 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-yellow-400 rounded-full" style={{ width: "1%" }} /></div></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab !== "Overview" && (
              <div className="text-center py-12 text-muted text-[13px]">
                {activeTab} section — Data synced from verified riders and sellers.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
    </AppShell>
  );
}
