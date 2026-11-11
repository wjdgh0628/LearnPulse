import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/common';
import { Header, Navigation, Container, Footer } from '@/components/layout';
import { LoginModal, GuestBanner } from '@/components/auth';
import { TopicForm, ManualRoadmapModal } from '@/components/roadmap-creator';
import { StatsOverview, RoadmapLibraryGrid } from '@/components/dashboard';
import {
  RoadmapHeader,
  ChapterAccordion,
  ItemMemoDrawer,
  StudyGuideView,
} from '@/components/roadmap-view';
import { useRoadmapStore } from '@/stores/useRoadmapStore';
import { useRoadmapsQuery, useRoadmapMutations } from '@/hooks/useRoadmap';
import { useAuth } from '@/hooks/useAuth';
import type {
  CreateRoadmapPayload,
  ItemStatus,
  RoadmapItem,
} from '@/types';

export const App: React.FC = () => {
  const {
    activeTab,
    selectedRoadmapId,
    activeMemoItemId,
    activeStudyGuideItemId,
    activeStudyGuideKeyword,
    libraryFilter,
    isManualModalOpen,
    manualModalPrefill,
    pendingQuickTopic,
    setActiveTab,
    selectRoadmap,
    openMemoDrawer,
    closeMemoDrawer,
    openStudyGuide,
    closeStudyGuide,
    setLibraryFilter,
    openManualModal,
    closeManualModal,
    triggerQuickTopicCreator,
    clearPendingQuickTopic,
  } = useRoadmapStore();

  const { user, isGuest, storageMode, login, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const { data: roadmaps = [] } = useRoadmapsQuery();
  const {
    saveRoadmapMutation,
    toggleArchiveMutation,
    deleteRoadmapMutation,
    updateItemStatusMutation,
    saveItemMemoMutation,
  } = useRoadmapMutations();

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const selectedRoadmap =
    roadmaps.find((r) => r.id === selectedRoadmapId) ?? null;

  let activeMemoItem: RoadmapItem | null = null;
  let activeMemoChapterTitle: string | undefined;

  if (selectedRoadmap && activeMemoItemId) {
    for (const chapter of selectedRoadmap.chapters) {
      const found = chapter.items.find((i) => i.id === activeMemoItemId);
      if (found) {
        activeMemoItem = found;
        activeMemoChapterTitle = chapter.title;
        break;
      }
    }
  }

  // Locate active Study Guide item + Prev/Next items across chapters
  let activeStudyGuideData: {
    item: RoadmapItem;
    chapterTitle: string;
    prevItem: { id: string; title: string } | null;
    nextItem: { id: string; title: string } | null;
  } | null = null;

  if (selectedRoadmap && activeStudyGuideItemId) {
    const flatItems: Array<{ item: RoadmapItem; chapterTitle: string }> = [];
    for (const chapter of selectedRoadmap.chapters) {
      for (const item of chapter.items) {
        flatItems.push({ item, chapterTitle: chapter.title });
      }
    }

    const currentIdx = flatItems.findIndex(
      (entry) => entry.item.id === activeStudyGuideItemId
    );
    if (currentIdx !== -1) {
      const currentEntry = flatItems[currentIdx];
      const prevEntry = currentIdx > 0 ? flatItems[currentIdx - 1] : null;
      const nextEntry =
        currentIdx < flatItems.length - 1 ? flatItems[currentIdx + 1] : null;

      activeStudyGuideData = {
        item: currentEntry.item,
        chapterTitle: currentEntry.chapterTitle,
        prevItem: prevEntry
          ? { id: prevEntry.item.id, title: prevEntry.item.title }
          : null,
        nextItem: nextEntry
          ? { id: nextEntry.item.id, title: nextEntry.item.title }
          : null,
      };
    }
  }

  const handleSaveRoadmap = async (payload: CreateRoadmapPayload) => {
    const created = await saveRoadmapMutation.mutateAsync(payload);
    setActiveTab('LIBRARY');
    selectRoadmap(created.id);
  };

  const handleToggleArchive = (roadmapId: string, nextArchived: boolean) => {
    toggleArchiveMutation.mutate({ id: roadmapId, isArchived: nextArchived });
  };

  const handleDeleteRoadmap = (roadmapId: string) => {
    if (selectedRoadmapId === roadmapId) {
      selectRoadmap(null);
    }
    deleteRoadmapMutation.mutate(roadmapId);
  };

  const handleStatusChange = (itemId: string, nextStatus: ItemStatus) => {
    updateItemStatusMutation.mutate({ itemId, status: nextStatus });
  };

  const handleSaveMemo = (
    itemId: string,
    memo: string,
    referenceLink?: string
  ) => {
    saveItemMemoMutation.mutate({ itemId, memo, referenceLink });
  };

  const handleOpenStudyGuideFromDashboard = (
    roadmapId: string,
    itemId: string
  ) => {
    selectRoadmap(roadmapId);
    openStudyGuide(itemId);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        user={user}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenManualModal={() => openManualModal()}
      />

      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        roadmapCount={roadmaps.length}
      />

      <main className="flex-1 py-6 sm:py-8">
        <Container className="space-y-6 sm:space-y-8">
          <GuestBanner
            isGuest={isGuest}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />

          {activeTab === 'LIBRARY' ? (
            selectedRoadmap ? (
              activeStudyGuideData ? (
                <StudyGuideView
                  roadmapTitle={selectedRoadmap.title}
                  roadmapTopic={selectedRoadmap.topic}
                  chapterTitle={activeStudyGuideData.chapterTitle}
                  item={activeStudyGuideData.item}
                  highlightedKeyword={activeStudyGuideKeyword}
                  prevItem={activeStudyGuideData.prevItem}
                  nextItem={activeStudyGuideData.nextItem}
                  onBack={closeStudyGuide}
                  onSelectItem={(nextId) => openStudyGuide(nextId)}
                  onStatusChange={handleStatusChange}
                  onSaveMemo={handleSaveMemo}
                />
              ) : (
                <section
                  className="space-y-6"
                  aria-label="로드맵 인터랙티브 체크리스트"
                >
                  <RoadmapHeader
                    roadmap={selectedRoadmap}
                    allRoadmaps={roadmaps}
                    onBackToList={() => selectRoadmap(null)}
                    onSelectRoadmap={(id) => selectRoadmap(id)}
                    onToggleArchive={handleToggleArchive}
                  />

                  {/* Interactive Chapter Accordions & 3-State Checklist */}
                  <div className="space-y-4">
                    {selectedRoadmap.chapters.map((chapter) => (
                      <ChapterAccordion
                        key={chapter.id}
                        chapter={chapter}
                        defaultOpen
                        activeMemoItemId={activeMemoItemId}
                        onStatusChange={handleStatusChange}
                        onOpenMemo={(itemId) => openMemoDrawer(itemId)}
                        onOpenStudyGuide={(itemId, kw) =>
                          openStudyGuide(itemId, kw)
                        }
                      />
                    ))}
                  </div>
                </section>
              )
            ) : (
              <section className="space-y-6" aria-label="내 보관함 대시보드">
                {/* Top Welcome Banner */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                      {user
                        ? `${user.nickname} 님의 학습 로드맵 보관함`
                        : '내 학습 로드맵 보관함'}
                    </h1>
                    <Badge variant="success">
                      {storageMode === 'SUPABASE'
                        ? 'Supabase 클라우드 연결됨'
                        : 'LocalStorage 동기화 활성'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    여러 주제의 로드맵을 보관함에 등록하고 전체 학습 진척도와 오늘의 우선 학습 단원을 한눈에 관리하세요.
                  </p>
                </div>

                {/* 대시보드 메인 3단 구성 (1. 미니멀 진척도 바 / 2. 원클릭 인기 주제 칩 / 3. 오늘의 최우선 미완료 단원 Top 3 + 더보기) */}
                <StatsOverview
                  roadmaps={roadmaps}
                  onTriggerQuickTopic={triggerQuickTopicCreator}
                  onUpdateItemStatus={handleStatusChange}
                  onOpenStudyGuideFromDashboard={
                    handleOpenStudyGuideFromDashboard
                  }
                />

                {/* Multi-Roadmap Library Grid */}
                <RoadmapLibraryGrid
                  roadmaps={roadmaps}
                  selectedRoadmapId={selectedRoadmapId}
                  filter={libraryFilter}
                  onChangeFilter={setLibraryFilter}
                  onSelectRoadmap={(id) => selectRoadmap(id)}
                  onToggleArchive={handleToggleArchive}
                  onDeleteRoadmap={handleDeleteRoadmap}
                  onOpenCreator={() => setActiveTab('CREATOR')}
                />
              </section>
            )
          ) : (
            <section className="space-y-6" aria-label="AI 로드맵 생성기">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
                    AI 맞춤형 로드맵 설계
                  </h1>
                  <Badge variant="brand">Curriculum Engine</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  학습하고 싶은 주제와 현재 배경지식 수준, 목표 기간을 선택하면 체계적인 단계별 체크리스트를 생성합니다.
                </p>
              </div>

              <TopicForm
                onSaveRoadmap={handleSaveRoadmap}
                pendingQuickTopic={pendingQuickTopic}
                onClearQuickTopic={clearPendingQuickTopic}
              />
            </section>
          )}
        </Container>
      </main>

      <Footer />

      {/* 1-Depth 수동 로드맵 즉시 생성 팝업 (우측 상단 Split Button ➕ 아이콘 연동) */}
      <ManualRoadmapModal
        isOpen={isManualModalOpen}
        prefill={manualModalPrefill}
        onClose={closeManualModal}
        onSaveRoadmap={handleSaveRoadmap}
      />

      {/* Inline Memo & Reference Link Side Drawer */}
      <ItemMemoDrawer
        item={activeMemoItem}
        chapterTitle={activeMemoChapterTitle}
        onClose={closeMemoDrawer}
        onSaveMemo={(id, memo, link) => handleSaveMemo(id, memo, link)}
      />

      {/* Hybrid Auth & Profile Sync Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        user={user}
        storageMode={storageMode}
        onLogin={login}
        onLogout={logout}
      />
    </div>
  );
};

export default App;
