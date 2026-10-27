import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["payouts"] as const };

export function usePayouts() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/payouts"),
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) =>
      api.post<any>("/payouts", { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdatePayoutStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reference }: { id: string; status: string; reference?: string }) =>
      api.patch<any>(`/payouts/${id}/status`, { status, reference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
