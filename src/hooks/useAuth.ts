import { useAuthStore } from '@/stores/useAuthStore';
import { storageAdapter } from '@/features/storage/storageAdapter';

export function useAuth() {
  const { user, isGuest, loginWithDemoAccount, logoutToGuest } = useAuthStore();

  return {
    user,
    isGuest,
    storageMode: storageAdapter.mode,
    login: loginWithDemoAccount,
    logout: logoutToGuest,
  };
}
