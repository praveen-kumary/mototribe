
import { useState } from "react";
import { Search, Eye, Edit2, EyeOff, Check, Trash2, X } from "lucide-react";

interface ProductsViewProps {
  products: any[];
  sellerNames: string[];
  statusColor: (s: string) => string;
  handleToggleProduct: (id: string) => void;
  handleDeleteProduct: (id: string) => void;
  saveProductEdit: (product: any) => void;
}

export function AdminProductsView({
  products, sellerNames, statusColor, handleToggleProduct, handleDeleteProduct, saveProductEdit
}: ProductsViewProps) {
  const [productSearch, setProductSearch] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState("All");
  const [sellerFilter, setSellerFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const filteredProducts = products
    .filter((p) => productStatusFilter === "All" || p.status === productStatusFilter)
    .filter((p) => sellerFilter === "All" || p.seller === sellerFilter)
    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const handleSaveEdit = () => {
    if (editingProduct) {
      saveProductEdit(editingProduct);
      setEditingProduct(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[18px] font-bold">Global Product Catalog</h2>
          <p className="text-[12px] text-muted">{products.length} total across {sellerNames.length} sellers</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex gap-1">
          {["All", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((f) => (
            <button key={f} onClick={() => setProductStatusFilter(f)} className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition ${productStatusFilter === f ? "bg-[#ff5c1a]/15 text-[#ff5c1a] border border-[#ff5c1a]/30" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"}`}>
              {f === "All" ? "All" : f === "OUT_OF_STOCK" ? "Out of Stock" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <select value={sellerFilter} onChange={(e) => setSellerFilter(e.target.value)} className="bg-[#15171b] border border-border rounded-lg px-3 py-1.5 text-[11px] text-muted outline-none">
          <option value="All">All Sellers</option>
          {sellerNames.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-[#15171b] border border-border rounded-lg px-3 py-1.5 w-[220px]">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input value={productSearch} onChange={(e) => setProductSearch(e.target.value)} placeholder="Search products..." className="bg-transparent text-[12px] outline-none w-full text-foreground placeholder:text-zinc-600" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-black/5 dark:border-white/5 text-muted">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">Seller</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg border border-border object-cover" />
                    <div><button onClick={() => setSelectedProduct(p)} className="text-[#ff5c1a] font-semibold hover:underline text-left">{p.name}</button><span className="block text-[9px] text-zinc-600">{p.bike}</span></div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted">{p.seller}</td>
                <td className="px-4 py-3 font-semibold">₹{p.price.toLocaleString("en-IN")}{p.comparePrice && <span className="block text-[9px] text-muted line-through">₹{p.comparePrice.toLocaleString("en-IN")}</span>}</td>
                <td className="px-4 py-3"><span className={p.stock <= 5 ? "text-red-400 font-bold" : p.stock <= 15 ? "text-yellow-400" : "text-foreground"}>{p.stock}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor(p.status)}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-muted">{p.category}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => setSelectedProduct(p)} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10" title="View"><Eye className="w-3.5 h-3.5 text-muted" /></button>
                    <button onClick={() => setEditingProduct({ ...p })} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10" title="Edit"><Edit2 className="w-3.5 h-3.5 text-muted" /></button>
                    <button onClick={() => handleToggleProduct(p.id)} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10" title={p.status === "ACTIVE" ? "Take Down" : "Activate"}>{p.status === "ACTIVE" ? <EyeOff className="w-3.5 h-3.5 text-yellow-400" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}</button>
                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 rounded hover:bg-red-500/10" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div className="text-center py-12 text-muted text-[13px]">No products found.</div>}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center" onClick={() => setSelectedProduct(null)}>
          <div className="bg-surface border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-[16px] font-bold">Product Details</h3><button onClick={() => setSelectedProduct(null)}><X className="w-5 h-5 text-muted" /></button></div>
            <img src={selectedProduct.image} className="w-full h-[200px] rounded-lg object-cover border border-border mb-4" />
            <h4 className="text-[18px] font-bold">{selectedProduct.name}</h4>
            <p className="text-[12px] text-muted mt-1">{selectedProduct.description}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 text-[12px]">
              <div><span className="text-muted block">Seller</span><b>{selectedProduct.seller}</b></div>
              <div><span className="text-muted block">Price</span><b>₹{selectedProduct.price.toLocaleString("en-IN")}</b>{selectedProduct.comparePrice && <span className="text-muted line-through ml-1">₹{selectedProduct.comparePrice}</span>}</div>
              <div><span className="text-muted block">Category</span><b>{selectedProduct.category}</b></div>
              <div><span className="text-muted block">Compatible Bike</span><b>{selectedProduct.bike}</b></div>
              <div><span className="text-muted block">Stock</span><b className={selectedProduct.stock <= 5 ? "text-red-400" : ""}>{selectedProduct.stock}</b></div>
              <div><span className="text-muted block">Status</span><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor(selectedProduct.status)}`}>{selectedProduct.status}</span></div>
              <div><span className="text-muted block">SKU</span><b className="font-mono">{selectedProduct.sku || "N/A"}</b></div>
              <div><span className="text-muted block">Rating</span><b>⭐ {selectedProduct.rating} ({selectedProduct.reviews} reviews)</b></div>
              {selectedProduct.metaTitle && <div className="col-span-2"><span className="text-muted block">Meta Title</span><b>{selectedProduct.metaTitle}</b></div>}
              {selectedProduct.tags && <div className="col-span-2"><span className="text-muted block">Tags</span><div className="flex flex-wrap gap-1 mt-1">{selectedProduct.tags.map((t: any, i: number) => <span key={i} className="px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[10px]">{t}</span>)}</div></div>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setEditingProduct({ ...selectedProduct }); setSelectedProduct(null); }} className="flex-1 py-2 bg-[#ff5c1a] text-foreground rounded-lg text-[12px] font-bold hover:bg-[#e04c0d] transition">Edit Product</button>
              <button onClick={() => { handleToggleProduct(selectedProduct.id); setSelectedProduct(null); }} className="flex-1 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-[12px] font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition">{selectedProduct.status === "ACTIVE" ? "Take Down" : "Activate"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center" onClick={() => setEditingProduct(null)}>
          <div className="bg-surface border border-border rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-[16px] font-bold">Admin Edit: {editingProduct.name}</h3><button onClick={() => setEditingProduct(null)}><X className="w-5 h-5 text-muted" /></button></div>
            <div className="space-y-3">
              <div><label className="text-[11px] text-muted block mb-1">Name</label><input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-[13px] outline-none" /></div>
              <div><label className="text-[11px] text-muted block mb-1">Price</label><input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-[13px] outline-none" /></div>
              <div><label className="text-[11px] text-muted block mb-1">Stock</label><input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-[13px] outline-none" /></div>
              <div><label className="text-[11px] text-muted block mb-1">Status</label>
                <select value={editingProduct.status} onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })} className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-[13px] outline-none">
                  <option value="ACTIVE">ACTIVE</option><option value="DRAFT">DRAFT</option><option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                </select>
              </div>
              <div><label className="text-[11px] text-muted block mb-1">Category</label><input value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-[13px] outline-none" /></div>
              <div><label className="text-[11px] text-muted block mb-1">Description</label><textarea rows={3} value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full px-3 py-2 border border-border bg-surface rounded-lg text-[13px] outline-none" /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditingProduct(null)} className="flex-1 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-[12px] font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition">Cancel</button>
              <button onClick={handleSaveEdit} className="flex-1 py-2 bg-[#ff5c1a] text-foreground rounded-lg text-[12px] font-bold hover:bg-[#e04c0d] transition">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
