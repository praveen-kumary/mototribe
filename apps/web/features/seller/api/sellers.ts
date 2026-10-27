import { api } from "../../../lib/api/client";


export const sellersApi = {
  getAllSellers: () => api.get<any[]>("/sellers"),
  
  approveSeller: (sellerId: string) => 
    api.patch<{ success: boolean }>(`/sellers/${sellerId}/approve`, {}),
    
  rejectSeller: (sellerId: string) => 
    api.patch<{ success: boolean }>(`/sellers/${sellerId}/reject`, {}),
};
