"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/auth-provider";
import { Bike, Eye, EyeOff, Lock, Mail, User, Gift } from "lucide-react";

const bikes = [
  "Himalayan 450",
  "Hunter 350",
  "KTM Duke 390",
  "Yamaha R15",
  "Apache RTR 310",
  "Honda CB350",
  "MT-15",
  "Classic 350",
  "Dominar 400",
  "Other",
];

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bike, setBike] = useState("");
  const [role, setRole] = useState<"RIDER" | "SELLER">("RIDER");
  const [referralCode, setReferralCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) setReferralCode(ref.toUpperCase());
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await Promise.resolve(signUp(name, email, role, password));
    if (res?.error) {
      setError(res.error);
      setSubmitting(false);
      return;
    }
    router.push(role === "SELLER" ? "/seller" : "/");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden w-[480px] flex-col justify-between bg-gradient-to-br from-[#1a0e06] via-[#0d0907] to-[#08090b] p-10 lg:flex">
        <div>
          <Link href="/">
            <span className="text-[32px] font-black italic tracking-[-0.08em] text-foreground">
              Moto<span className="text-[#ff5c1a]">Tribe</span>
            </span>
            <small className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.18em] text-muted not-italic">
              Built by Riders, for Riders
            </small>
          </Link>
          <h2 className="mt-16 text-[36px] font-bold leading-[1.1] tracking-tight text-foreground">
            Start your
            <br />
            rider
            <br />
            <span className="text-[#ff5c1a]">journey.</span>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.7] text-muted">
            Create your profile, add your bike to the garage, and unlock
            the full MotoTribe experience — verified parts, community
            discussions, and group rides.
          </p>
        </div>
        <div className="space-y-3 text-[13px] text-muted">
          <p className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff5c1a]/10 text-[#ff5c1a]">✓</span>
            Free forever — no subscription
          </p>
          <p className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff5c1a]/10 text-[#ff5c1a]">✓</span>
            Verified fitment for your exact bike
          </p>
          <p className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ff5c1a]/10 text-[#ff5c1a]">✓</span>
            Join 12,400+ riders across India
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 block lg:hidden">
            <span className="text-[28px] font-black italic tracking-[-0.08em]">
              Moto<span className="text-[#ff5c1a]">Tribe</span>
            </span>
          </Link>

          <h1 className="text-[24px] font-bold text-foreground">Create your account</h1>
          <p className="mt-2 text-[14px] text-muted">
            Join MotoTribe and start your rider profile
          </p>

          {/* Role toggle */}
          <div className="mt-6 flex rounded-xl border border-white/[0.08] bg-surface p-1">
            {(["RIDER", "SELLER"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-lg py-2.5 text-[12px] font-semibold transition-all ${
                  role === r
                    ? "bg-[#ff5c1a] text-foreground shadow"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {r === "RIDER" ? "🏍️ I'm a Rider" : "🏪 I'm a Seller"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/[0.08] bg-surface py-3.5 pl-11 pr-4 text-[13px] text-foreground outline-none transition-colors focus:border-[#ff5c1a]/50"
              />
            </div>

            {/* Email */}
            <div className="relative mt-3">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="Email address"
                className="w-full rounded-xl border border-white/[0.08] bg-surface py-3.5 pl-11 pr-4 text-[13px] text-foreground outline-none transition-colors focus:border-[#ff5c1a]/50"
              />
            </div>

            {/* Password */}
            <div className="relative mt-3">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPass ? "text" : "password"}
                placeholder="Create password (min 8 chars)"
                className="w-full rounded-xl border border-white/[0.08] bg-surface py-3.5 pl-11 pr-12 text-[13px] text-foreground outline-none transition-colors focus:border-[#ff5c1a]/50"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Bike selector (rider only) */}
            {role === "RIDER" && (
              <div className="relative mt-3">
                <Bike className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <select
                  value={bike}
                  onChange={(e) => setBike(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/[0.08] bg-surface py-3.5 pl-11 pr-4 text-[13px] text-muted outline-none transition-colors focus:border-[#ff5c1a]/50"
                >
                  <option value="">Select your primary bike</option>
                  {bikes.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Referral Code */}
            <div className="relative mt-3">
              <Gift className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500" />
              <input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Referral Code / Invite Link (Optional)"
                className="w-full rounded-xl border border-white/[0.08] bg-surface py-3.5 pl-11 pr-4 text-[13px] text-foreground outline-none transition-colors focus:border-[#ff5c1a]/50 placeholder:text-muted"
              />
              {referralCode && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded bg-orange-500/20 px-2 py-0.5 text-[10px] font-bold text-orange-400">
                  +50 Bonus Points!
                </span>
              )}
            </div>
            {referralCode && (
              <p className="mt-1.5 px-1 text-[11px] text-orange-400 font-medium">
                🎉 Friend referral detected! You and your inviter will earn MotoTribe Cash!
              </p>
            )}

            {/* Error */}
            {error && (
              <p className="mt-3 rounded-lg bg-red-900/20 px-4 py-2 text-[12px] text-red-400">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff5c1a] py-3.5 text-[14px] font-bold text-foreground transition-all hover:bg-[#ff7137] hover:shadow-lg hover:shadow-orange-500/20 disabled:opacity-60"
            >
              {submitting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                "Create Account"
              )}
            </button>

            <p className="mt-3 text-center text-[10px] text-zinc-600">
              By creating an account, you agree to MotoTribe&apos;s Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-8 text-center text-[13px] text-muted">
            Already a member?{" "}
            <Link href="/sign-in" className="font-semibold text-[#ff7b42] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
