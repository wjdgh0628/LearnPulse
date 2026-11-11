import { z } from 'zod';

export type NavigationTab = 'LIBRARY' | 'CREATOR';

export type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'danger' | 'outline';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type UserLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ItemStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type StorageMode = 'LOCAL' | 'SUPABASE';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  createdAt: string;
}

export type User = UserProfile;

export interface StudyGuideKeyConcept {
  term: string;
  definition: string;
  point: string;
}

export interface StudyGuideSelfCheck {
  question: string;
  answer: string;
}

export interface StudyGuideOfficialDoc {
  title: string;
  url: string;
  description: string;
}

export interface StudyGuideResourceItem {
  category: '공식 문서 (필독)' | '핵심 튜토리얼' | '실습 환경/도구' | '추천 학습 자료';
  title: string;
  whatToRead: string;
  whyRecommended: string;
  url?: string;
}

export interface StudyGuideTimeAllocation {
  phase: string;
  duration: string;
  detail: string;
}

export interface StudyGuideContent {
  startHereGuide: string;
  timeAllocation: StudyGuideTimeAllocation[];
  recommendedResources: StudyGuideResourceItem[];
  overview: string;
  whyItMatters: string;
  keyConcepts: StudyGuideKeyConcept[];
  exampleTitle: string;
  exampleCode: string;
  exampleExplanation: string[];
  commonMistakes: string[];
  selfCheckQuestions: StudyGuideSelfCheck[];
  officialDocs: StudyGuideOfficialDoc[];
}

export interface RoadmapItem {
  id: string;
  chapterId: string;
  roadmapId: string;
  orderIndex: number;
  title: string;
  description?: string;
  subTasks?: string[];
  keywords?: string[];
  estimatedTime?: string;
  status: ItemStatus;
  memo?: string;
  referenceLink?: string;
  completedAt?: string | null;
}

export interface RoadmapChapter {
  id: string;
  roadmapId: string;
  orderIndex: number;
  title: string;
  description: string;
  items: RoadmapItem[];
}

export interface Roadmap {
  id: string;
  userId: string;
  title: string;
  topic: string;
  level: UserLevel;
  targetDuration: string;
  summary: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt?: string;
  chapters: RoadmapChapter[];
}

export interface CreateRoadmapPayload {
  title: string;
  topic: string;
  level: UserLevel;
  targetDuration: string;
  summary: string;
  chapters: Array<{
    title: string;
    description: string;
    items: Array<{
      title: string;
      description?: string;
      subTasks?: string[];
      keywords?: string[];
      estimatedTime?: string;
      referenceLink?: string;
      memo?: string;
    }>;
  }>;
}

export interface AIRoadmapGenerationInput {
  topic: string;
  level: UserLevel;
  targetDuration: string;
}

export interface PendingQuickTopicPrompt {
  topic: string;
  level: UserLevel;
  targetDuration: string;
  autoRunKey: number;
}

export const AIRoadmapSchema = z.object({
  title: z.string().min(2),
  topic: z.string().min(1),
  summary: z.string().min(10),
  targetDuration: z.string(),
  chapters: z
    .array(
      z.object({
        title: z.string().min(2),
        description: z.string(),
        items: z
          .array(
            z.object({
              title: z.string().min(2),
              description: z.string().optional(),
              subTasks: z.array(z.string()).optional(),
              keywords: z.array(z.string()).optional(),
              estimatedTime: z.string().optional(),
              referenceLink: z.string().optional(),
            })
          )
          .min(2),
      })
    )
    .min(3),
});

export type AIRoadmapResult = z.infer<typeof AIRoadmapSchema>;

export interface StorageAdapter {
  readonly mode: StorageMode;
  getRoadmaps(): Promise<Roadmap[]>;
  getRoadmapById(id: string): Promise<Roadmap | null>;
  saveRoadmap(payload: CreateRoadmapPayload | Roadmap): Promise<Roadmap>;
  updateItemStatus(itemId: string, status: ItemStatus): Promise<RoadmapItem | null>;
  saveItemMemo(
    itemId: string,
    memo: string,
    referenceLink?: string
  ): Promise<RoadmapItem | null>;
  toggleArchiveRoadmap(id: string, isArchived: boolean): Promise<Roadmap | null>;
  deleteRoadmap(id: string): Promise<boolean>;
}
