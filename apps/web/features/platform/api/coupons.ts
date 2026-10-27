import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["coupons"] as const };

export function useCoupons() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/coupons"),
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { code: string; type: string; value: number; minOrderVal?: number; maxDiscount?: number; usageLimit?: number; validFrom?: string; validUntil?: string }) =>
      api.post<any>("/coupons", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useToggleCouponStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch<any>(`/coupons/${id}/status`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
