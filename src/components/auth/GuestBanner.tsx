import React from 'react';
import { ShieldAlert, UserPlus } from 'lucide-react';
import { Button } from '@/components/common';

export interface GuestBannerProps {
  isGuest: boolean;
  onOpenLogin: () => void;
}

export const GuestBanner: React.FC<GuestBannerProps> = ({
  isGuest,
  onOpenLogin,
}) => {
  if (!isGuest) return null;

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-brand-200/80 bg-gradient-to-r from-brand-50/90 to-indigo-50/80 px-4 py-3 sm:flex-row sm:items-center dark:border-brand-900/60 dark:from-brand-950/50 dark:to-indigo-950/40">
      <div className="flex items-center gap-2.5 text-xs sm:text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
        <span className="text-slate-700 dark:text-slate-200">
          현재 <strong>게스트 모드(LocalStorage)</strong>로 이용 중입니다. 계정을 연동하면 현재 보관함의 모든 로드맵이 내 계정에 영구 귀속됩니다.
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        leftIcon={<UserPlus className="h-3.5 w-3.5" />}
        onClick={onOpenLogin}
        className="shrink-0 bg-white dark:bg-slate-900"
      >
        3초 계정 연동
      </Button>
    </div>
  );
};
