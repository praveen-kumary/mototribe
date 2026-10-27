import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["inventory"] as const };

export function useInventory() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/inventory"),
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock }: { id: string; stock: number }) =>
      api.patch<any>(`/inventory/${id}/stock`, { stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
