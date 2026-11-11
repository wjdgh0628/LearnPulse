import React from 'react';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { Badge, SplitActionButton } from '@/components/common';
import { Container } from '@/components/layout/Container';
import { UserProfileMenu } from '@/components/auth/UserProfileMenu';
import type { NavigationTab, UserProfile } from '@/types';

export interface HeaderProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  user: UserProfile | null;
  onOpenLoginModal: () => void;
  onOpenManualModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  user,
  onOpenLoginModal,
  onOpenManualModal,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <button
          type="button"
          onClick={() => onSelectTab('LIBRARY')}
          className="group flex items-center gap-2.5 text-left focus:outline-none"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg dark:text-white">
                LearnPulse
              </span>
              <Badge variant="brand" className="hidden md:inline-flex">
                AI Beta
              </Badge>
            </div>
            <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
              개인화 학습 로드맵 & 진도 관리
            </p>
          </div>
        </button>

        {/* Unified Top-Right Actions (단일 Split Button 배치) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            title={isDarkMode ? '라이트 모드' : '다크 모드'}
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <UserProfileMenu user={user} onOpenModal={onOpenLoginModal} />

          {/* 단일 분할형 액션 버튼: 좌측(✨ AI로 로드맵 생성) / 우측(➕ 1-Depth 수동 생성 팝업) */}
          <SplitActionButton
            onAICreate={() => onSelectTab('CREATOR')}
            onManualCreate={onOpenManualModal}
          />
        </div>
      </Container>
    </header>
  );
};
