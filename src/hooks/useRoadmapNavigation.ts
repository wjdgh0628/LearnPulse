import { useMemo, useCallback } from 'react';
import { useRoadmapStore } from '@/stores/useRoadmapStore';
import { useRoadmapsQuery, useRoadmapMutations } from '@/hooks/useRoadmap';
import type {
  CreateRoadmapPayload,
  ItemStatus,
  Roadmap,
  RoadmapItem,
} from '@/types';

export interface ActiveStudyGuideNavigationData {
  item: RoadmapItem;
  chapterTitle: string;
  prevItem: { id: string; title: string } | null;
  nextItem: { id: string; title: string } | null;
}

export function useRoadmapNavigation() {
  const {
    activeTab,
    selectedRoadmapId,
    activeMemoItemId,
    activeStudyGuideItemId,
    activeStudyGuideKeyword,
    libraryFilter,
    isManualModalOpen,
    manualModalPrefill,
    pendingQuickTopic,
    setActiveTab,
    selectRoadmap,
    openMemoDrawer,
    closeMemoDrawer,
    openStudyGuide,
    closeStudyGuide,
    setLibraryFilter,
    openManualModal,
    closeManualModal,
    triggerQuickTopicCreator,
    clearPendingQuickTopic,
  } = useRoadmapStore();

  const { data: roadmaps = [] } = useRoadmapsQuery();
  const {
    saveRoadmapMutation,
    toggleArchiveMutation,
    deleteRoadmapMutation,
    updateItemStatusMutation,
    saveItemMemoMutation,
  } = useRoadmapMutations();

  const selectedRoadmap: Roadmap | null = useMemo(
    () => roadmaps.find((r) => r.id === selectedRoadmapId) ?? null,
    [roadmaps, selectedRoadmapId]
  );

  const activeMemoContext = useMemo(() => {
    if (!selectedRoadmap || !activeMemoItemId) {
      return { item: null, chapterTitle: undefined };
    }
    for (const chapter of selectedRoadmap.chapters) {
      const found = chapter.items.find((i) => i.id === activeMemoItemId);
      if (found) {
        return { item: found, chapterTitle: chapter.title };
      }
    }
    return { item: null, chapterTitle: undefined };
  }, [selectedRoadmap, activeMemoItemId]);

  const activeStudyGuideData: ActiveStudyGuideNavigationData | null =
    useMemo(() => {
      if (!selectedRoadmap || !activeStudyGuideItemId) {
        return null;
      }

      const flatItems: Array<{ item: RoadmapItem; chapterTitle: string }> = [];
      for (const chapter of selectedRoadmap.chapters) {
        for (const item of chapter.items) {
          flatItems.push({ item, chapterTitle: chapter.title });
        }
      }

      const currentIdx = flatItems.findIndex(
        (entry) => entry.item.id === activeStudyGuideItemId
      );
      if (currentIdx === -1) {
        return null;
      }

      const currentEntry = flatItems[currentIdx];
      const prevEntry = currentIdx > 0 ? flatItems[currentIdx - 1] : null;
      const nextEntry =
        currentIdx < flatItems.length - 1 ? flatItems[currentIdx + 1] : null;

      return {
        item: currentEntry.item,
        chapterTitle: currentEntry.chapterTitle,
        prevItem: prevEntry
          ? { id: prevEntry.item.id, title: prevEntry.item.title }
          : null,
        nextItem: nextEntry
          ? { id: nextEntry.item.id, title: nextEntry.item.title }
          : null,
      };
    }, [selectedRoadmap, activeStudyGuideItemId]);

  const handleSaveRoadmap = useCallback(
    async (payload: CreateRoadmapPayload) => {
      const created = await saveRoadmapMutation.mutateAsync(payload);
      setActiveTab('LIBRARY');
      selectRoadmap(created.id);
    },
    [saveRoadmapMutation, setActiveTab, selectRoadmap]
  );

  const handleToggleArchive = useCallback(
    (roadmapId: string, nextArchived: boolean) => {
      toggleArchiveMutation.mutate({ id: roadmapId, isArchived: nextArchived });
    },
    [toggleArchiveMutation]
  );

  const handleDeleteRoadmap = useCallback(
    (roadmapId: string) => {
      if (selectedRoadmapId === roadmapId) {
        selectRoadmap(null);
      }
      deleteRoadmapMutation.mutate(roadmapId);
    },
    [selectedRoadmapId, selectRoadmap, deleteRoadmapMutation]
  );

  const handleStatusChange = useCallback(
    (itemId: string, nextStatus: ItemStatus) => {
      updateItemStatusMutation.mutate({ itemId, status: nextStatus });
    },
    [updateItemStatusMutation]
  );

  const handleSaveMemo = useCallback(
    (itemId: string, memo: string, referenceLink?: string) => {
      saveItemMemoMutation.mutate({ itemId, memo, referenceLink });
    },
    [saveItemMemoMutation]
  );

  const handleOpenStudyGuideFromDashboard = useCallback(
    (roadmapId: string, itemId: string) => {
      selectRoadmap(roadmapId);
      openStudyGuide(itemId);
    },
    [selectRoadmap, openStudyGuide]
  );

  return {
    roadmaps,
    activeTab,
    selectedRoadmapId,
    selectedRoadmap,
    activeMemoItemId,
    activeMemoItem: activeMemoContext.item,
    activeMemoChapterTitle: activeMemoContext.chapterTitle,
    activeStudyGuideKeyword,
    activeStudyGuideData,
    libraryFilter,
    isManualModalOpen,
    manualModalPrefill,
    pendingQuickTopic,
    setActiveTab,
    selectRoadmap,
    openMemoDrawer,
    closeMemoDrawer,
    openStudyGuide,
    closeStudyGuide,
    setLibraryFilter,
    openManualModal,
    closeManualModal,
    triggerQuickTopicCreator,
    clearPendingQuickTopic,
    handleSaveRoadmap,
    handleToggleArchive,
    handleDeleteRoadmap,
    handleStatusChange,
    handleSaveMemo,
    handleOpenStudyGuideFromDashboard,
  };
}
