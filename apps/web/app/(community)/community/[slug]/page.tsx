"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { AppShell } from "../../../../components/app-shell";
import { api } from "../../../../lib/api/client";
import { ThumbsUp, MessageSquare, Bookmark, Share2, ArrowLeft } from "lucide-react";

/**
 * Community post detail page.
 * Loads the post by slug from the demo store.
 */
export default function PostDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const data = await api.get<any>(`/community/posts/${slug}`);
        setPost(data);
      } catch (err) {
        console.error("Failed to fetch post", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-5 py-20 text-center text-muted">Loading...</main>
      </AppShell>
    );
  }

  if (!post) {
    return (
      <AppShell>
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <p className="text-muted text-[14px]">Post not found.</p>
          <Link href="/community" className="mt-4 inline-block text-[#ff5c1a] font-bold text-[13px] hover:underline">
            ← Back to Community
          </Link>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-5 py-10">
        <Link href="/community" className="text-sm text-muted hover:text-foreground transition flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back to Community
        </Link>

        <article className="mt-6 rounded-2xl border border-border bg-surface p-7">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#ff5c1a]/20 grid place-items-center text-[10px] font-bold text-[#ff5c1a]">
              {post.author?.name ? post.author.name[0] : "?"}
            </div>
            <div>
              <span className="text-[13px] font-bold">{post.author?.name || "Unknown"}</span>
              <span className="text-[10px] text-[#ff5c1a] ml-2">{post.community?.name || "General"}</span>
              <span className="block text-[10px] text-zinc-600">
                {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          <h1 className="text-[24px] font-bold leading-tight">{post.title}</h1>
          <p className="mt-5 leading-7 text-foreground text-[14px]">{post.body}</p>

          <div className="mt-7 flex items-center gap-5 border-t border-border pt-5 text-[13px] text-muted font-medium">
            <span className="flex items-center gap-1.5 hover:text-[#ff5c1a] cursor-pointer transition">
              <ThumbsUp className="w-4 h-4" /> {post.score || post.upvotes || 0} upvotes
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" /> {post._count?.comments || post.replies || 0} replies
            </span>
            <span className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition">
              <Share2 className="w-4 h-4" /> Share
            </span>
            <span className="flex items-center gap-1.5 hover:text-foreground cursor-pointer transition">
              <Bookmark className="w-4 h-4" /> Save
            </span>
          </div>
        </article>

        <section className="mt-7">
          <h2 className="font-bold text-[16px]">Top Replies</h2>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((reply: any, i: number) => (
              <div key={reply.id} className="mt-3 rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-700 grid place-items-center text-[9px] font-bold">
                    {reply.author?.name ? reply.author.name[0] : "R"}
                  </div>
                  <b className="text-[13px]">{reply.author?.name || "Rider"}</b>
                  <span className="text-[10px] text-zinc-600">{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-[13px] text-foreground leading-relaxed">{reply.body}</p>
              </div>
            ))
          ) : (
            <p className="text-[13px] text-muted mt-3">No replies yet.</p>
          )}
        </section>
      </main>
    </AppShell>
  );
}
