import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";

const KEYS = {
  groups: ["community", "groups"] as const,
  posts: (groupId?: string) => ["community", "posts", groupId] as const,
};

export function useCommunityGroups() {
  return useQuery({
    queryKey: KEYS.groups,
    queryFn: () => api.get<any[]>("/community/groups"),
  });
}

export function useCommunityPosts(groupId?: string) {
  return useQuery({
    queryKey: KEYS.posts(groupId),
    queryFn: () =>
      api.get<any[]>("/community/posts", {
        params: groupId ? { communityId: groupId } : undefined,
      }),
  });
}

export function useCreateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { communityId: string; title: string; body: string }) =>
      api.post<any>("/community/posts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}
