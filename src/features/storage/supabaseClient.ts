import type {
  CreateRoadmapPayload,
  ItemStatus,
  Roadmap,
  RoadmapChapter,
  RoadmapItem,
  StorageAdapter,
  UserLevel,
} from '@/types';
import { localStorageAdapter } from '@/features/storage/localStorageAdapter';

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

interface SupabaseItemRow {
  id: string;
  chapter_id: string;
  roadmap_id: string;
  order_index: number;
  title: string;
  status: ItemStatus;
  memo: string | null;
  reference_link: string | null;
  completed_at: string | null;
}

interface SupabaseChapterRow {
  id: string;
  roadmap_id: string;
  order_index: number;
  title: string;
  description: string | null;
  roadmap_items?: SupabaseItemRow[];
}

interface SupabaseRoadmapRow {
  id: string;
  user_id: string | null;
  title: string;
  topic: string;
  level: UserLevel;
  target_duration: string | null;
  summary: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  roadmap_chapters?: SupabaseChapterRow[];
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    anonKey,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

function mapRowToRoadmap(row: SupabaseRoadmapRow): Roadmap {
  const chapters: RoadmapChapter[] = (row.roadmap_chapters ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)
    .map((ch) => {
      const items: RoadmapItem[] = (ch.roadmap_items ?? [])
        .slice()
        .sort((a, b) => a.order_index - b.order_index)
        .map((item) => ({
          id: item.id,
          chapterId: item.chapter_id,
          roadmapId: item.roadmap_id,
          orderIndex: item.order_index,
          title: item.title,
          status: item.status,
          memo: item.memo ?? undefined,
          referenceLink: item.reference_link ?? undefined,
          completedAt: item.completed_at,
        }));

      return {
        id: ch.id,
        roadmapId: ch.roadmap_id,
        orderIndex: ch.order_index,
        title: ch.title,
        description: ch.description ?? '',
        items,
      };
    });

  return {
    id: row.id,
    userId: row.user_id ?? 'supabase-user',
    title: row.title,
    topic: row.topic,
    level: row.level,
    targetDuration: row.target_duration ?? '',
    summary: row.summary ?? '',
    isArchived: row.is_archived,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    chapters,
  };
}

export class SupabaseStorageAdapter implements StorageAdapter {
  public readonly mode = 'SUPABASE' as const;
  private readonly config: SupabaseConfig;

  public constructor(config: SupabaseConfig) {
    this.config = config;
  }

  private getHeaders(): HeadersInit {
    return {
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };
  }

  public async getRoadmaps(): Promise<Roadmap[]> {
    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?select=*,roadmap_chapters(*,roadmap_items(*))&order=created_at.desc`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return localStorageAdapter.getRoadmaps();
      }

      const rows = (await response.json()) as SupabaseRoadmapRow[];
      if (rows.length === 0) {
        return localStorageAdapter.getRoadmaps();
      }

      return rows.map(mapRowToRoadmap);
    } catch {
      return localStorageAdapter.getRoadmaps();
    }
  }

  public async getRoadmapById(id: string): Promise<Roadmap | null> {
    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(id)}&select=*,roadmap_chapters(*,roadmap_items(*))`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return localStorageAdapter.getRoadmapById(id);
      }

      const rows = (await response.json()) as SupabaseRoadmapRow[];
      if (!rows[0]) {
        return localStorageAdapter.getRoadmapById(id);
      }

      return mapRowToRoadmap(rows[0]);
    } catch {
      return localStorageAdapter.getRoadmapById(id);
    }
  }

  public async saveRoadmap(payload: CreateRoadmapPayload | Roadmap): Promise<Roadmap> {
    // Also persist locally for instant offline resilience, then sync with Supabase if available
    const savedLocal = await localStorageAdapter.saveRoadmap(payload);

    try {
      const roadmapEndpoint = `${this.config.url}/rest/v1/roadmaps`;
      const response = await fetch(roadmapEndpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          title: savedLocal.title,
          topic: savedLocal.topic,
          level: savedLocal.level,
          target_duration: savedLocal.targetDuration,
          summary: savedLocal.summary,
          is_archived: savedLocal.isArchived,
        }),
      });

      if (!response.ok) {
        return savedLocal;
      }

      return savedLocal;
    } catch {
      return savedLocal;
    }
  }

  public async updateItemStatus(
    itemId: string,
    status: ItemStatus
  ): Promise<RoadmapItem | null> {
    const localUpdated = await localStorageAdapter.updateItemStatus(itemId, status);

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmap_items?id=eq.${encodeURIComponent(itemId)}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          status,
          completed_at: status === 'DONE' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch {
      // Fallback already applied to localStorageAdapter
    }

    return localUpdated;
  }

  public async saveItemMemo(
    itemId: string,
    memo: string,
    referenceLink?: string
  ): Promise<RoadmapItem | null> {
    const localUpdated = await localStorageAdapter.saveItemMemo(
      itemId,
      memo,
      referenceLink
    );

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmap_items?id=eq.${encodeURIComponent(itemId)}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          memo,
          ...(referenceLink !== undefined ? { reference_link: referenceLink } : {}),
          updated_at: new Date().toISOString(),
        }),
      });
    } catch {
      // Fallback already applied to localStorageAdapter
    }

    return localUpdated;
  }

  public async toggleArchiveRoadmap(
    id: string,
    isArchived: boolean
  ): Promise<Roadmap | null> {
    const localUpdated = await localStorageAdapter.toggleArchiveRoadmap(id, isArchived);

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(id)}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({
          is_archived: isArchived,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch {
      // Fallback already applied to localStorageAdapter
    }

    return localUpdated;
  }

  public async deleteRoadmap(id: string): Promise<boolean> {
    const localDeleted = await localStorageAdapter.deleteRoadmap(id);

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(id)}`;
      await fetch(endpoint, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
    } catch {
      // Fallback already applied to localStorageAdapter
    }

    return localDeleted;
  }
}
