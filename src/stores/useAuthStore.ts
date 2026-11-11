import { create } from 'zustand';
import type { UserProfile } from '@/types';

export const GUEST_USER_ID = 'guest-local-user';
const AUTH_STORAGE_KEY = 'learnpulse_auth_user_v1';

/**
 * 동일한 이메일로 재로그인하거나 다른 기기에서 로그인할 때도
 * 항상 일관된 userId를 생성하기 위한 결정론적(Deterministic) 해시 함수
 */
export function deriveUserIdFromEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 5381;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }
  const unsignedHex = (hash >>> 0).toString(16).padStart(8, '0');
  const safePrefix = normalized
    .split('@')[0]
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 12);
  return `user_${safePrefix || 'member'}_${unsignedHex}`;
}

function isValidUserProfile(value: unknown): value is UserProfile {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.email === 'string' &&
    candidate.email.includes('@') &&
    typeof candidate.nickname === 'string' &&
    typeof candidate.createdAt === 'string'
  );
}

function readInitialUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidUserProfile(parsed)) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    // 기존에 Date.now()로 생성된 임시 ID가 있다면 이메일 기반 결정론적 ID로 정규화
    const deterministicId = deriveUserIdFromEmail(parsed.email);
    if (parsed.id !== deterministicId) {
      const normalizedProfile: UserProfile = {
        ...parsed,
        id: deterministicId,
      };
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(normalizedProfile)
      );
      return normalizedProfile;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getActiveUserId(): string {
  const state = useAuthStore.getState();
  return state.user?.id ?? GUEST_USER_ID;
}

interface AuthState {
  user: UserProfile | null;
  isGuest: boolean;
  loginWithDemoAccount: (email: string, nickname?: string) => UserProfile;
  logoutToGuest: () => void;
}

const initialUser = readInitialUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isGuest: initialUser === null,
  loginWithDemoAccount: (email, nickname) => {
    const normalizedEmail = email.trim().toLowerCase();
    const profile: UserProfile = {
      id: deriveUserIdFromEmail(normalizedEmail),
      email: normalizedEmail,
      nickname:
        nickname?.trim() || normalizedEmail.split('@')[0] || '학습자',
      createdAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.warn('[LearnPulse Auth] Failed to persist user profile:', err);
    }
    set({ user: profile, isGuest: false });
    return profile;
  },
  logoutToGuest: () => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (err) {
      console.warn('[LearnPulse Auth] Failed to clear user profile:', err);
    }
    set({ user: null, isGuest: true });
  },
}));
