import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["creators", "dashboard"] as const };

export function useCreatorsDashboard() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/creators/dashboard"),
  });
}

export function useUpdateCreatorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/creators/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
