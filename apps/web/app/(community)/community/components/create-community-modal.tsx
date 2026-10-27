"use client";

import { useState } from "react";
import { Plus, X, Shield, Info, Users } from "lucide-react";
import { api } from "../../../../lib/api/client";

export function CreateCommunityModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: (community: any) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rules, setRules] = useState<{ title: string, description: string }[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules([...rules, { title: "", description: "" }]);
  };

  const handleRuleChange = (index: number, field: "title" | "description", value: string) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Validate rules (don't send empty ones)
      const validRules = rules.filter(r => r.title.trim() !== "" && r.description.trim() !== "");
      
      const data = await api.post<any>("/community/groups", {
        name,
        description,
        rules: validRules,
      });
      
      onSuccess(data);
      onClose();
      // Reset form
      setName("");
      setDescription("");
      setRules([]);
    } catch (err: any) {
      alert("Failed to create community: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-[16px] font-bold">Create a Community</h2>
          <button onClick={onClose} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition">
            <X className="w-5 h-5 text-muted hover:text-foreground" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto hide-scrollbar flex-1">
          <form id="create-community-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[12px] font-semibold mb-1">Name <span className="text-red-500">*</span></label>
              <p className="text-[10px] text-muted mb-2">Community names including capitalization cannot be changed.</p>
              <input 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Royal Enfield Enthusiasts"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]"
              />
            </div>
            
            <div>
              <label className="block text-[12px] font-semibold mb-1">Description <span className="text-red-500">*</span></label>
              <p className="text-[10px] text-muted mb-2">This is how new members come to understand your community.</p>
              <textarea 
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="A community for..."
                rows={3}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a] resize-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[12px] font-semibold">Rules</label>
                <button type="button" onClick={handleAddRule} className="text-[11px] text-[#ff5c1a] font-semibold hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Rule
                </button>
              </div>
              <p className="text-[10px] text-muted mb-3">Set expectations for how members should behave in your community.</p>
              
              <div className="space-y-3">
                {rules.map((rule, i) => (
                  <div key={i} className="p-3 bg-black/5 dark:bg-white/5 border border-border rounded-lg space-y-2 relative group">
                    <button type="button" onClick={() => handleRemoveRule(i)} className="absolute top-2 right-2 p-1 text-muted hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                    <input 
                      required
                      value={rule.title}
                      onChange={e => handleRuleChange(i, "title", e.target.value)}
                      placeholder="Rule Title"
                      className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-[12px] focus:outline-none focus:border-[#ff5c1a]"
                    />
                    <textarea 
                      required
                      value={rule.description}
                      onChange={e => handleRuleChange(i, "description", e.target.value)}
                      placeholder="Full description"
                      rows={2}
                      className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#ff5c1a] resize-none"
                    />
                  </div>
                ))}
                {rules.length === 0 && (
                  <div className="text-center py-4 border border-dashed border-border rounded-lg text-muted text-[11px]">
                    No rules yet. <button type="button" onClick={handleAddRule} className="text-[#ff5c1a] hover:underline">Add one</button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 bg-black/20 dark:bg-black/40">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-md text-[13px] font-medium text-muted hover:text-foreground transition"
          >
            Cancel
          </button>
          <button 
            form="create-community-form"
            type="submit" 
            disabled={loading}
            className="px-4 py-2 rounded-md text-[13px] font-medium bg-[#ff5c1a] text-white hover:bg-[#e04c0d] transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Community"}
          </button>
        </div>
      </div>
    </div>
  );
}
