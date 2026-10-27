import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  sellerEmail: string;
  quantity?: number;
}

interface CartStore {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map(item => 
              item.id === product.id 
                ? { ...item, quantity: (item.quantity || 1) + 1 } 
                : item
            )
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(item => item.id !== id)
      })),
      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart.map(item => {
          if (item.id === id) {
            const newQuantity = Math.max(1, (item.quantity || 1) + delta);
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
      })),
      clearCart: () => set({ cart: [] })
    }),
    {
      name: 'mototribe-cart',
    }
  )
);
