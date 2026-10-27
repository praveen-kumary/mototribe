import { api } from "../../../lib/api/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  weight?: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  category?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  images: { id: string; url: string; alt?: string; sortOrder: number }[];
  seller?: { id: string; name: string; avatar?: string; storeName?: string };
  _count?: { reviews: number };
  createdAt: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const productsApi = {
  getAllProducts: (params?: Record<string, string | number | boolean>) =>
    api.get<PaginatedProducts>("/products", { params }),

  getSellerProducts: () =>
    api.get<Product[]>("/products/my-products"),

  getProductBySlug: (slug: string) =>
    api.get<Product>(`/products/${slug}`),

  deleteProduct: (productId: string) =>
    api.delete<any>(`/products/${productId}`),

  updateProductStatus: (productId: string, status: Product["status"]) =>
    api.patch<any>(`/products/${productId}/status`, { status }),

  createProduct: (data: any) =>
    api.post<Product>("/products", data),

  updateProduct: (productId: string, data: any) =>
    api.patch<Product>(`/products/${productId}`, data),
};
