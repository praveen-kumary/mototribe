import { api } from "../../../lib/api/client";

export interface Order {
  id: string;
  buyerId: string;
  totalAmount: number;
  grandTotal: number;
  shippingTotal: number;
  taxTotal: number;
  status: string;
  createdAt: string;
  sellerOrders: SellerOrder[];
  shippingAddress?: any;
}

export interface SellerOrder {
  id: string;
  parentOrderId: string;
  sellerId: string;
  subtotal: number;
  shippingFee: number;
  taxAmount: number;
  platformFee: number;
  sellerPayout: number;
  status: string;
  trackingNumber?: string;
  courierName?: string;
  items: OrderItem[];
  createdAt: string;
  parentOrder?: {
    buyer: { name: string; email: string };
    shippingAddress: any;
  };
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const ordersApi = {
  getAllOrders: () => api.get<Order[]>("/orders"),

  getBuyerOrders: () => api.get<Order[]>("/orders/my-orders"),

  getSellerOrders: () => api.get<SellerOrder[]>("/orders/seller-orders"),

  updateOrderStatus: (orderId: string, status: string) =>
    api.patch<any>(`/orders/${orderId}/status`, { status }),
};
