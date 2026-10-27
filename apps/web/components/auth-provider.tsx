"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "../lib/api/client";

export type UserRole = "RIDER" | "SELLER" | "ADMIN";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  xp?: number;
  level?: number;
  sellerStatus?: string;
  storeName?: string;
  storeSlug?: string;
  createdAt?: string;
  referralCode?: string;
  motoTribeCash?: number;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string; role?: UserRole }>;
  signUp: (
    name: string,
    email: string,
    role: UserRole | undefined,
    password: string,
  ) => Promise<{ error?: string; role?: UserRole }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => ({ error: "Not implemented" }),
  signUp: async () => ({ error: "Not implemented" }),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const protectedRoutes: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/seller": ["SELLER", "ADMIN"],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.get<AuthUser>("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await fetchProfile();
      setLoading(false);
    };
    initAuth();
  }, [fetchProfile]);

  useEffect(() => {
    if (loading) return;
    const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
      pathname.startsWith(route),
    );
    if (requiredRoles) {
      const [, roles] = requiredRoles;
      if (!user) {
        router.replace("/sign-in?redirect=" + encodeURIComponent(pathname));
      } else if (!roles.includes(user.role)) {
        router.replace("/");
      }
    }
  }, [user, loading, pathname, router]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error?: string; role?: UserRole }> => {
      try {
        const data = await api.post<{ user: AuthUser }>("/auth/login", { email, password });
        await fetchProfile();
        return { role: data.user.role };
      } catch (e: any) {
        return { error: e.message || "Invalid credentials." };
      }
    },
    [fetchProfile],
  );

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      role: UserRole = "RIDER",
      password: string,
    ): Promise<{ error?: string; role?: UserRole }> => {
      if (!name.trim()) return { error: "Name is required." };
      if (!email.includes("@")) return { error: "Enter a valid email." };
      if (password.length < 8) return { error: "Password must be at least 8 characters." };

      try {
        const data = await api.post<{ user: AuthUser }>("/auth/register", {
          name,
          email,
          role,
          password,
        });
        await fetchProfile();
        return { role: data.user.role };
      } catch (e: any) {
        return { error: e.message || "Registration failed." };
      }
    },
    [fetchProfile],
  );

  const signOut = useCallback(async () => {
    try {
      await api.post("/auth/logout", {});
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
