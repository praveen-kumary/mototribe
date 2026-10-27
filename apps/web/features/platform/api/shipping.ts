import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["shipping"] as const };

export function useShipping() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/shipping"),
  });
}

export function useCreateShippingProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; baseRate: number; perKgRate: number; freeShippingThreshold?: number; regions: string[] }) =>
      api.post<any>("/shipping", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateShippingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch<any>(`/shipping/${id}/active`, { active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
