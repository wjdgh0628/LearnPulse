import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Badge } from '@/components/common';
import { Header, Navigation, Container, Footer } from '@/components/layout';
import { GuestBanner } from '@/components/auth/GuestBanner';
import { StatsOverview, RoadmapLibraryGrid } from '@/components/dashboard';
import { RoadmapHeader } from '@/components/roadmap-view/RoadmapHeader';
import { ChapterAccordion } from '@/components/roadmap-view/ChapterAccordion';
import { useRoadmapNavigation } from '@/hooks/useRoadmapNavigation';
import { useAuth } from '@/hooks/useAuth';

// 초기 대시보드 렌더링에 불필요한 무거운 뷰/모달을 지연 로딩(Code Splitting)으로 분리
const StudyGuideView = lazy(() =>
  import('@/components/roadmap-view/StudyGuideView').then((mod) => ({
    default: mod.StudyGuideView,
  }))
);
const TopicForm = lazy(() =>
  import('@/components/roadmap-creator/TopicForm').then((mod) => ({
    default: mod.TopicForm,
  }))
);
const ManualRoadmapModal = lazy(() =>
  import('@/components/roadmap-creator/ManualRoadmapModal').then((mod) => ({
    default: mod.ManualRoadmapModal,
  }))
);
const ItemMemoDrawer = lazy(() =>
  import('@/components/roadmap-view/ItemMemoDrawer').then((mod) => ({
    default: mod.ItemMemoDrawer,
  }))
);
const LoginModal = lazy(() =>
  import('@/components/auth/LoginModal').then((mod) => ({
    default: mod.LoginModal,
  }))
);

const ViewLoadingFallback: React.FC = () => (
  <div
    className="flex min-h-[240px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-8 text-sm font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
    role="status"
    aria-live="polite"
  >
    화면을 불러오는 중입니다...
  </div>
);

export const App: React.FC = () => {
  const {
    roadmaps,
    activeTab,
    selectedRoadmapId,
    selectedRoadmap,
    activeMemoItemId,
    activeMemoItem,
    activeMemoChapterTitle,
    activeStudyGuideKeyword,
    activeStudyGuideData,
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
    handleSaveRoadmap,
    handleToggleArchive,
    handleDeleteRoadmap,
    handleStatusChange,
    handleSaveMemo,
    handleOpenStudyGuideFromDashboard,
  } = useRoadmapNavigation();

  const { user, isGuest, storageMode, login, logout } = useAuth();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

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
                <Suspense fallback={<ViewLoadingFallback />}>
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
                </Suspense>
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
                        onOpenMemo={openMemoDrawer}
                        onOpenStudyGuide={openStudyGuide}
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
                  onSelectRoadmap={selectRoadmap}
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

              <Suspense fallback={<ViewLoadingFallback />}>
                <TopicForm
                  onSaveRoadmap={handleSaveRoadmap}
                  pendingQuickTopic={pendingQuickTopic}
                  onClearQuickTopic={clearPendingQuickTopic}
                />
              </Suspense>
            </section>
          )}
        </Container>
      </main>

      <Footer />

      {/* 1-Depth 수동 로드맵 즉시 생성 팝업 (열릴 때만 지연 렌더링) */}
      {isManualModalOpen && (
        <Suspense fallback={null}>
          <ManualRoadmapModal
            isOpen={isManualModalOpen}
            prefill={manualModalPrefill}
            onClose={closeManualModal}
            onSaveRoadmap={handleSaveRoadmap}
          />
        </Suspense>
      )}

      {/* Inline Memo & Reference Link Side Drawer (열릴 때만 지연 렌더링) */}
      {activeMemoItem && (
        <Suspense fallback={null}>
          <ItemMemoDrawer
            item={activeMemoItem}
            chapterTitle={activeMemoChapterTitle}
            onClose={closeMemoDrawer}
            onSaveMemo={handleSaveMemo}
          />
        </Suspense>
      )}

      {/* Hybrid Auth & Profile Sync Modal (열릴 때만 지연 렌더링) */}
      {isLoginModalOpen && (
        <Suspense fallback={null}>
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            user={user}
            storageMode={storageMode}
            onLogin={login}
            onLogout={logout}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
