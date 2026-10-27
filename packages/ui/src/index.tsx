import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
export function cn(...inputs: Array<string | undefined | false | null>) { return inputs.filter(Boolean).join(" "); }
export function Button({ className, variant = "primary", size = "md", children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline"; size?: "sm" | "md" | "lg" }) {
  const styles = { primary: "bg-[#ff5c1a] text-white hover:bg-[#ff7137]", ghost: "bg-transparent text-zinc-200 hover:bg-white/8", outline: "border border-white/15 bg-transparent text-white hover:border-white/35" };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-5 text-sm" };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors", styles[variant], sizes[size], className)} {...props}>{children}</button>;
}
export function Badge({ children, className }: { children: ReactNode; className?: string }) { return <span className={cn("inline-flex rounded-full bg-white/8 px-3 py-1 text-[10px] font-bold uppercase tracking-[.15em] text-zinc-300", className)}>{children}</span>; }
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border border-white/8 bg-[#12161b]", className)} {...props} />; }
export function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: string }) { return <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#ff6d32]">{eyebrow}</p><h2 className="mt-3 text-3xl font-bold tracking-[-.05em] sm:text-4xl">{title}</h2></div>{action && <button className="hidden text-sm font-semibold text-zinc-300 sm:block">{action} →</button>}</div>; }
