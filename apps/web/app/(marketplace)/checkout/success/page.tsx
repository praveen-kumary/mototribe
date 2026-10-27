"use client";
import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { AppShell } from "../../../../components/app-shell";

export default function CheckoutSuccess() {
  return (
    <AppShell>
      <main className="flex-1 flex flex-col items-center justify-center min-h-[70vh] p-5 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h1 className="text-[32px] font-black tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-[15px] text-muted max-w-[400px] mb-10">
          Your gear is locked in. We've sent a confirmation email with your order details and tracking link.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[400px]">
          <Link href="/profile" className="flex-1 py-3.5 bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition">
            <Package className="w-4 h-4" /> View Orders
          </Link>
          <Link href="/marketplace" className="flex-1 py-3.5 bg-[#ff5c1a] hover:bg-[#e04c0d] text-foreground rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
