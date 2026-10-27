import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sellersApi } from "../api/sellers";
import { toast } from "sonner";

export const SELLER_KEYS = {
  all: ["sellers"] as const,
};

export function useSellers() {
  return useQuery({
    queryKey: SELLER_KEYS.all,
    queryFn: () => sellersApi.getAllSellers(),
  });
}

export function useApproveSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sellerId: string) => sellersApi.approveSeller(sellerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_KEYS.all });
      toast.success("Seller approved");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to approve seller");
    },
  });
}

export function useRejectSeller() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sellerId: string) => sellersApi.rejectSeller(sellerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SELLER_KEYS.all });
      toast.success("Seller rejected");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to reject seller");
    },
  });
}
