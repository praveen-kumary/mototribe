import { useState } from "react";
import { Truck, Plus, Check } from "lucide-react";
import { useShipping, useCreateShippingProfile, useUpdateShippingStatus } from "../../../../features/platform/api/shipping";

export function SellerShippingView() {
  const { data: profiles = [], isLoading } = useShipping();
  const createProfile = useCreateShippingProfile();
  const updateStatus = useUpdateShippingStatus();
  
  const [showForm, setShowForm] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: "", baseRate: 0, perKgRate: 0, freeShippingThreshold: 0 });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createProfile.mutate({
      ...newProfile,
      baseRate: newProfile.baseRate * 100,
      perKgRate: newProfile.perKgRate * 100,
      freeShippingThreshold: newProfile.freeShippingThreshold ? newProfile.freeShippingThreshold * 100 : null,
      regions: ["ALL"]
    }, {
      onSuccess: () => {
        setShowForm(false);
        setNewProfile({ name: "", baseRate: 0, perKgRate: 0, freeShippingThreshold: 0 });
      }
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted">Loading shipping settings...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#ff5c1a]" /> Shipping Settings
          </h2>
          <p className="text-muted text-[13px] mt-1">Configure delivery rates and zones for your products.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#ff5c1a] text-foreground rounded-lg text-[13px] font-bold hover:bg-[#e04c0d] transition flex items-center gap-2"
        >
          {showForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add Profile</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#12131a] border border-black/5 dark:border-white/5 p-5 rounded-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Profile Name</label>
            <input required type="text" value={newProfile.name} onChange={e => setNewProfile({...newProfile, name: e.target.value})} placeholder="e.g. Standard Shipping" className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Base Rate (Rs.)</label>
            <input required type="number" min="0" value={newProfile.baseRate} onChange={e => setNewProfile({...newProfile, baseRate: parseInt(e.target.value) || 0})} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Per Kg Rate (Rs.)</label>
            <input required type="number" min="0" value={newProfile.perKgRate} onChange={e => setNewProfile({...newProfile, perKgRate: parseInt(e.target.value) || 0})} className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Free Shipping Above (Rs.)</label>
            <input type="number" min="0" value={newProfile.freeShippingThreshold} onChange={e => setNewProfile({...newProfile, freeShippingThreshold: parseInt(e.target.value) || 0})} placeholder="Optional" className="w-full bg-[#1a1b23] border border-border rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-[#ff5c1a]/50" />
          </div>
          <div className="lg:col-span-4 flex justify-end">
            <button type="submit" className="px-5 py-2 bg-white text-black rounded-lg text-[13px] font-bold hover:bg-zinc-200 transition">Save Profile</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl">
            <p className="text-muted text-[13px]">No shipping profiles configured yet.</p>
          </div>
        ) : (
          profiles.map((item: any) => (
            <div key={item.id} className="bg-[#12131a] border border-black/5 dark:border-white/5 rounded-xl p-5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-[15px] font-bold text-foreground">{item.name}</h3>
                <button 
                  onClick={() => updateStatus.mutate({ id: item.id, active: !item.active })}
                  className={`w-10 h-5 rounded-full relative transition-colors ${item.active ? 'bg-[#ff5c1a]' : 'bg-zinc-700'}`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all ${item.active ? 'left-6' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted">Base Rate:</span>
                  <span className="text-foreground font-bold">Rs. {(item.baseRate / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-muted">Per Kg Rate:</span>
                  <span className="text-foreground font-bold">Rs. {(item.perKgRate / 100).toFixed(2)}</span>
                </div>
                {item.freeShippingThreshold && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted">Free Shipping:</span>
                    <span className="text-emerald-400 font-bold">Above Rs. {(item.freeShippingThreshold / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5">
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-emerald-400" /> Applies to {item.regions.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
