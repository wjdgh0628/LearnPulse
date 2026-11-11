import { create } from 'zustand';
import type {
  NavigationTab,
  PendingQuickTopicPrompt,
  UserLevel,
} from '@/types';

export type LibraryFilter = 'ACTIVE' | 'ARCHIVED' | 'ALL';

export interface ManualModalPrefill {
  title?: string;
  topic?: string;
  initialTask?: string;
}

interface RoadmapUIState {
  activeTab: NavigationTab;
  selectedRoadmapId: string | null;
  activeMemoItemId: string | null;
  activeStudyGuideItemId: string | null;
  activeStudyGuideKeyword: string | null;
  libraryFilter: LibraryFilter;
  isManualModalOpen: boolean;
  manualModalPrefill: ManualModalPrefill | null;
  pendingQuickTopic: PendingQuickTopicPrompt | null;
  setActiveTab: (tab: NavigationTab) => void;
  selectRoadmap: (roadmapId: string | null) => void;
  openMemoDrawer: (itemId: string) => void;
  closeMemoDrawer: () => void;
  openStudyGuide: (itemId: string, keyword?: string) => void;
  closeStudyGuide: () => void;
  setLibraryFilter: (filter: LibraryFilter) => void;
  openManualModal: (prefill?: ManualModalPrefill) => void;
  closeManualModal: () => void;
  triggerQuickTopicCreator: (
    topic: string,
    level?: UserLevel,
    targetDuration?: string
  ) => void;
  clearPendingQuickTopic: () => void;
}

export const useRoadmapStore = create<RoadmapUIState>((set) => ({
  activeTab: 'LIBRARY',
  selectedRoadmapId: null,
  activeMemoItemId: null,
  activeStudyGuideItemId: null,
  activeStudyGuideKeyword: null,
  libraryFilter: 'ACTIVE',
  isManualModalOpen: false,
  manualModalPrefill: null,
  pendingQuickTopic: null,
  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      ...(tab === 'CREATOR'
        ? {
            selectedRoadmapId: null,
            activeMemoItemId: null,
            activeStudyGuideItemId: null,
            activeStudyGuideKeyword: null,
          }
        : {}),
    }),
  selectRoadmap: (roadmapId) =>
    set({
      selectedRoadmapId: roadmapId,
      activeMemoItemId: null,
      activeStudyGuideItemId: null,
      activeStudyGuideKeyword: null,
      ...(roadmapId ? { activeTab: 'LIBRARY' } : {}),
    }),
  openMemoDrawer: (itemId) => set({ activeMemoItemId: itemId }),
  closeMemoDrawer: () => set({ activeMemoItemId: null }),
  openStudyGuide: (itemId, keyword) =>
    set({
      activeStudyGuideItemId: itemId,
      activeStudyGuideKeyword: keyword ?? null,
    }),
  closeStudyGuide: () =>
    set({
      activeStudyGuideItemId: null,
      activeStudyGuideKeyword: null,
    }),
  setLibraryFilter: (filter) => set({ libraryFilter: filter }),
  openManualModal: (prefill) =>
    set({
      isManualModalOpen: true,
      manualModalPrefill: prefill ?? null,
    }),
  closeManualModal: () =>
    set({
      isManualModalOpen: false,
      manualModalPrefill: null,
    }),
  triggerQuickTopicCreator: (
    topic,
    level = 'BEGINNER',
    targetDuration = '4주 정규 과정'
  ) =>
    set({
      activeTab: 'CREATOR',
      selectedRoadmapId: null,
      activeMemoItemId: null,
      activeStudyGuideItemId: null,
      activeStudyGuideKeyword: null,
      pendingQuickTopic: {
        topic,
        level,
        targetDuration,
        autoRunKey: Date.now(),
      },
    }),
  clearPendingQuickTopic: () => set({ pendingQuickTopic: null }),
}));
