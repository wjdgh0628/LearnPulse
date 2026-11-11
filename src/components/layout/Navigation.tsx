import React from 'react';
import { BookOpen, Wand2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Container } from '@/components/layout/Container';
import type { NavigationTab } from '@/types';

export interface NavigationProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  roadmapCount?: number;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  roadmapCount = 0,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'LIBRARY',
      label: '내 보관함',
      description: '진행 중인 로드맵 및 학습 통계',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      id: 'CREATOR',
      label: '로드맵 생성기',
      description: 'AI 맞춤형 커리큘럼 설계',
      icon: <Wand2 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="border-b border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900/50">
      <Container>
        <nav className="flex gap-2 py-2.5" aria-label="주요 메뉴">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  'group relative flex items-center gap-2.5 rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                )}
              >
                <span
                  className={cn(
                    'transition-colors',
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'LIBRARY' && (
                  <span
                    className={cn(
                      'ml-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
                      isActive
                        ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    )}
                  >
                    {roadmapCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </Container>
    </div>
  );
};
