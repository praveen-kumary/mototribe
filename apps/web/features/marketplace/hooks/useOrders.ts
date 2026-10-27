import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, Order } from "../api/orders";

export const ORDER_KEYS = {
  all: ["orders"] as const,
  buyer: ["orders", "buyer"] as const,
  seller: ["orders", "seller"] as const,
};

export function useAllOrders() {
  return useQuery({
    queryKey: ORDER_KEYS.all,
    queryFn: () => ordersApi.getAllOrders(),
  });
}

export function useBuyerOrders() {
  return useQuery({
    queryKey: ORDER_KEYS.buyer,
    queryFn: () => ordersApi.getBuyerOrders(),
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: ORDER_KEYS.seller,
    queryFn: () => ordersApi.getSellerOrders(),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ordersApi.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
