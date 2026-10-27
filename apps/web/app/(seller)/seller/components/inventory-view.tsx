import { useState } from "react";
import { Package, Search, ArrowUpDown, MoreHorizontal, Edit, Check } from "lucide-react";
import { useInventory, useUpdateStock } from "../../../../features/seller/api/inventory";

export function SellerInventoryView() {
  const { data: inventory = [], isLoading } = useInventory();
  const updateStock = useUpdateStock();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingStock, setEditingStock] = useState<string | null>(null);
  const [stockValue, setStockValue] = useState(0);

  const filteredInventory = inventory.filter((item: any) => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveStock = (id: string) => {
    updateStock.mutate({ id, stock: stockValue });
    setEditingStock(null);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted">Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5 text-[#ff5c1a]" /> Inventory Management
          </h2>
          <p className="text-muted text-[13px] mt-1">Track and update your product stock levels in real-time.</p>
        </div>
      </div>

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search by product name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1a1b23] border border-border rounded-lg pl-9 pr-4 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto hide-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">SKU</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Available Stock</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Reserved</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted text-[13px]">
                    No inventory found.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition group">
                    <td className="px-4 py-3">
                      <b className="text-foreground text-[13px]">{item.name}</b>
                    </td>
                    <td className="px-4 py-3 text-muted text-[12px] font-mono">{item.sku || "N/A"}</td>
                    <td className="px-4 py-3">
                      {editingStock === item.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={stockValue} 
                            onChange={(e) => setStockValue(parseInt(e.target.value) || 0)}
                            className="w-20 bg-[#1a1b23] border border-[#ff5c1a]/50 rounded px-2 py-1 text-[12px] focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleSaveStock(item.id)} className="p-1 bg-[#ff5c1a] text-foreground rounded hover:bg-[#e04c0d]">
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className={`text-[13px] font-bold ${item.stock <= 5 ? "text-red-400" : "text-emerald-400"}`}>
                          {item.stock}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted text-[12px]">{item.reservedStock}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${item.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-500/10 text-muted'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => { setEditingStock(item.id); setStockValue(item.stock); }}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 rounded transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
