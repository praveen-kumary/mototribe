import { useState } from "react";
import { BookOpen, Plus, Trash2, Eye, LayoutTemplate, PenTool } from "lucide-react";
import { useBlog, useCreateBlog, useUpdateBlogStatus } from "../../../../features/platform/api/blog";
import { motion, AnimatePresence } from "framer-motion";

export function AdminBlogView() {
  const { data: blogs = [], isLoading, error } = useBlog();
  const createBlog = useCreateBlog();
  const updateStatus = useUpdateBlogStatus();

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    createBlog.mutate({ title: newTitle, content: newContent }, {
      onSuccess: () => {
        setNewTitle("");
        setNewContent("");
        setShowForm(false);
      }
    });
  };

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const next = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    updateStatus.mutate({ id, status: next });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load articles. Please check connection.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-orange-500" />
            <span>Editorial Blog & Knowledgebase</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Articles published here are live in the Rider Guides & Maintenance knowledgebase.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-orange-600/30 transition-all">
          <Plus className={`w-4 h-4 transition-transform ${showForm ? "rotate-45" : ""}`} />
          <span>{showForm ? "Close Editor" : "Write Article"}</span>
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form 
            initial={{ opacity: 0, height: 0, overflow: "hidden" }}
            animate={{ opacity: 1, height: "auto", overflow: "visible" }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            onSubmit={handleAdd} 
            className="rounded-2xl border border-orange-500/30 bg-surface p-5 sm:p-6 shadow-xl space-y-4"
          >
            <b className="text-base text-foreground font-bold flex items-center gap-2">
              <PenTool className="w-4 h-4 text-orange-500" /> Draft New Article
            </b>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-muted block mb-1 uppercase">Headline Title</label>
                <input required placeholder="e.g. Top 5 Touring Helmets..." value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-orange-500 transition-colors" />
              </div>
              <div className="sm:col-span-3">
                <label className="text-xs font-bold text-muted block mb-1 uppercase">Content Body</label>
                <textarea rows={4} placeholder="Write detailed instructions..." value={newContent} onChange={e=>setNewContent(e.target.value)} className="w-full bg-surface border border-black/15 dark:border-white/15 rounded-xl p-3.5 text-xs font-medium text-foreground outline-none focus:border-orange-500 transition-colors" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button type="submit" disabled={createBlog.isPending} className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all">
                {createBlog.isPending ? "Publishing..." : "Publish to Knowledgebase"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <AnimatePresence>
          {blogs.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-2 p-12 text-center text-muted bg-black/5 dark:bg-white/5 rounded-2xl border border-border">
              No articles published yet.
            </motion.div>
          )}
          {blogs.map((b: any, idx: number) => (
            <motion.div 
              key={b.id} 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 sm:p-6 shadow-lg space-y-4 hover:border-orange-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                  <span className="text-[10px] uppercase font-black tracking-wider text-orange-400 bg-orange-500/15 px-2.5 py-0.5 rounded border border-orange-500/20">
                    <LayoutTemplate className="w-3 h-3 inline mr-1" /> Article
                  </span>
                  <span className="text-[10px] text-muted font-extrabold flex items-center gap-1">
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <b className="text-base font-black text-foreground block mt-3 leading-snug group-hover:text-orange-400 transition-colors">{b.title}</b>
                <span className="text-xs text-muted font-bold block mt-1">
                  ✍️ By <b className="text-foreground">{b.author?.name || "System"}</b>
                </span>
                {b.content && <p className="text-xs text-foreground font-medium line-clamp-3 mt-2.5 leading-relaxed bg-black/40 p-3 rounded-xl border border-black/5 dark:border-white/5">{b.content}</p>}
              </div>
              
              <div className="pt-4 border-t border-border flex items-center justify-between text-xs font-extrabold">
                <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-black border ${
                  b.status === "PUBLISHED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                }`}>
                  {b.status}
                </span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleStatusToggle(b.id, b.status)}
                    disabled={updateStatus.isPending}
                    className="text-orange-400 hover:underline disabled:opacity-50"
                  >
                    {b.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
