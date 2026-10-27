"use client";
import Link from "next/link";
import { useCartStore } from "../lib/cart-store";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  comparePrice?: number;
  image: string;
  sellerEmail?: string;
  bike: string;
  stock: number;
  rating?: number;
  reviews?: number;
  seller?: string;
  category?: string;
}
import { ShoppingCart, Star, Check } from "lucide-react";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const discount = product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : 0;

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, sellerEmail: product.sellerEmail || "seller@mototribe.demo" });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-surface transition hover:-translate-y-1 hover:border-[#ff5c1a]/50 flex flex-col">
      <Link href={`/products/${product.slug}`} className="flex-1">
        <div className="relative h-44 bg-zinc-900 overflow-hidden">
          <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-foreground backdrop-blur-sm">
            Fits {product.bike}
          </span>
          {product.stock === 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-red-600/90 px-2.5 py-1 text-[9px] font-bold uppercase text-foreground">
              Out of Stock
            </span>
          )}
          {discount > 0 && product.stock > 0 && (
            <span className="absolute right-3 top-3 rounded-lg bg-[#ff5c1a] px-2 py-0.5 text-[10px] font-bold text-foreground">
              {discount}% OFF
            </span>
          )}
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-center gap-1 text-[11px]">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[#ff7b42] font-semibold">{product.rating}</span>
            <span className="text-muted">({product.reviews})</span>
          </div>
          <h3 className="mt-1.5 font-bold text-[14px] leading-tight line-clamp-2">{product.name}</h3>
          <p className="mt-1 text-[11px] text-muted">by {product.seller}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[18px] font-black">₹{product.price.toLocaleString("en-IN")}</span>
            {product.comparePrice && (
              <span className="text-[12px] text-muted line-through">₹{product.comparePrice.toLocaleString("en-IN")}</span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4 pt-1">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[12px] font-bold text-foreground transition ${
            added ? "bg-emerald-600" : "bg-white/[0.05] hover:bg-[#ff5c1a]"
          } disabled:opacity-50 disabled:hover:bg-white/[0.05]`}
        >
          {added ? <><Check className="h-4 w-4" /> Added!</> : <><ShoppingCart className="h-4 w-4" /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
