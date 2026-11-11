import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/useAuthStore';
import { storageAdapter } from '@/features/storage/storageAdapter';
import { localStorageAdapter } from '@/features/storage/localStorageAdapter';
import { ROADMAPS_QUERY_KEY } from '@/hooks/useRoadmap';

export function useAuth() {
  const queryClient = useQueryClient();
  const { user, isGuest, loginWithDemoAccount, logoutToGuest } = useAuthStore();

  const login = useCallback(
    (email: string, nickname?: string) => {
      const profile = loginWithDemoAccount(email, nickname);
      // 게스트 상태에서 만든 로드맵을 로그인 사용자 계정으로 귀속 후 캐시 갱신
      localStorageAdapter.claimGuestRoadmaps(profile.id);
      void queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
    },
    [loginWithDemoAccount, queryClient]
  );

  const logout = useCallback(() => {
    logoutToGuest();
    void queryClient.invalidateQueries({ queryKey: ROADMAPS_QUERY_KEY });
  }, [logoutToGuest, queryClient]);

  return {
    user,
    isGuest,
    storageMode: storageAdapter.mode,
    login,
    logout,
  };
}
