"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "../../../components/app-shell";
import { useCartStore } from "../../../lib/cart-store";
import { useAuth } from "../../../components/auth-provider";
import { api } from "../../../lib/api/client";
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, Truck } from "lucide-react";

export default function Cart() {
  const cart = useCartStore((state) => state.cart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      router.push("/sign-in?redirect=/cart");
      return;
    }

    if (cart.length === 0) return;
    
    setIsCheckingOut(true);
    setError(null);

    try {
      const result = await api.post<{ sessionId: string; paymentIntentId: string; amount: number; expiresAt: string }>("/checkout", {
        idempotencyKey: crypto.randomUUID(),
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity || 1 })),
      });

      clearCart();
      router.push(`/checkout/success?session=${result.sessionId}`);
    } catch (e: any) {
      setError(e.message || "Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal > 0 ? (subtotal > 200000 ? 0 : 15000) : 0; // in paise: free over ₹2000, else ₹150
  const total = subtotal + shipping;

  return (
    <AppShell>
      <main className="mx-auto max-w-[1200px] px-5 py-10">
        <h1 className="text-[28px] font-black tracking-tight mb-8">Your Garage Cart</h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-20 border border-white/[0.08] rounded-2xl bg-surface">
            <h2 className="text-[20px] font-bold">Your cart is empty</h2>
            <p className="mt-2 text-muted text-[13px]">Looks like you haven&apos;t added any gear yet.</p>
            <Link href="/marketplace" className="mt-6 inline-block rounded-xl bg-[#ff5c1a] px-6 py-3 text-[14px] font-bold text-foreground transition hover:bg-[#ff7137]">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-5 rounded-2xl border border-white/[0.08] bg-surface p-4">
                  {item.image && <img src={item.image} alt={item.name} className="h-24 w-24 rounded-xl object-cover" />}
                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <b className="text-[15px]">{item.name}</b>
                        <p className="text-[12px] text-muted mt-1">₹{(item.price / 100).toLocaleString("en-IN")}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-400 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-surface px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-muted hover:text-foreground p-1">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-muted hover:text-foreground p-1">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <b className="text-[16px]">₹{((item.price * (item.quantity || 1)) / 100).toLocaleString("en-IN")}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="h-fit rounded-2xl border border-white/[0.08] bg-surface p-6 sticky top-[100px]">
              <b className="text-[16px]">Order Summary</b>
              
              <div className="mt-6 space-y-3 text-[13px]">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>₹{(subtotal / 100).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${(shipping / 100).toLocaleString("en-IN")}`}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-[10px] text-muted">Add ₹{((200000 - subtotal) / 100).toLocaleString("en-IN")} more for free shipping.</p>
                )}
                <div className="my-4 border-t border-white/[0.08]" />
                <div className="flex justify-between text-[16px] font-bold">
                  <span>Total</span>
                  <span className="text-[#ff5c1a]">₹{(total / 100).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[12px]">
                  {error}
                </div>
              )}

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut || cart.length === 0}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5c1a] py-3.5 text-[14px] font-bold text-foreground transition hover:bg-[#ff7137] disabled:opacity-50"
              >
                {isCheckingOut ? "Processing..." : (
                  <>Checkout <ArrowRight className="h-4 w-4" /></>
                )}
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Secure Checkout
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted">
                  <Truck className="h-4 w-4 text-emerald-400" /> Ships within 24 hours
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
