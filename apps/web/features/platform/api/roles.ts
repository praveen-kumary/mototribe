import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["roles"] as const };

export function useRoles() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/roles"),
  });
}
