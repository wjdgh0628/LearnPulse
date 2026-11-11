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
import { getActiveUserId } from '@/stores/useAuthStore';

const PENDING_SYNC_KEY = 'learnpulse_pending_sync_v1';

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
  description?: string | null;
  sub_tasks?: string[] | null;
  keywords?: string[] | null;
  estimated_time?: string | null;
  status: ItemStatus;
  memo: string | null;
  reference_link: string | null;
  completed_at: string | null;
  updated_at?: string | null;
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

interface PendingSyncOperation {
  type: 'UPSERT_ROADMAP' | 'DELETE_ROADMAP';
  roadmapId: string;
  userId: string;
  timestamp: string;
}

function readPendingSyncQueue(): PendingSyncOperation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PENDING_SYNC_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingSyncOperation[]) : [];
  } catch {
    return [];
  }
}

function writePendingSyncQueue(queue: PendingSyncOperation[]): void {
  if (typeof window === 'undefined') return;
  try {
    if (queue.length === 0) {
      window.localStorage.removeItem(PENDING_SYNC_KEY);
    } else {
      window.localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    }
  } catch {
    // Ignore storage errors
  }
}

function enqueueSyncOperation(op: PendingSyncOperation): void {
  const queue = readPendingSyncQueue().filter(
    (existing) => existing.roadmapId !== op.roadmapId
  );
  queue.push(op);
  writePendingSyncQueue(queue);
}

