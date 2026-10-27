"use client";

import { useSettings, useUpdateSetting } from "../../../../features/platform/api/settings";
import { Loader2, Settings2, Save } from "lucide-react";
import { useState, useEffect } from "react";

export function SellerSettingsView() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSetting = useUpdateSetting();
  const [localSettings, setLocalSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const init: Record<string, string> = {};
      settings.forEach((s: any) => { init[s.key] = JSON.stringify(s.value); });
      setLocalSettings(init);
    }
  }, [settings]);

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-[#ff5c1a]" /></div>;
  if (error) return <div className="p-12 text-center text-red-500 bg-red-500/10 rounded-xl">Failed to load settings</div>;

  const handleSave = (key: string) => {
    try {
      const parsed = JSON.parse(localSettings[key]);
      updateSetting.mutate({ key, value: parsed });
    } catch(e) {
      alert("Invalid JSON format");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Platform Settings</h2>
      </div>

      <div className="space-y-4">
        {settings?.length === 0 ? (
          <div className="p-12 text-center border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 rounded-2xl">
            <Settings2 className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No settings found. Add defaults in database.</p>
          </div>
        ) : (
          settings?.map((s: any) => (
            <div key={s.id} className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="font-bold text-foreground uppercase text-sm tracking-wide">{s.key}</label>
                <button 
                  onClick={() => handleSave(s.key)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#ff5c1a] hover:bg-[#ff5c1a]/80 text-foreground rounded-lg text-xs font-bold transition"
                >
                  <Save className="w-4 h-4" /> Save
                </button>
              </div>
              <p className="text-xs text-muted">{s.description}</p>
              <textarea 
                value={localSettings[s.key] || ''}
                onChange={(e) => setLocalSettings({...localSettings, [s.key]: e.target.value})}
                className="w-full bg-black/50 border border-border rounded-xl p-3 text-sm text-foreground font-mono focus:border-[#ff5c1a] outline-none min-h-[100px]"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
