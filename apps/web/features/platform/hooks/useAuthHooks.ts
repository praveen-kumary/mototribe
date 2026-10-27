import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const AUTH_KEYS = {
  user: ["currentUser"] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_KEYS.user,
    queryFn: () => authApi.getCurrentUser(),
    retry: false, // Don't retry if 401
    refetchOnWindowFocus: true,
  });
}

export function useSignIn() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.signIn(email, password),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_KEYS.user, data.user);
      toast.success("Signed in successfully!");
      
      if (data.user.role === "SELLER") router.push("/seller");
      else if (data.user.role === "ADMIN") router.push("/admin");
      else router.push("/");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to sign in");
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.user, null);
      queryClient.clear();
      router.push("/");
    },
  });
}
