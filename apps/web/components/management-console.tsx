"use client";

import { useState } from "react";

/**
 * Admin moderation queue — displays items needing review
 * and allows approving/resolving each one.
 */
export function AdminActions() {
  const [queue, setQueue] = useState([
    "MotoMagic seller verification",
    "Flagged: misleading exhaust fitment",
    "New community post report",
  ]);

  const resolve = (item: string) => {
    setQueue((prev) => prev.filter((x) => x !== item));
  };

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-bold">Needs attention</h2>

      {queue.length === 0 ? (
        <p className="mt-5 text-sm text-emerald-400">
          All moderation queues are clear.
        </p>
      ) : (
        <div className="mt-5 divide-y divide-white/8 text-sm">
          {queue.map((item) => (
            <div key={item} className="flex items-center justify-between py-4">
              <span>{item}</span>
              <button
                onClick={() => resolve(item)}
                className="rounded bg-orange-600 px-3 py-1 text-xs font-semibold text-foreground hover:bg-orange-700 transition"
              >
                Approve / resolve
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Seller inventory manager — quick add/archive products.
 * Uses dark theme consistent with the rest of the app.
 */
export function SellerActions() {
  const [items, setItems] = useState([
    "SC Project GP-M2 Exhaust",
    "Axor Apex Helmet",
    "Viaterra Claw Tail Bag",
  ]);
  const [name, setName] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setItems([trimmed, ...items]);
    setName("");
  };

  const archive = (item: string) => {
    setItems((prev) => prev.filter((x) => x !== item));
  };

  return (
    <section className="mt-6 rounded-xl border border-border bg-surface p-5">
      <b className="text-[15px]">Manage inventory</b>

      <div className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="New product name"
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none focus:border-[#ff5c1a]/50 transition"
        />
        <button
          onClick={add}
          className="rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-foreground hover:bg-orange-700 transition"
        >
          Add product
        </button>
      </div>

      <div className="mt-4 divide-y divide-white/8">
        {items.map((item, i) => (
          <div key={item} className="flex items-center justify-between py-3 text-sm">
            <div className="flex items-center gap-3">
              <span>{item}</span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Active
              </span>
            </div>
            <div className="flex items-center gap-6">
              <b className="text-[13px]">₹{(24999 - i * 1500).toLocaleString("en-IN")}</b>
              <button
                onClick={() => archive(item)}
                className="text-xs font-medium text-red-400 hover:text-red-300 transition"
              >
                Archive
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
