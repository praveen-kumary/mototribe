import { api } from "../../../lib/api/client";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SELLER" | "RIDER";
}

export const authApi = {
  getCurrentUser: () => api.get<User>("/auth/me"),
  signIn: (email: string, password: string) =>
    api.post<{ accessToken: string; user: User }>("/auth/login", { email, password }),
  signOut: () => api.post<{ success: boolean }>("/auth/logout", {}),
};
