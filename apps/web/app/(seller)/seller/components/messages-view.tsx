import { useState, useEffect } from "react";
import { MessageSquare, Send, User, Check, Search } from "lucide-react";
import { useAuth } from "../../../../components/auth-provider";
import { api } from "../../../../lib/api/client";

export function SellerMessagesView() {
  const [threads, setThreads] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchThreads() {
      try {
        const data = await api.get<any[]>("/chat/threads");
        
        // Sort by lastUpdated or createdAt
        const sorted = data.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        setThreads(sorted);
        
        if (sorted.length > 0 && !activeThreadId) {
          setActiveThreadId(sorted[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch threads", err);
      }
    }
    
    if (user) fetchThreads();
  }, [user]);

  useEffect(() => {
    async function fetchMessages() {
      if (!activeThreadId) return;
      try {
        const data = await api.get<any[]>(`/chat/threads/${activeThreadId}/messages`);
        setMessages(data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    }
    fetchMessages();
  }, [activeThreadId]);

  const activeThread = threads.find(t => t.id === activeThreadId);
  const activeMessages = messages.filter(m => m.threadId === activeThreadId);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadId || !user || !replyText.trim()) return;
    
    const text = replyText.trim();
    setReplyText("");
    
    try {
      const newMsg = await api.post<any>(`/chat/threads/${activeThreadId}/messages`, { text });
      setMessages([...messages, newMsg]);
      
      const updatedThreads = threads.map(t => 
        t.id === activeThreadId ? { ...t, updatedAt: new Date().toISOString() } : t
      );
      setThreads(updatedThreads);
    } catch (err) {
      console.error("Failed to send reply", err);
    }
  };

  const filteredThreads = threads.filter(t => t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) || (t.buyer?.email || t.buyerEmail || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-foreground flex items-center gap-2 uppercase tracking-tight">
            <MessageSquare className="w-6 h-6 text-orange-500" />
            <span>Buyer Inquiries & Pre-Purchase Chat</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted mt-1">Answer fitment questions, provide shipping clarifications, and resolve buyer doubts via instant store messaging.</p>
        </div>
        <div className="bg-[#151820] border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs text-foreground font-extrabold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Response time score: <b className="text-emerald-400">Under 15 mins (Excellent)</b></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px] border border-border rounded-2xl bg-surface overflow-hidden shadow-2xl">
        {/* Thread Sidebar */}
        <div className="border-r border-border flex flex-col bg-surface">
          <div className="p-3.5 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
              <input 
                placeholder="Search buyer name or subject..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#151820] border border-border text-xs text-foreground outline-none focus:border-orange-500" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-muted">No buyer chat threads found.</div>
            ) : filteredThreads.map(t => {
              const isSelected = t.id === activeThreadId;
              return (
                <button 
                  key={t.id} 
                  onClick={() => setActiveThreadId(t.id)} 
                  className={`w-full text-left p-4 transition flex flex-col justify-between gap-1.5 ${isSelected ? "bg-[#1f232e] border-l-4 border-orange-500" : "hover:bg-white/[0.02]"}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-extrabold text-foreground text-xs truncate flex items-center gap-1.5">
                      <User className="w-3 h-3 text-orange-400" /> {(t.buyer?.name || t.buyerEmail || "Buyer").split("@")[0]}
                    </span>
                    <span className="text-[10px] text-muted font-bold">{new Date(t.updatedAt || t.createdAt || t.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  <b className="text-foreground text-xs truncate block">{t.subject}</b>
                  <span className="text-[11px] text-emerald-400 font-extrabold flex items-center gap-1">
                    💬 {messages.filter(m => m.threadId === t.id).length} messages
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation View */}
        <div className="lg:col-span-2 flex flex-col bg-surface">
          {activeThread ? (
            <>
              <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-foreground">{activeThread.subject}</h3>
                  <span className="text-[11px] text-muted font-bold block">Inquiry from Buyer: <b className="text-orange-400">{activeThread.buyer?.email || activeThread.buyerEmail}</b></span>
                </div>
                <span className="text-[10px] text-muted font-extrabold px-2.5 py-1 rounded bg-black/5 dark:bg-white/5 border border-border">
                  🔒 Secure Thread
                </span>
              </div>

              <div className="flex-1 p-5 overflow-y-auto space-y-4 flex flex-col">
                {activeMessages.length === 0 ? (
                  <div className="m-auto text-center text-muted text-xs font-bold">No messages exchanged in this inquiry yet.</div>
                ) : activeMessages.map(m => {
                  const isSeller = m.senderEmail === (user?.email || "seller@mototribe.demo");
                  const isAdmin = m.senderEmail?.toLowerCase().includes("admin") || (m.text && m.text.startsWith("🛡️ [ADMIN NOTICE]"));
                  return (
                    <div 
                      key={m.id} 
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs font-medium space-y-1 ${
                        isAdmin ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 self-center w-full max-w-md my-2" :
                        isSeller ? "bg-orange-600/90 text-foreground self-end rounded-br-none shadow-md shadow-orange-600/10" : "bg-[#1f232e] text-foreground border border-border self-start rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-black text-muted uppercase tracking-wide">
                        <span>{isAdmin ? "🛡️ MOTOTRIBE ADMIN" : isSeller ? "You (Seller Store)" : `Buyer (${(m.sender?.name || m.senderEmail || "").split("@")[0]})`}</span>
                        <span className="opacity-50 font-medium lowercase tracking-normal">{new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="leading-relaxed font-semibold">{m.text}</p>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="p-3.5 border-t border-border bg-surface flex items-center gap-3">
                <input 
                  required
                  placeholder={`Reply to ${(activeThread.buyer?.name || activeThread.buyerEmail || "Buyer").split("@")[0]} regarding ${activeThread.subject}...`}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl bg-[#151820] border border-black/15 dark:border-white/15 px-4 py-2.5 text-xs text-foreground outline-none focus:border-orange-500 transition font-semibold"
                />
                <button type="submit" className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-orange-600/20 shrink-0">
                  <Send className="w-3.5 h-3.5" /> Send Reply
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center p-8">
              <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
              <b className="text-foreground text-base block">Select a Buyer Inquiry</b>
              <p className="text-muted text-xs max-w-xs mt-1">Choose a chat thread from the left pane to read pre-purchase questions and send replies.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
