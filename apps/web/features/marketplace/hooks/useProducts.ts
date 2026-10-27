import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productsApi, Product } from "../api/products";

export const PRODUCT_KEYS = {
  all: ["products"] as const,
  seller: ["products", "seller"] as const,
};

export function useAllProducts() {
  return useQuery({
    queryKey: PRODUCT_KEYS.all,
    queryFn: async () => {
      const res = await productsApi.getAllProducts();
      // API returns paginated { items, total, ... } — extract items
      return (res as any).items ?? res;
    },
  });
}

export function useSellerProducts() {
  return useQuery({
    queryKey: PRODUCT_KEYS.seller,
    queryFn: () => productsApi.getSellerProducts(),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => productsApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, status }: { productId: string; status: Product["status"] }) =>
      productsApi.updateProductStatus(productId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => productsApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: any }) =>
      productsApi.updateProduct(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
