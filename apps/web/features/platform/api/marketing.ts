import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["marketing"] as const };

export function useMarketing() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/marketing"),
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; type: string; budget: number; description?: string; targetUrl?: string; startDate?: string; endDate?: string }) =>
      api.post<any>("/marketing", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateCampaignStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch<any>(`/marketing/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
