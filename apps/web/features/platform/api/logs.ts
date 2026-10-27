import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = { all: ["systemLogs"] as const };

export function useSystemLogs() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: () => api.get<any[]>("/logs"),
  });
}
