import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["analytics", "dashboard"] as const };

export function useAnalytics() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any>("/analytics/dashboard"),
  });
}
