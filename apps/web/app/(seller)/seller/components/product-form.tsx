import { Layers, ImageIcon, DollarSign, Globe, Package, Check, Info, X } from "lucide-react";

export const PRODUCT_CATEGORIES = ["Helmets", "Riding Gear", "Accessories", "Performance", "Tires", "Luggage", "Maintenance", "Electronics", "Protection", "Apparel"];
export const BIKE_OPTIONS = ["Universal fit", "Royal Enfield Classic 350", "Royal Enfield Himalayan 450", "KTM Duke 390", "Yamaha R15 V4", "Bajaj Pulsar NS200", "TVS Apache RTR 160", "Honda CB350", "KTM RC 390", "Yamaha MT-15"];

interface ProductFormProps {
  form: any;
  setForm: (form: any) => void;
  editingId: string | null;
  handleSaveProduct: (e: React.FormEvent) => void;
  EMPTY_FORM: any;
  setActiveTab: (tab: string) => void;
}

const Field = ({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) => (
  <div>
    <label className="flex items-center gap-1 text-[12px] font-medium mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
      {hint && <span className="text-[9px] text-zinc-600 font-normal ml-1">({hint})</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full px-3 py-2.5 border border-border bg-surface rounded-lg text-[13px] outline-none focus:border-[#ff5c1a]/50 focus:ring-1 focus:ring-[#ff5c1a]/20 transition placeholder:text-zinc-600";

export function SellerProductForm({ form, setForm, editingId, handleSaveProduct, EMPTY_FORM, setActiveTab }: ProductFormProps) {
  return (
    <form onSubmit={handleSaveProduct} className="max-w-4xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[20px] font-bold">{editingId ? "Edit Product" : "Add New Product"}</h2>
          <p className="text-[12px] text-muted mt-0.5">Fill in the details below to {editingId ? "update" : "list"} your product on MotoTribe.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setForm({ ...EMPTY_FORM }); setActiveTab("Products"); }} className="px-4 py-2 text-[12px] font-medium text-muted bg-black/5 dark:bg-white/5 border border-border rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition">Discard</button>
          <button type="button" onClick={() => { setForm({ ...form, status: "DRAFT" }); }} className={`px-4 py-2 text-[12px] font-medium border rounded-lg transition ${form.status === "DRAFT" ? "bg-zinc-600/20 text-foreground border-zinc-500/30" : "text-muted border-border hover:bg-black/5 dark:hover:bg-white/5"}`}>
            Save as Draft
          </button>
          <button type="submit" className="px-5 py-2 text-[12px] font-bold text-foreground bg-[#ff5c1a] rounded-lg hover:bg-[#e04c0d] transition">
            {editingId ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Basic Info */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2"><Layers className="w-4 h-4 text-[#ff5c1a]" /> Basic Information</h3>
            <Field label="Product Name" required><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g., SMK Typhoon Graphic Helmet" /></Field>
            <Field label="Description" required hint="Supports markdown"><textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} placeholder="Describe your product in detail — features, materials, sizing..." /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category" required>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                  {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Compatible Bike">
                <select value={form.bike} onChange={(e) => setForm({ ...form, bike: e.target.value })} className={inputCls}>
                  {BIKE_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Tags" hint="comma-separated">
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className={inputCls} placeholder="e.g., helmet, safety, touring, full-face" />
            </Field>
          </div>

          {/* Media */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#ff5c1a]" /> Media</h3>
            <label className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center text-muted hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setForm({ ...form, image: ev.target.result as string });
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} 
              />
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <span className="text-[12px] font-medium">Drag & drop or click to upload</span>
              <span className="text-[10px] mt-0.5">PNG, JPG, WEBP up to 5MB each</span>
            </label>
            <Field label="Image URL" hint="paste a direct link">
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputCls} placeholder="https://..." />
            </Field>
            {form.image && (
              <div className="flex items-center gap-3 p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                <img src={form.image} alt="" className="w-14 h-14 rounded-lg object-cover border border-border" />
                <span className="text-[11px] text-muted flex-1 truncate">{form.image}</span>
                <button type="button" onClick={() => setForm({ ...form, image: "" })} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#ff5c1a]" /> Pricing</h3>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Selling Price" required><input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="₹ 0" /></Field>
              <Field label="Compare-at Price" hint="MRP"><input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className={inputCls} placeholder="₹ 0" /></Field>
              <Field label="Cost per item" hint="hidden"><input type="number" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} className={inputCls} placeholder="₹ 0" /></Field>
            </div>
            {form.price && form.comparePrice && Number(form.comparePrice) > Number(form.price) && (
              <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[11px] text-emerald-400">
                <Check className="w-3.5 h-3.5" /> Discount: {Math.round((1 - Number(form.price) / Number(form.comparePrice)) * 100)}% OFF
              </div>
            )}
            {form.price && form.costPrice && (
              <div className="flex items-center gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-lg text-[11px] text-muted">
                <Info className="w-3.5 h-3.5" /> Margin: ₹{(Number(form.price) - Number(form.costPrice)).toLocaleString("en-IN")} ({Math.round((1 - Number(form.costPrice) / Number(form.price)) * 100)}%)
              </div>
            )}
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2"><Globe className="w-4 h-4 text-[#ff5c1a]" /> SEO & Meta</h3>
            <Field label="Meta Title" hint={`${form.metaTitle.length}/70 chars`}>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className={inputCls} placeholder="Page title for search engines" maxLength={70} />
            </Field>
            <Field label="Meta Description" hint={`${form.metaDescription.length}/160 chars`}>
              <textarea rows={2} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className={inputCls} placeholder="Brief description for search results" maxLength={160} />
            </Field>
            {/* Preview */}
            {(form.metaTitle || form.name) && (
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                <p className="text-[10px] text-zinc-600 mb-1">Search Preview</p>
                <p className="text-[14px] text-blue-400 font-medium">{form.metaTitle || form.name}</p>
                <p className="text-[11px] text-emerald-500">mototribe.com/products/{form.name ? form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "..."}</p>
                <p className="text-[11px] text-muted mt-0.5 line-clamp-2">{form.metaDescription || form.description || "No description provided."}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Status */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-3">
            <h3 className="text-[14px] font-bold">Product Status</h3>
            <div className="flex gap-2">
              {(["ACTIVE", "DRAFT"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, status: s })}
                  className={`flex-1 py-2.5 rounded-lg text-[12px] font-bold transition border ${form.status === s ? (s === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-zinc-500/15 text-foreground border-zinc-500/30") : "border-border text-muted hover:bg-black/5 dark:hover:bg-white/5"}`}>
                  {s === "ACTIVE" ? "✅ Active" : "📝 Draft"}
                </button>
              ))}
            </div>
          </div>

          {/* Inventory */}
          <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
            <h3 className="text-[14px] font-bold flex items-center gap-2"><Package className="w-4 h-4 text-[#ff5c1a]" /> Inventory</h3>
            <Field label="SKU"><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputCls} placeholder="e.g., HLM-SMK-001" /></Field>
            <Field label="Barcode" hint="ISBN, UPC, GTIN"><input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className={inputCls} placeholder="e.g., 8901234567890" /></Field>
            <Field label="Stock Quantity" required><input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputCls} placeholder="0" /></Field>
            <Field label="Weight" hint="grams"><input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className={inputCls} placeholder="e.g., 1500" /></Field>
          </div>

          {/* Quick Tips */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-[13px] font-bold mb-3">💡 Tips for Better Listings</h3>
            <ul className="space-y-2 text-[11px] text-muted">
              <li>✓ Use high-quality images (800x800px min)</li>
              <li>✓ Write detailed descriptions with specs</li>
              <li>✓ Add relevant tags for discoverability</li>
              <li>✓ Set compare-at price to show discounts</li>
              <li>✓ Fill SEO fields for better search ranking</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}
