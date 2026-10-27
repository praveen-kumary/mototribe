"use client";

import { useBlog, useUpdateBlogStatus } from "../../../../features/platform/api/blog";
import { Loader2, FileText, Check, X } from "lucide-react";

export function SellerBlogView() {
  const { data: blogs, isLoading, error } = useBlog();
  const updateStatus = useUpdateBlogStatus();

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff5c1a]" /></div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-500/10 rounded-xl">Failed to load blogs</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Blog & Guides</h2>
      </div>

      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/5 dark:bg-white/5 text-muted text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Author</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {blogs?.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-muted">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  No articles found.
                </td>
              </tr>
            ) : (
              blogs?.map((blog: any) => (
                <tr key={blog.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-4">
                    <div className="text-foreground font-medium">{blog.title}</div>
                    <div className="text-xs text-muted">{blog.slug}</div>
                  </td>
                  <td className="p-4 text-muted">
                    {blog.author?.name}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${blog.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {blog.status === "DRAFT" && (
                      <button onClick={() => updateStatus.mutate({ id: blog.id, status: "PUBLISHED" })} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold transition">
                        <Check className="w-3 h-3" /> Publish
                      </button>
                    )}
                    {blog.status === "PUBLISHED" && (
                      <button onClick={() => updateStatus.mutate({ id: blog.id, status: "ARCHIVED" })} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-bold transition">
                        <X className="w-3 h-3" /> Archive
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
