import { useState, useEffect } from "react";
import { Settings, Save, Server, Globe } from "lucide-react";
import { useSettings, useUpdateSetting } from "../../../../features/platform/api/settings";
import { motion } from "framer-motion";

export function AdminSettingsView() {
  const { data: settingsList = [], isLoading, error } = useSettings();
  const updateSetting = useUpdateSetting();
  const [localSettings, setLocalSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    if (settingsList.length > 0) {
      const init: Record<string, any> = {};
      settingsList.forEach((s: any) => { init[s.key] = s.value; });
      setLocalSettings(init);
    }
  }, [settingsList]);

  const handleSave = (key: string) => {
    updateSetting.mutate({ key, value: localSettings[key] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-lg" />
        <div className="h-64 bg-black/5 dark:bg-white/5 animate-pulse rounded-2xl border border-black/5 dark:border-white/5" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
        <p className="text-red-400 font-bold">Failed to load platform settings.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-orange-500" />
          <span>Global Platform Configuration</span>
        </h2>
        <p className="text-xs sm:text-sm text-muted mt-1">Configure system-wide parameters, fees, and operational states.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {settingsList.map((setting: any, idx: number) => (
          <motion.div 
            key={setting.id}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-border bg-surface/80 backdrop-blur-md p-5 sm:p-6 shadow-xl space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-border pb-3">
              {setting.key.includes("FEE") || setting.key.includes("COMMISSION") ? <Server className="w-4 h-4 text-emerald-400" /> : <Globe className="w-4 h-4 text-blue-400" />}
              <h3 className="text-sm font-black text-foreground">{setting.key.replace(/_/g, ' ')}</h3>
            </div>
            <div>
              <p className="text-xs text-muted mb-3">{setting.description || "System parameter configuration"}</p>
              <div className="flex items-center gap-3">
                {typeof setting.value === "boolean" ? (
                  <select 
                    value={localSettings[setting.key] ? "true" : "false"}
                    onChange={(e) => setLocalSettings({ ...localSettings, [setting.key]: e.target.value === "true" })}
                    className="flex-1 bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-orange-500 transition-colors"
                  >
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                ) : (
                  <input 
                    type={typeof setting.value === "number" ? "number" : "text"}
                    value={localSettings[setting.key] ?? setting.value}
                    onChange={(e) => setLocalSettings({ ...localSettings, [setting.key]: typeof setting.value === "number" ? Number(e.target.value) : e.target.value })}
                    className="flex-1 bg-surface border border-black/15 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-orange-500 transition-colors"
                  />
                )}
                <button 
                  onClick={() => handleSave(setting.key)}
                  disabled={updateSetting.isPending}
                  className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-foreground font-extrabold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
