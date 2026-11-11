import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storageAdapter } from '@/features/storage/storageAdapter';
import type {
  CreateRoadmapPayload,
  ItemStatus,
  Roadmap,
  RoadmapItem,
} from '@/types';

export const ROADMAPS_QUERY_KEY = ['roadmaps'] as const;

/**
 * 대상 itemId가 포함된 로드맵과 챕터만 선택적으로 얕은 복사(Structural Sharing)하여 갱신하고,
 * 변경되지 않은 나머지 로드맵·챕터·아이템의 참조(Reference)는 100% 그대로 유지합니다.
 */
function patchItemInRoadmaps(
  roadmaps: Roadmap[],
  itemId: string,
  updater: (item: RoadmapItem, timestamp: string) => RoadmapItem
): Roadmap[] {
  const now = new Date().toISOString();

  for (let rIdx = 0; rIdx < roadmaps.length; rIdx += 1) {
    const roadmap = roadmaps[rIdx];
    for (let cIdx = 0; cIdx < roadmap.chapters.length; cIdx += 1) {
      const chapter = roadmap.chapters[cIdx];
      const iIdx = chapter.items.findIndex((item) => item.id === itemId);

      if (iIdx !== -1) {
        const nextItems = chapter.items.slice();
        nextItems[iIdx] = updater(chapter.items[iIdx], now);

        const nextChapters = roadmap.chapters.slice();
        nextChapters[cIdx] = {
          ...chapter,
          items: nextItems,
        };

        const nextRoadmaps = roadmaps.slice();
        nextRoadmaps[rIdx] = {
          ...roadmap,
          updatedAt: now,
          chapters: nextChapters,
        };
        return nextRoadmaps;
      }
    }
  }

  return roadmaps;
}

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
    onSuccess: (savedRoadmap) => {
      queryClient.setQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY, (previous) => {
        if (!previous) return [savedRoadmap];
        const existingIdx = previous.findIndex((r) => r.id === savedRoadmap.id);
        if (existingIdx !== -1) {
          const updated = previous.slice();
          updated[existingIdx] = savedRoadmap;
          return updated;
        }
        return [savedRoadmap, ...previous];
      });
    },
    onError: async () => {
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
        const now = new Date().toISOString();
        queryClient.setQueryData<Roadmap[]>(
          ROADMAPS_QUERY_KEY,
          previous.map((r) =>
            r.id === id ? { ...r, isArchived, updatedAt: now } : r
          )
        );
      }
      return { previous };
    },
    onError: async (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
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
    onError: async (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
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
        queryClient.setQueryData<Roadmap[]>(
          ROADMAPS_QUERY_KEY,
          patchItemInRoadmaps(previous, itemId, (item, now) => ({
            ...item,
            status,
            completedAt: status === 'DONE' ? now : null,
          }))
        );
      }
      return { previous };
    },
    onSuccess: (updatedItem) => {
      if (!updatedItem) return;
      queryClient.setQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY, (current) => {
        if (!current) return current;
        return patchItemInRoadmaps(current, updatedItem.id, () => updatedItem);
      });
    },
    onError: async (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
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
          patchItemInRoadmaps(previous, itemId, (item) => ({
            ...item,
            memo,
            ...(referenceLink !== undefined ? { referenceLink } : {}),
          }))
        );
      }
      return { previous };
    },
    onSuccess: (updatedItem) => {
      if (!updatedItem) return;
      queryClient.setQueryData<Roadmap[]>(ROADMAPS_QUERY_KEY, (current) => {
        if (!current) return current;
        return patchItemInRoadmaps(current, updatedItem.id, () => updatedItem);
      });
    },
    onError: async (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ROADMAPS_QUERY_KEY, context.previous);
      }
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
