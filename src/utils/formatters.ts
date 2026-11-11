import type { BadgeVariant, Roadmap, UserLevel } from '@/types';

const LEVEL_LABEL_MAP: Record<UserLevel, string> = {
  BEGINNER: '입문',
  INTERMEDIATE: '중급',
  ADVANCED: '심화',
};

const LEVEL_BADGE_MAP: Record<UserLevel, BadgeVariant> = {
  BEGINNER: 'success',
  INTERMEDIATE: 'brand',
  ADVANCED: 'warning',
};

export function formatLevelLabel(level: UserLevel): string {
  return LEVEL_LABEL_MAP[level];
}

export function getLevelBadgeVariant(level: UserLevel): BadgeVariant {
  return LEVEL_BADGE_MAP[level];
}

export function formatDateShort(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

export interface RoadmapProgressStats {
  totalItems: number;
  doneItems: number;
  inProgressItems: number;
  todoItems: number;
  percentage: number;
}

export function calculateRoadmapStats(roadmap: Roadmap): RoadmapProgressStats {
  let totalItems = 0;
  let doneItems = 0;
  let inProgressItems = 0;
  let todoItems = 0;

  for (const chapter of roadmap.chapters) {
    for (const item of chapter.items) {
      totalItems += 1;
      if (item.status === 'DONE') {
        doneItems += 1;
      } else if (item.status === 'IN_PROGRESS') {
        inProgressItems += 1;
      } else {
        todoItems += 1;
      }
    }
  }

  const percentage =
    totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  return {
    totalItems,
    doneItems,
    inProgressItems,
    todoItems,
    percentage,
  };
}