function dequeueSyncOperation(roadmapId: string): void {
  const queue = readPendingSyncQueue().filter(
    (existing) => existing.roadmapId !== roadmapId
  );
  writePendingSyncQueue(queue);
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const anonKey = (
    import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  )?.trim();

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
          description: item.description ?? undefined,
          subTasks: Array.isArray(item.sub_tasks) ? item.sub_tasks : undefined,
          keywords: Array.isArray(item.keywords) ? item.keywords : undefined,
          estimatedTime: item.estimated_time ?? undefined,
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
    userId: row.user_id ?? getActiveUserId(),
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
  private isFlushingQueue = false;

  public constructor(config: SupabaseConfig) {
    this.config = config;

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        void this.flushPendingSyncQueue();
      });
    }
  }

  private getHeaders(prefer = 'return=representation'): HeadersInit {
    const activeUserId = getActiveUserId();
    return {
      apikey: this.config.anonKey,
      Authorization: `Bearer ${this.config.anonKey}`,
      'Content-Type': 'application/json',
      Prefer: prefer,
      'x-learnpulse-user-id': activeUserId,
    };
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine !== false;
  }

  /**
   * 로드맵 기본 정보 + 챕터 배열 + 세부 학습 항목 배열을 동일한 ID로
   * Supabase에 원자적(Upsert)으로 동기화합니다.
   */
  private async pushFullRoadmapToRemote(roadmap: Roadmap): Promise<boolean> {
    if (!this.isOnline()) {
      return false;
    }

    const activeUserId = roadmap.userId || getActiveUserId();
    const now = roadmap.updatedAt ?? new Date().toISOString();
    const upsertPrefer = 'resolution=merge-duplicates,return=minimal';

    try {
      // 1. roadmaps 기본 정보 Upsert (로컬 ID와 동일한 ID 유지)
      const roadmapRes = await fetch(
        `${this.config.url}/rest/v1/roadmaps?on_conflict=id`,
        {
          method: 'POST',
          headers: this.getHeaders(upsertPrefer),
          body: JSON.stringify({
            id: roadmap.id,
            user_id: activeUserId,
            title: roadmap.title,
            topic: roadmap.topic,
            level: roadmap.level,
            target_duration: roadmap.targetDuration,
            summary: roadmap.summary,
            is_archived: roadmap.isArchived,
            created_at: roadmap.createdAt,
            updated_at: now,
          }),
        }
      );

      if (!roadmapRes.ok) {
        return false;
      }

      // 2. roadmap_chapters 일괄 Upsert
      if (roadmap.chapters.length > 0) {
        const chapterPayload = roadmap.chapters.map((ch, cIdx) => ({
          id: ch.id,
          roadmap_id: roadmap.id,
          order_index: ch.orderIndex ?? cIdx + 1,
          title: ch.title,
          description: ch.description ?? '',
        }));

        const chapterRes = await fetch(
          `${this.config.url}/rest/v1/roadmap_chapters?on_conflict=id`,
          {
            method: 'POST',
            headers: this.getHeaders(upsertPrefer),
            body: JSON.stringify(chapterPayload),
          }
        );

        if (!chapterRes.ok) {
          return false;
        }

        // 3. roadmap_items 일괄 Upsert (하위 스키마가 구버전일 경우 호환 폴백 지원)
        const allItems = roadmap.chapters.flatMap((ch) =>
          ch.items.map((item, iIdx) => ({
            id: item.id,
            chapter_id: ch.id,
            roadmap_id: roadmap.id,
            order_index: item.orderIndex ?? iIdx + 1,
            title: item.title,
            description: item.description ?? '',
            sub_tasks: item.subTasks ?? [],
            keywords: item.keywords ?? [],
            estimated_time: item.estimatedTime ?? '',
            status: item.status,
            memo: item.memo ?? null,
            reference_link: item.referenceLink ?? null,
            completed_at: item.completedAt ?? null,
            updated_at: now,
          }))
        );

        if (allItems.length > 0) {
          const itemRes = await fetch(
            `${this.config.url}/rest/v1/roadmap_items?on_conflict=id`,
            {
              method: 'POST',
              headers: this.getHeaders(upsertPrefer),
              body: JSON.stringify(allItems),
            }
          );

          // 만약 DB 테이블에 아직 확장 컬럼(sub_tasks 등)이 적용되지 않은 경우 기본 컬럼으로 재시도
          if (!itemRes.ok) {
            const minimalItems = allItems.map((it) => ({
              id: it.id,
              chapter_id: it.chapter_id,
              roadmap_id: it.roadmap_id,
              order_index: it.order_index,
              title: it.title,
              status: it.status,
              memo: it.memo,
              reference_link: it.reference_link,
              completed_at: it.completed_at,
            }));

            const fallbackRes = await fetch(
              `${this.config.url}/rest/v1/roadmap_items?on_conflict=id`,
              {
                method: 'POST',
                headers: this.getHeaders(upsertPrefer),
                body: JSON.stringify(minimalItems),
              }
            );
            if (!fallbackRes.ok) {
              return false;
            }
          }
        }
      }

      dequeueSyncOperation(roadmap.id);
      return true;
    } catch (err) {
      console.warn('[LearnPulse Supabase] Failed to push full roadmap:', err);
      return false;
    }
  }

  /**
   * 오프라인 상태에서 쌓인 동기화 대기 큐를 온라인 복구 시 순차 처리합니다.
   */
  public async flushPendingSyncQueue(): Promise<void> {
    if (this.isFlushingQueue || !this.isOnline()) return;
    const queue = readPendingSyncQueue();
    if (queue.length === 0) return;

    this.isFlushingQueue = true;
    try {
      for (const op of queue) {
        if (op.type === 'DELETE_ROADMAP') {
          const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(op.roadmapId)}&user_id=eq.${encodeURIComponent(op.userId)}`;
          const res = await fetch(endpoint, {
            method: 'DELETE',
            headers: this.getHeaders('return=minimal'),
          });
          if (res.ok) {
            dequeueSyncOperation(op.roadmapId);
          }
        } else if (op.type === 'UPSERT_ROADMAP') {
          const localRoadmap = await localStorageAdapter.getRoadmapById(
            op.roadmapId
          );
          if (localRoadmap) {
            await this.pushFullRoadmapToRemote(localRoadmap);
          } else {
            dequeueSyncOperation(op.roadmapId);
          }
        }
      }
    } catch (err) {
      console.warn('[LearnPulse Supabase] Queue flush interrupted:', err);
    } finally {
      this.isFlushingQueue = false;
    }
  }

  public async getRoadmaps(): Promise<Roadmap[]> {
    const activeUserId = getActiveUserId();
    localStorageAdapter.claimGuestRoadmaps(activeUserId);

    if (!this.isOnline()) {
      return localStorageAdapter.getRoadmaps();
    }

    await this.flushPendingSyncQueue();

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?user_id=eq.${encodeURIComponent(activeUserId)}&select=*,roadmap_chapters(*,roadmap_items(*))&order=created_at.desc`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        return localStorageAdapter.getRoadmaps();
      }

      const rows = (await response.json()) as SupabaseRoadmapRow[];
      const remoteRoadmaps = rows.map(mapRowToRoadmap);

      // Last-Write-Wins 정책으로 로컬 데이터와 클라우드 데이터 양방향 병합
      const { merged, localOnlyOrNewer } =
        localStorageAdapter.mergeWithRemoteRoadmaps(remoteRoadmaps);

      // 로컬에만 있거나 오프라인에서 더 최근에 수정된 로드맵은 백그라운드로 클라우드에 업로드
      if (localOnlyOrNewer.length > 0) {
        void Promise.all(
          localOnlyOrNewer.map((roadmap) =>
            this.pushFullRoadmapToRemote(roadmap)
          )
        );
      }

      return merged.filter(
        (r) => !r.userId || r.userId === activeUserId
      );
    } catch (err) {
      console.warn(
        '[LearnPulse Supabase] Falling back to LocalStorage on getRoadmaps:',
        err
      );
      return localStorageAdapter.getRoadmaps();
    }
  }

  public async getRoadmapById(id: string): Promise<Roadmap | null> {
    const activeUserId = getActiveUserId();
    if (!this.isOnline()) {
      return localStorageAdapter.getRoadmapById(id);
    }

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(activeUserId)}&select=*,roadmap_chapters(*,roadmap_items(*))`;
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

  public async saveRoadmap(
    payload: CreateRoadmapPayload | Roadmap
  ): Promise<Roadmap> {
    // 1. 로컬에 먼저 저장하여 확정된 ID(roadmap/chapter/item)를 생성 및 확보
    const savedLocal = await localStorageAdapter.saveRoadmap(payload);

    // 2. 동일한 ID 체계로 로드맵 + 챕터 + 학습 항목 전체를 Supabase에 저장
    const synced = await this.pushFullRoadmapToRemote(savedLocal);
    if (!synced) {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: savedLocal.id,
        userId: savedLocal.userId,
        timestamp: new Date().toISOString(),
      });
    }

    return savedLocal;
  }

  public async updateItemStatus(
    itemId: string,
    status: ItemStatus
  ): Promise<RoadmapItem | null> {
    const localUpdated = await localStorageAdapter.updateItemStatus(
      itemId,
      status
    );
    if (!localUpdated) return null;

    const now = new Date().toISOString();
    if (!this.isOnline()) {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: localUpdated.roadmapId,
        userId: getActiveUserId(),
        timestamp: now,
      });
      return localUpdated;
    }

    try {
      const itemEndpoint = `${this.config.url}/rest/v1/roadmap_items?id=eq.${encodeURIComponent(itemId)}`;
      const itemRes = await fetch(itemEndpoint, {
        method: 'PATCH',
        headers: this.getHeaders('return=minimal'),
        body: JSON.stringify({
          status,
          completed_at: status === 'DONE' ? now : null,
          updated_at: now,
        }),
      });

      const roadmapEndpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(localUpdated.roadmapId)}&user_id=eq.${encodeURIComponent(getActiveUserId())}`;
      await fetch(roadmapEndpoint, {
        method: 'PATCH',
        headers: this.getHeaders('return=minimal'),
        body: JSON.stringify({ updated_at: now }),
      });

      if (!itemRes.ok) {
        enqueueSyncOperation({
          type: 'UPSERT_ROADMAP',
          roadmapId: localUpdated.roadmapId,
          userId: getActiveUserId(),
          timestamp: now,
        });
      }
    } catch {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: localUpdated.roadmapId,
        userId: getActiveUserId(),
        timestamp: now,
      });
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
    if (!localUpdated) return null;

    const now = new Date().toISOString();
    if (!this.isOnline()) {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: localUpdated.roadmapId,
        userId: getActiveUserId(),
        timestamp: now,
      });
      return localUpdated;
    }

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmap_items?id=eq.${encodeURIComponent(itemId)}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders('return=minimal'),
        body: JSON.stringify({
          memo,
          ...(referenceLink !== undefined
            ? { reference_link: referenceLink }
            : {}),
          updated_at: now,
        }),
      });

      const roadmapEndpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(localUpdated.roadmapId)}&user_id=eq.${encodeURIComponent(getActiveUserId())}`;
      await fetch(roadmapEndpoint, {
        method: 'PATCH',
        headers: this.getHeaders('return=minimal'),
        body: JSON.stringify({ updated_at: now }),
      });

      if (!res.ok) {
        enqueueSyncOperation({
          type: 'UPSERT_ROADMAP',
          roadmapId: localUpdated.roadmapId,
          userId: getActiveUserId(),
          timestamp: now,
        });
      }
    } catch {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: localUpdated.roadmapId,
        userId: getActiveUserId(),
        timestamp: now,
      });
    }

    return localUpdated;
  }

  public async toggleArchiveRoadmap(
    id: string,
    isArchived: boolean
  ): Promise<Roadmap | null> {
    const localUpdated = await localStorageAdapter.toggleArchiveRoadmap(
      id,
      isArchived
    );
    if (!localUpdated) return null;

    const now = new Date().toISOString();
    if (!this.isOnline()) {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: id,
        userId: getActiveUserId(),
        timestamp: now,
      });
      return localUpdated;
    }

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(getActiveUserId())}`;
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: this.getHeaders('return=minimal'),
        body: JSON.stringify({
          is_archived: isArchived,
          updated_at: now,
        }),
      });
      if (!res.ok) {
        enqueueSyncOperation({
          type: 'UPSERT_ROADMAP',
          roadmapId: id,
          userId: getActiveUserId(),
          timestamp: now,
        });
      }
    } catch {
      enqueueSyncOperation({
        type: 'UPSERT_ROADMAP',
        roadmapId: id,
        userId: getActiveUserId(),
        timestamp: now,
      });
    }

    return localUpdated;
  }

  public async deleteRoadmap(id: string): Promise<boolean> {
    const localDeleted = await localStorageAdapter.deleteRoadmap(id);
    const activeUserId = getActiveUserId();

    if (!this.isOnline()) {
      enqueueSyncOperation({
        type: 'DELETE_ROADMAP',
        roadmapId: id,
        userId: activeUserId,
        timestamp: new Date().toISOString(),
      });
      return localDeleted;
    }

    try {
      const endpoint = `${this.config.url}/rest/v1/roadmaps?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(activeUserId)}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: this.getHeaders('return=minimal'),
      });
      if (!res.ok) {
        enqueueSyncOperation({
          type: 'DELETE_ROADMAP',
          roadmapId: id,
          userId: activeUserId,
          timestamp: new Date().toISOString(),
        });
      } else {
        dequeueSyncOperation(id);
      }
    } catch {
      enqueueSyncOperation({
        type: 'DELETE_ROADMAP',
        roadmapId: id,
        userId: activeUserId,
        timestamp: new Date().toISOString(),
      });
    }

    return localDeleted;
  }
}
