"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../components/auth-provider";
import { Eye, EyeOff, Lock, Mail, Bike, Store, ShieldCheck, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

function SignInForm() {
  const [email, setEmail] = useState("rider@mototribe.demo");
  const [password, setPassword] = useState("Rider@123");
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeAccount, setActiveAccount] = useState<string | null>("rider");
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await Promise.resolve(signIn(email, password));
    if (res?.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    /* Route based on role */
    const role = res?.role;

    if (redirect) {
      router.push(redirect);
    } else if (role === "ADMIN") {
      router.push("/admin");
    } else if (role === "SELLER") {
      router.push("/seller");
    } else {
      router.push("/");
    }
  };

  const quickLogin = (id: string, em: string, pw: string) => {
    setActiveAccount(id);
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-[#ff5c1a]/30">
      {/* Left branding panel - Hidden on Mobile */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden p-12 lg:flex">
        {/* Abstract Background Elements */}
        <div className="absolute inset-0 bg-[#120a06]" />
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-[#ff5c1a]/10 blur-[100px]" />
        <div className="absolute -bottom-40 right-0 h-[600px] w-[600px] rounded-full bg-[#ff5c1a]/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2000')] bg-cover bg-center opacity-[0.15] mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090b] via-[#08090b]/40 to-transparent" />

        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <span className="text-[36px] font-black italic tracking-[-0.08em] text-foreground">
              Moto<span className="text-[#ff5c1a]">Tribe</span>
            </span>
            <small className="mt-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff7b42]">
              <Zap className="h-3 w-3" /> Built by Riders, for Riders
            </small>
          </Link>
          <h2 className="mt-20 text-[48px] font-black leading-[1.05] tracking-tight text-foreground drop-shadow-2xl">
            Gear up.<br />
            Ride out.<br />
            <span className="bg-gradient-to-r from-[#ff5c1a] to-[#ff8c42] bg-clip-text text-transparent">Belong.</span>
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-[1.6] text-foreground">
            Join India&apos;s largest motorcycle ecosystem. Shop verified parts, connect with fellow riders, and build your dream garage.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { stat: "12,400+", label: "Active Riders" },
            { stat: "8,400+", label: "Products Listed" },
            { stat: "340+", label: "Verified Sellers" },
            { stat: "100%", label: "Genuine Parts" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col rounded-2xl border border-border bg-black/5 dark:bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:border-[#ff5c1a]/30">
              <b className="text-[24px] font-black text-foreground">{s.stat}</b>
              <span className="text-[12px] font-medium text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-[#08090b] via-[#0a0a0c] to-[#0f0b09] lg:hidden" />
        
        <div className="relative z-10 w-full max-w-[440px]">
          {/* Mobile logo */}
          <Link href="/" className="mb-10 block text-center lg:hidden">
            <span className="text-[32px] font-black italic tracking-[-0.08em] text-foreground">
              Moto<span className="text-[#ff5c1a]">Tribe</span>
            </span>
          </Link>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-[28px] font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="mt-2 text-[14px] text-muted">
              Enter your details to access your account
            </p>
          </div>

          {/* Quick login buttons (Moved above form for easier testing) */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Fast Sign In</span>
              <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "rider", icon: Bike, label: "Rider", email: "rider@mototribe.demo", password: "Rider@123", color: "hover:border-blue-500/50 hover:bg-blue-500/10", activeBg: "bg-blue-500/10 border-blue-500/50 text-blue-400" },
                { id: "seller", icon: Store, label: "Seller", email: "seller@mototribe.demo", password: "Seller@123", color: "hover:border-orange-500/50 hover:bg-orange-500/10", activeBg: "bg-orange-500/10 border-orange-500/50 text-orange-400" },
                { id: "admin", icon: ShieldCheck, label: "Admin", email: "admin@mototribe.demo", password: "Admin@123", color: "hover:border-red-500/50 hover:bg-red-500/10", activeBg: "bg-red-500/10 border-red-500/50 text-red-400" },
              ].map((acc) => {
                const isActive = activeAccount === acc.id;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      quickLogin(acc.id, acc.email, acc.password);
                    }}
                    className={`group relative flex flex-col items-center justify-center gap-2 rounded-2xl border px-2 py-4 transition-all duration-300 ${isActive ? acc.activeBg : `border-border bg-surface text-muted ${acc.color}`}`}
                  >
                    {isActive && <CheckCircle2 className="absolute top-2 right-2 h-3 w-3" />}
                    <acc.icon className={`h-6 w-6 transition-transform group-hover:scale-110 ${isActive ? "" : "opacity-70"}`} />
                    <span className="text-[11px] font-bold tracking-wide">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={submit} className="rounded-3xl border border-black/5 dark:border-white/5 bg-surface/50 p-6 shadow-2xl backdrop-blur-xl">
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="mb-1.5 block text-[12px] font-semibold text-muted">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted transition-colors peer-focus:text-[#ff5c1a]" />
                  <input
                    key={`email-${activeAccount || 'custom'}`}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setActiveAccount(null); }}
                    type="email"
                    required
                    className="peer w-full rounded-xl border border-border bg-black/40 py-3.5 pl-12 pr-4 text-[14px] text-foreground outline-none transition-all focus:border-[#ff5c1a] focus:bg-black/60 focus:ring-1 focus:ring-[#ff5c1a]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[12px] font-semibold text-muted">Password</label>
                  <Link href="#" className="text-[11px] font-medium text-[#ff5c1a] hover:underline">Forgot?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted transition-colors peer-focus:text-[#ff5c1a]" />
                  <input
                    key={`pass-${activeAccount || 'custom'}`}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setActiveAccount(null); }}
                    type={showPass ? "text" : "password"}
                    required
                    className="peer w-full rounded-xl border border-border bg-black/40 py-3.5 pl-12 pr-12 text-[14px] text-foreground outline-none transition-all focus:border-[#ff5c1a] focus:bg-black/60 focus:ring-1 focus:ring-[#ff5c1a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-[13px] text-red-400">
                <span className="font-bold">Error:</span> {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-[15px] font-black text-black transition-all hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:hover:shadow-none"
            >
              {submitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/30 border-t-black" />
              ) : (
                <>Sign In Securely <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-bold text-foreground hover:text-[#ff5c1a] transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignIn() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background"><span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-[#ff5c1a]" /></div>}>
      <SignInForm />
    </Suspense>
  );
}
