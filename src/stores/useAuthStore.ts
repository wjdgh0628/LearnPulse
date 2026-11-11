import { create } from 'zustand';
import type { UserProfile } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isGuest: boolean;
  loginWithDemoAccount: (email: string, nickname?: string) => void;
  logoutToGuest: () => void;
}

const AUTH_STORAGE_KEY = 'learnpulse_auth_user_v1';

function readInitialUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

const initialUser = readInitialUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isGuest: initialUser === null,
  loginWithDemoAccount: (email, nickname) => {
    const profile: UserProfile = {
      id: `user_${Date.now()}`,
      email: email.trim(),
      nickname: nickname?.trim() || email.split('@')[0] || '학습자',
      createdAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage error
    }
    set({ user: profile, isGuest: false });
  },
  logoutToGuest: () => {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage error
    }
    set({ user: null, isGuest: true });
  },
}));
