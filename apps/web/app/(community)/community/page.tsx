"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { AppShell } from "../../../components/app-shell";
import { useAuth } from "../../../components/auth-provider";
import { api } from "../../../lib/api/client";
import {
  MessageSquare, ThumbsUp, PlusCircle, X, Home, TrendingUp,
  Clock, Users, Bookmark, FileText, Filter, Share2, Image as ImageIcon,
  BarChart2, CalendarDays, MoreHorizontal, Play, ChevronRight,
  Award, Crown, Flame, Heart
} from "lucide-react";
import { CreateCommunityModal } from "./components/create-community-modal";

const SIDEBAR_NAV = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Users, label: "Following", id: "following" },
  { icon: FileText, label: "My Posts", id: "my-posts" },
  { icon: Bookmark, label: "Saved", id: "saved" },
  { icon: FileText, label: "My Drafts", id: "drafts" },
];

const FEED_TABS = [
  { label: "Latest", id: "latest" },
  { label: "Popular", id: "popular" }
];

const STATIC_CATEGORIES = [
  "General Talk", "Riding Stories",
  "Bike Help", "Modifications", "Gear & Accessories",
  "Maintenance", "Touring", "Track & Performance",
  "Buy / Sell", "Events & Meets",
];



export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("latest");
  const [activeNav, setActiveNav] = useState("home");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("ALL");
  const [newPost, setNewPost] = useState({ title: "", body: "", communityId: "" });

  useEffect(() => {
    async function fetchCommunities() {
      try {
        const data = await api.get<any[]>("/community/groups");
        setCommunities(data);
        if (data.length > 0) setNewPost(prev => ({ ...prev, communityId: data[0].id }));
      } catch (err) {
        console.error("Failed to fetch communities", err);
      }
    }
    fetchCommunities();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const queryParams = new URLSearchParams();
        if (activeCategoryId !== "ALL") queryParams.append("communityId", activeCategoryId);
        if (activeTab) queryParams.append("sort", activeTab);
        if (activeNav !== "home") queryParams.append("filter", activeNav);
        if (user?.id) queryParams.append("userId", user.id);
        
        const url = `/community/posts?${queryParams.toString()}`;
        const data = await api.get<any[]>(url);
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts", err);
      }
    }
    fetchPosts();
  }, [activeCategoryId, activeTab, activeNav, user]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { alert("Please sign in to create a post."); return; }
    
    try {
      const data = await api.post<any>("/community/posts", {
        title: newPost.title,
        body: newPost.body,
        communityId: newPost.communityId
      });
      setPosts([data, ...posts]);
      setIsCreating(false);
      setNewPost({ title: "", body: "", communityId: communities.length > 0 ? communities[0].id : "" });
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  const handleUpvote = async (id: string) => {
    if (!user) { alert("Please sign in to upvote."); return; }
    try {
      const res = await api.post<any>(`/community/posts/${id}/upvote`, {});
      setPosts(posts.map(p => {
        if (p.id === id) {
          return { ...p, score: res.upvoted ? p.score + 1 : p.score - 1 };
        }
        return p;
      }));
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  const handleSavePost = async (id: string) => {
    if (!user) { alert("Please sign in to save a post."); return; }
    try {
      await api.post<any>(`/community/posts/${id}/save`, {});
      if (activeNav === "saved") {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        alert("Post saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save post", err);
    }
  };

  const postImages = [
    "/images/bike_himalayan450.png", "/images/bike_duke390.png",
    "/images/hero1.png", "/images/hero2.png",
  ];

  return (
    <AppShell>
      <CreateCommunityModal 
        isOpen={isCreating} 
        onClose={() => setIsCreating(false)} 
        onSuccess={(newCommunity) => {
          setCommunities([newCommunity, ...communities]);
          setActiveCategoryId(newCommunity.id);
        }} 
      />
      <main className="min-h-screen bg-background text-foreground">
        {/* Hero Banner */}
        <section className="relative h-[180px] overflow-hidden">
          <img src="/images/hero1.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/60 to-transparent" />
          <div className="relative z-10 max-w-[1200px] mx-auto px-6 h-full flex flex-col justify-center">
            <h1 className="text-[28px] font-black">India&apos;s Largest Motorcycle Community</h1>
            <p className="text-[13px] text-muted mt-1">Share. Learn. Ride. Repeat.</p>
            <div className="flex gap-8 mt-4 text-center">
              {[
                { icon: Users, val: "1.2M+", label: "Members" },
                { icon: MessageSquare, val: "54K+", label: "Discussions" },
                { icon: FileText, val: "240K+", label: "Posts" },
                { icon: Flame, val: "50K+", label: "Daily Active" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-[#ff5c1a]" />
                  <div className="text-left">
                    <b className="text-[14px] block leading-tight">{s.val}</b>
                    <span className="text-[10px] text-muted">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[220px_1fr_280px] gap-6">

          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="hidden lg:block space-y-6">
            <nav className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-3">Community</p>
              {SIDEBAR_NAV.map((item) => (
                <button 
                  key={item.id} 
                  onClick={() => {
                    if (["following", "my-posts", "saved", "drafts"].includes(item.id) && !user) {
                      alert("Please sign in to view this tab.");
                      return;
                    }
                    setActiveNav(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition ${activeNav === item.id ? "bg-[#ff5c1a] text-foreground" : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"}`}
                >
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </nav>

            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-3">Categories</p>
              <button 
                onClick={() => setActiveCategoryId("ALL")}
                className={`w-full text-left px-3 py-1.5 text-[12px] rounded-md transition ${activeCategoryId === "ALL" ? "bg-black/10 dark:bg-white/10 text-foreground font-bold" : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}
              >
                All Discussions
              </button>
              {communities.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`w-full text-left px-3 py-1.5 text-[12px] rounded-md transition ${activeCategoryId === cat.id ? "bg-black/10 dark:bg-white/10 text-foreground font-bold" : "text-muted hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2 px-3">Communities</p>
              {communities.map((c, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 text-[12px] text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#ff5c1a]/20 grid place-items-center text-[8px] font-bold text-[#ff5c1a]">{c.name[0]}</div>
                    <div>
                      <span className="block text-foreground text-[12px]">{c.name}</span>
                      <span className="text-[9px] text-zinc-600">{c._count?.members || 0} members</span>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full text-left px-3 py-2 text-[12px] text-[#ff5c1a] hover:text-[#ff7137] transition font-semibold"
              >
                + Create Community
              </button>
            </div>

            {/* Tribe Pro */}
            <div className="rounded-xl border border-orange-900/30 bg-gradient-to-br from-[#1a0f07] to-[#0c0d12] p-4">
              <p className="text-[9px] uppercase tracking-widest text-muted">Unlock more with</p>
              <b className="text-[16px] font-black italic block mt-1">TRIBE PRO</b>
              <ul className="mt-3 space-y-1.5 text-[11px] text-muted">
                <li>✓ Exclusive content</li>
                <li>✓ Early access to sales</li>
                <li>✓ Pro community badges</li>
                <li>✓ No ads experience</li>
              </ul>
              <button className="mt-4 w-full py-2 bg-[#ff5c1a] text-foreground text-[11px] font-bold rounded-lg hover:bg-[#e04c0d] transition">
                Go Premium
              </button>
            </div>
          </aside>

          {/* ─── MAIN FEED ─── */}
          <section className="min-w-0">
            {/* Dummy Trending Removed */}

            {/* Create Post */}
            <div className="rounded-xl border border-border bg-surface p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ff5c1a]/20 grid place-items-center text-[#ff5c1a] font-bold shrink-0">
                  {user ? user.name[0] : "?"}
                </div>
                <button onClick={() => setIsCreating(true)} className="flex-1 text-left px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-border rounded-full text-[13px] text-muted hover:bg-white/8 hover:border-black/15 dark:border-white/15 transition">
                  What&apos;s on your mind, rider?
                </button>
                <button className="px-4 py-2.5 bg-[#ff5c1a] text-foreground text-[12px] font-bold rounded-lg hover:bg-[#e04c0d] transition">
                  Post
                </button>
              </div>
              <div className="flex gap-4 mt-3 pl-[52px] text-[11px] text-muted">
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition"><ImageIcon className="w-3.5 h-3.5" /> Photo / Video</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition"><BarChart2 className="w-3.5 h-3.5" /> Poll</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition"><FileText className="w-3.5 h-3.5" /> Ride Log</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition"><CalendarDays className="w-3.5 h-3.5" /> Event</span>
                <span className="flex items-center gap-1 cursor-pointer hover:text-foreground transition"><MoreHorizontal className="w-3.5 h-3.5" /> More</span>
              </div>
            </div>

            {/* Create Post Modal */}
            {isCreating && (
              <div className="rounded-xl border border-[#ff5c1a]/50 bg-surface p-5 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <b className="text-[15px]">Create a New Post</b>
                  <button onClick={() => setIsCreating(false)} className="text-muted hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
                <form onSubmit={handleCreatePost} className="space-y-3">
                  <input required value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} placeholder="Title of your post" className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-[13px] outline-none focus:border-[#ff5c1a]/50" />
                  <textarea required rows={4} value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })} placeholder="What's on your mind?" className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-[13px] outline-none focus:border-[#ff5c1a]/50" />
                  <div className="flex items-center justify-between">
                    <select value={newPost.communityId} onChange={(e) => setNewPost({ ...newPost, communityId: e.target.value })} className="rounded-lg border border-border bg-surface px-3 py-2 text-[12px] outline-none text-foreground">
                      {communities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button type="submit" className="rounded-lg bg-[#ff5c1a] px-6 py-2 text-[12px] font-bold text-foreground hover:bg-[#e04c0d] transition">Post</button>
                  </div>
                </form>
              </div>
            )}

            {/* Feed Header and Tabs */}
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div className="flex gap-2">
                {FEED_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-semibold transition ${activeTab === tab.id ? "bg-[#ff5c1a] text-white" : "bg-black/5 dark:bg-white/5 text-muted hover:bg-black/10 dark:hover:bg-white/10"}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span>Sort by: <b className="text-foreground">{activeTab === "popular" ? "Best" : "Latest"}</b></span>
                <button className="p-1.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition"><Filter className="w-3.5 h-3.5" /></button>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((d, idx) => (
                <div key={d.id} className="rounded-xl border border-border bg-surface p-5 hover:border-black/15 dark:border-white/15 transition">
                  {/* Author */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#ff5c1a]/20 grid place-items-center text-[10px] font-bold text-[#ff5c1a]">
                      {d.author?.name ? d.author.name[0] : "?"}
                    </div>
                    <div>
                      <span className="text-[12px] font-bold">{d.author?.name || "Unknown Rider"}</span>
                      <span className="text-[10px] text-[#ff5c1a] ml-2">{d.community?.name || "General"}</span>
                      <span className="block text-[10px] text-zinc-600">{new Date(d.createdAt).toLocaleDateString()} · {d.community?.name || "General"}</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Link href={`/community/${d.id}`} className="hover:text-[#ff5c1a] transition">
                        <h2 className="text-[16px] font-bold leading-snug">{d.title}</h2>
                      </Link>
                      <p className="mt-2 text-[13px] text-muted leading-relaxed line-clamp-3">{d.body}</p>
                    </div>
                    {/* Post image */}
                    <div className="hidden sm:block w-[140px] h-[100px] rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                      <img src={postImages[idx % postImages.length]} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-5 text-[12px] text-muted font-medium">
                    <button onClick={() => handleUpvote(d.id)} className="flex items-center gap-1.5 hover:text-[#ff5c1a] transition">
                      <ThumbsUp className="h-4 w-4" /> {d.score || d.upvotes || 0}
                    </button>
                    <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {d._count?.comments || d.replies || 0}</span>
                    <span className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition"><Share2 className="h-4 w-4" /> Share</span>
                    <button onClick={() => handleSavePost(d.id)} className="flex items-center gap-1.5 cursor-pointer hover:text-foreground transition"><Bookmark className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="rounded-xl border border-border bg-surface p-12 text-center text-muted">
                  <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full grid place-items-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-zinc-500" />
                  </div>
                  <b className="block text-[14px] text-foreground">No posts found</b>
                  <p className="text-[12px] mt-1">Check back later or change your filter.</p>
                </div>
              )}
            </div>

            <button className="w-full mt-6 py-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-[13px] font-bold text-muted hover:bg-black/10 dark:hover:bg-white/10 hover:text-foreground transition">
              Load More Posts 🔄
            </button>
          </section>

          {/* ─── RIGHT SIDEBAR ─── */}
          <aside className="hidden lg:block space-y-5">
            {/* Community Highlights */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <div className="flex justify-between items-center mb-3">
                <b className="text-[13px]">Community Highlights</b>
                <Link href="#" className="text-[10px] text-[#ff5c1a] font-semibold">View All</Link>
              </div>
              <div className="space-y-3 text-[12px]">
                <div className="flex items-start gap-2">
                  <span className="text-[#ff5c1a]">📜</span>
                  <div><b className="block">Community Guidelines</b><span className="text-muted text-[10px]">Be a part of positive & respectful community</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#ff5c1a]">🛡</span>
                  <div><b className="block">Buyer Protection</b><span className="text-muted text-[10px]">Stay safe while buying & selling</span></div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#ff5c1a]">✨</span>
                  <div><b className="block">How to Post</b><span className="text-muted text-[10px]">Learn how to make the most of the community</span></div>
                </div>
              </div>
            </div>

            {/* Popular Communities - Now dynamic */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <b className="text-[13px] block mb-3">Popular Communities</b>
              <div className="space-y-2">
                {communities.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#ff5c1a]/15 grid place-items-center text-[9px] font-bold text-[#ff5c1a]">{c.name[0]}</div>
                      <div>
                        <span className="text-[12px] font-semibold block">{c.name}</span>
                        <span className="text-[9px] text-muted">{c._count?.members || 0} members</span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-[#ff5c1a] text-foreground text-[10px] font-bold rounded-md hover:bg-[#e04c0d] transition">Join</button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </main>
    </AppShell>
  );
}
