import type {
  CreateRoadmapPayload,
  ItemStatus,
  Roadmap,
  RoadmapItem,
  StorageAdapter,
  StorageMode,
} from '@/types';
import { localStorageAdapter } from '@/features/storage/localStorageAdapter';
import {
  getSupabaseConfig,
  SupabaseStorageAdapter,
} from '@/features/storage/supabaseClient';

function createActiveStorageAdapter(): StorageAdapter {
  const supabaseConfig = getSupabaseConfig();
  if (supabaseConfig) {
    return new SupabaseStorageAdapter(supabaseConfig);
  }
  return localStorageAdapter;
}

const activeAdapter: StorageAdapter = createActiveStorageAdapter();

export const storageAdapter: StorageAdapter = {
  get mode(): StorageMode {
    return activeAdapter.mode;
  },

  async getRoadmaps(): Promise<Roadmap[]> {
    return activeAdapter.getRoadmaps();
  },

  async getRoadmapById(id: string): Promise<Roadmap | null> {
    return activeAdapter.getRoadmapById(id);
  },

  async saveRoadmap(payload: CreateRoadmapPayload | Roadmap): Promise<Roadmap> {
    return activeAdapter.saveRoadmap(payload);
  },

  async updateItemStatus(
    itemId: string,
    status: ItemStatus
  ): Promise<RoadmapItem | null> {
    return activeAdapter.updateItemStatus(itemId, status);
  },

  async saveItemMemo(
    itemId: string,
    memo: string,
    referenceLink?: string
  ): Promise<RoadmapItem | null> {
    return activeAdapter.saveItemMemo(itemId, memo, referenceLink);
  },

  async toggleArchiveRoadmap(
    id: string,
    isArchived: boolean
  ): Promise<Roadmap | null> {
    return activeAdapter.toggleArchiveRoadmap(id, isArchived);
  },

  async deleteRoadmap(id: string): Promise<boolean> {
    return activeAdapter.deleteRoadmap(id);
  },
};
