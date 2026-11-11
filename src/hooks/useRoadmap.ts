import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageAdapter } from '@/features/storage/storageAdapter';
import type { CreateRoadmapPayload, ItemStatus, Roadmap } from '@/types';

export const ROADMAPS_QUERY_KEY = ['roadmaps'] as const;

export function useRoadmapsQuery() {
  return useQuery({
    queryKey: ROADMAPS_QUERY_KEY,
    queryFn: () => storageAdapter.getRoadmaps(),
  });
}

export function useRoadmapMutations() {
  const queryClient = useQueryClient();

  const saveRoadmapMutation = useMutation({
    mutationFn: (payload: CreateRoadmapPayload | Roadmap) =>
      storageAdapter.saveRoadmap(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
    },
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: ({ id, isArchived }: { id: string; isArchived: boolean }) =>
      storageAdapter.toggleArchiveRoadmap(id, isArchived),
    onMutate: async ({ id, isArchived }) => {
      await queryClient.cancelQueries({ queryKey: ROADMAPS_QUERY_KEY });
      const previous = queryClient.getQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<Roadmap[]>(
          ROADMAPS_QUERY_KEY,
          previous.map((r) => (r.id === id ? { ...r, isArchived } : r))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
    },
  });

  const deleteRoadmapMutation = useMutation({
    mutationFn: (id: string) => storageAdapter.deleteRoadmap(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ROADMAPS_QUERY_KEY });
      const previous = queryClient.getQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<Roadmap[]>(
          ROADMAPS_QUERY_KEY,
          previous.filter((r) => r.id !== id)
        );
      }
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
    },
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: ItemStatus }) =>
      storageAdapter.updateItemStatus(itemId, status),
    onMutate: async ({ itemId, status }) => {
      await queryClient.cancelQueries({ queryKey: ROADMAPS_QUERY_KEY });
      const previous = queryClient.getQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY);
      if (previous) {
        const now = new Date().toISOString();
        queryClient.setQueryData<Roadmap[]>(
          ROADMAPS_QUERY_KEY,
          previous.map((roadmap) => ({
            ...roadmap,
            chapters: roadmap.chapters.map((chapter) => ({
              ...chapter,
              items: chapter.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      status,
                      completedAt: status === 'DONE' ? now : null,
                    }
                  : item
              ),
            })),
          }))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
    },
  });

  const saveItemMemoMutation = useMutation({
    mutationFn: ({
      itemId,
      memo,
      referenceLink,
    }: {
      itemId: string;
      memo: string;
      referenceLink?: string;
    }) => storageAdapter.saveItemMemo(itemId, memo, referenceLink),
    onMutate: async ({ itemId, memo, referenceLink }) => {
      await queryClient.cancelQueries({ queryKey: ROADMAPS_QUERY_KEY });
      const previous = queryClient.getQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY);
      if (previous) {
        queryClient.setQueryData<Roadmap[]>(
          ROADMAPS_QUERY_KEY,
          previous.map((roadmap) => ({
            ...roadmap,
            chapters: roadmap.chapters.map((chapter) => ({
              ...chapter,
              items: chapter.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      memo,
                      ...(referenceLink !== undefined ? { referenceLink } : {}),
                    }
                  : item
              ),
            })),
          }))
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
    },
  });

  return {
    saveRoadmapMutation,
    toggleArchiveMutation,
    deleteRoadmapMutation,
    updateItemStatusMutation,
    saveItemMemoMutation,
  };
}
