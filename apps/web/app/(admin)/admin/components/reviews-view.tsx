import { useState } from "react";
import { Star, Search, Check, X } from "lucide-react";
import { useDashboardReviews, useUpdateReviewStatus } from "../../../../features/platform/api/reviews";

export function AdminReviewsView() {
  const { data: reviews = [], isLoading } = useDashboardReviews();
  const updateStatus = useUpdateReviewStatus();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReviews = reviews.filter((item: any) => 
    item.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="p-8 text-center text-muted">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="w-5 h-5 text-[#ff5c1a]" /> Review Moderation
          </h2>
          <p className="text-muted text-[13px] mt-1">Moderate buyer reviews to ensure platform guidelines are met.</p>
        </div>
      </div>

      <div className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl overflow-hidden flex flex-col h-[600px]">
        <div className="p-4 border-b border-black/5 dark:border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
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
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Rating</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Review Content</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold text-muted uppercase tracking-wider text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted text-[13px]">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filteredReviews.map((item: any) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition">
                    <td className="px-4 py-3 text-foreground text-[12px] font-medium">{item.product?.name}</td>
                    <td className="px-4 py-3 text-[#ff5c1a] text-[13px] flex items-center gap-1">
                      {item.rating} <Star className="w-3 h-3 fill-current" />
                    </td>
                    <td className="px-4 py-3 text-muted text-[12px] max-w-[300px] truncate">
                      {item.body}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        item.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                        item.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'APPROVED' && (
                          <button 
                            onClick={() => updateStatus.mutate({ id: item.id, status: 'APPROVED' })}
                            className="p-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded transition"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {item.status !== 'REJECTED' && (
                          <button 
                            onClick={() => updateStatus.mutate({ id: item.id, status: 'REJECTED' })}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded transition"
                            title="Reject & Hide"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
