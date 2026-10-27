import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["garage", "dashboard"] as const };

export function useGarageDashboard() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/garage/dashboard"),
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bikeModelId: string; year: number; nickname?: string; odometerKm?: number }) =>
      api.post<any>("/garage/bikes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; nickname?: string; odometerKm?: number }) =>
      api.patch<any>(`/garage/bikes/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });
}
