import { PlusCircle, Search, Edit2, Copy, Eye, Check, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../../../components/auth-provider";
import { useSellerProducts, useDeleteProduct, useUpdateProductStatus } from "../../../../features/marketplace/hooks/useProducts";
import { Product } from "../../../../features/marketplace/api/products";

interface ProductsViewProps {
  setActiveTab: (tab: string) => void;
  setForm: (form: any) => void;
  EMPTY_FORM: any;
  setEditingId: (id: string | null) => void;
  handleEditProduct: (p: any) => void; // Keeping for form population
  handleDuplicateProduct: (p: any) => void;
}

export function SellerProductsView({
  setActiveTab,
  setForm,
  EMPTY_FORM,
  setEditingId,
  handleEditProduct,
  handleDuplicateProduct,
}: ProductsViewProps) {
  const { user } = useAuth();
  // Using user.email as a temporary fallback for ID until AuthContext is fully migrated to JWT
  const sellerId = user?.email || "unknown"; 
  
  const { data: products = [], isLoading, isError } = useSellerProducts(sellerId);
  const deleteMutation = useDeleteProduct();
  const updateStatusMutation = useUpdateProductStatus();

  const [productFilter, setProductFilter] = useState("All");
  const [productSearch, setProductSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredProducts = products
    .filter((p) => productFilter === "All" || p.status === productFilter)
    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const handleDeleteProduct = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
    updateStatusMutation.mutate({ productId: id, status: newStatus as any });
  };

  const statusColor = (s: string) => {
    if (s === "ACTIVE") return "bg-emerald-500/10 text-emerald-400";
    if (s === "DRAFT") return "bg-zinc-500/10 text-muted";
    return "bg-red-500/10 text-red-400";
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-[14px]">Loading products...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <AlertTriangle className="w-8 h-8 mb-4" />
        <p className="text-[14px]">Failed to load products. Please try again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-[18px] font-bold">Products</h2>
          <p className="text-[12px] text-muted">
            {products.length} total · {products.filter((p) => p.status === "ACTIVE").length} active
          </p>
        </div>
        <button
          onClick={() => {
            setForm({ ...EMPTY_FORM });
            setEditingId(null);
            setActiveTab("Add Product");
          }}
          className="px-4 py-2 bg-[#ff5c1a] text-foreground text-[11px] font-bold rounded-lg hover:bg-[#e04c0d] transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-3.5 h-3.5" /> Add Product
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex gap-1">
          {["All", "ACTIVE", "DRAFT", "OUT_OF_STOCK"].map((f) => (
            <button
              key={f}
              onClick={() => setProductFilter(f)}
              className={`px-3 py-1.5 text-[11px] font-medium rounded-lg transition ${
                productFilter === f ? "bg-[#ff5c1a]/15 text-[#ff5c1a] border border-[#ff5c1a]/30" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 border border-transparent"
              }`}
            >
              {f === "All" ? "All" : f === "OUT_OF_STOCK" ? "Out of Stock" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 bg-[#15171b] border border-border rounded-lg px-3 py-1.5 w-[220px]">
          <Search className="w-3.5 h-3.5 text-muted" />
          <input
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products..."
            className="bg-transparent text-[12px] outline-none w-full text-foreground placeholder:text-zinc-600"
          />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-black/5 dark:border-white/5 text-muted">
            <tr>
              <th className="w-10 px-4 py-3"><input type="checkbox" /></th>
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((p) => (
              <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition group">
                <td className="px-4 py-3"><input type="checkbox" /></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={(p as any).image || (p.images?.[0]?.url) || ""} className="w-10 h-10 rounded-lg border border-border object-cover" />
                    <div>
                      <b className="text-[#ff5c1a] hover:underline cursor-pointer">{p.name}</b>
                      <span className="block text-[9px] text-zinc-600">{(p as any).bike}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${statusColor(p.status)}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                    <span className="text-[12px] font-bold">₹{p.price.toLocaleString("en-IN")}</span> {((p as any).comparePrice) && <span className="text-[10px] text-zinc-600 line-through">₹{((p as any).comparePrice).toLocaleString("en-IN")}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={p.stock <= 5 ? "text-red-400 font-bold" : p.stock <= 15 ? "text-yellow-400" : "text-foreground"}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{p.category}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEditProduct(p)} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition" title="Edit">
                      <Edit2 className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button onClick={() => handleDuplicateProduct(p)} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition" title="Duplicate">
                      <Copy className="w-3.5 h-3.5 text-muted" />
                    </button>
                    <button onClick={() => handleToggleStatus(p.id, p.status)} className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition" title={p.status === "ACTIVE" ? "Set Draft" : "Activate"}>
                      {p.status === "ACTIVE" ? <Eye className="w-3.5 h-3.5 text-muted" /> : <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded hover:bg-red-500/10 transition" title="Delete">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div className="text-center py-12 text-muted text-[13px]">No products found.</div>}
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center">
          <div className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-[16px] font-bold text-center">Delete Product?</h3>
                      <span className="text-[10px] text-muted mt-0.5 flex items-center gap-1.5">For {(filteredProducts.find(p => p.id === deleteConfirm) as any)?.bike || "Any"} • <b className="text-muted">{(filteredProducts.find(p => p.id === deleteConfirm))?.category}</b></span>
            <p className="text-[12px] text-muted text-center mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-[12px] font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition">Cancel</button>
              <button
                onClick={() => {
                  handleDeleteProduct(deleteConfirm);
                  setDeleteConfirm(null);
                }}
                className="flex-1 py-2 bg-red-500 rounded-lg text-[12px] font-bold text-foreground hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
