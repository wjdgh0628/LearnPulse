import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Lightbulb,
  Code2,
  Copy,
  Check,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  Clock,
  Circle,
  Timer,
  Tag,
  StickyNote,
  ExternalLink,
  Compass,
  BookOpenCheck,
  Save,
} from 'lucide-react';
import { Badge, Button, Card } from '@/components/common';
import { generateStudyGuideContent } from '@/features/ai/studyGuideGenerator';
import { cn } from '@/utils/cn';
import type {
  BadgeVariant,
  ItemStatus,
  RoadmapItem,
  StudyGuideResourceItem,
} from '@/types';

export interface StudyGuideViewProps {
  roadmapTitle: string;
  roadmapTopic: string;
  chapterTitle: string;
  item: RoadmapItem;
  highlightedKeyword?: string | null;
  prevItem?: { id: string; title: string } | null;
  nextItem?: { id: string; title: string } | null;
  onBack: () => void;
  onSelectItem?: (itemId: string) => void;
  onStatusChange?: (itemId: string, nextStatus: ItemStatus) => void;
  onSaveMemo?: (itemId: string, memo: string, referenceLink?: string) => void;
}

const STATUS_OPTIONS: Array<{
  value: ItemStatus;
  label: string;
  icon: React.ReactNode;
}> = [
  { value: 'TODO', label: '대기', icon: <Circle className="h-4 w-4" /> },
  {
    value: 'IN_PROGRESS',
    label: '진행 중',
    icon: <Clock className="h-4 w-4" />,
  },
  {
    value: 'DONE',
    label: '학습 완료',
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
];

const RESOURCE_BADGE_MAP: Record<
  StudyGuideResourceItem['category'],
  BadgeVariant
> = {
  '공식 문서 (필독)': 'brand',
  '핵심 튜토리얼': 'success',
  '실습 환경/도구': 'warning',
  '추천 학습 자료': 'default',
};

export const StudyGuideView: React.FC<StudyGuideViewProps> = ({
  roadmapTitle,
  roadmapTopic,
  chapterTitle,
  item,
  highlightedKeyword,
  prevItem,
  nextItem,
  onBack,
  onSelectItem,
  onStatusChange,
  onSaveMemo,
}) => {
  const guide = generateStudyGuideContent(item, roadmapTopic, chapterTitle);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [openAnswers, setOpenAnswers] = useState<Record<number, boolean>>({});
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [memoDraft, setMemoDraft] = useState<string>(item.memo ?? '');
  const [memoSaved, setMemoSaved] = useState<boolean>(false);

  useEffect(() => {
    setMemoDraft(item.memo ?? '');
    setMemoSaved(false);
    setOpenAnswers({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [item.id, item.memo]);

  const handleCopyCode = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(guide.exampleCode);
        setCopiedCode(true);
        window.setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleSaveNote = () => {
    if (!onSaveMemo) return;
    onSaveMemo(item.id, memoDraft, item.referenceLink);
    setMemoSaved(true);
    window.setTimeout(() => setMemoSaved(false), 2000);
  };

  const subTasks = item.subTasks ?? [];

  return (
    <article
      className="space-y-8 pb-8"
      aria-label={`${item.title} 학습 가이드 보고서`}
    >
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <Button
          variant="ghost"
          size="md"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={onBack}
        >
          체크리스트로 돌아가기
        </Button>

        <div className="flex items-center gap-2.5">
          {prevItem && onSelectItem && (
            <Button
              variant="outline"
              size="md"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => onSelectItem(prevItem.id)}
              title={`이전 단원: ${prevItem.title}`}
            >
              이전 단원
            </Button>
          )}
          {nextItem && onSelectItem && (
            <Button
              variant="outline"
              size="md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={() => onSelectItem(nextItem.id)}
              title={`다음 단원: ${nextItem.title}`}
            >
              다음 단원
            </Button>
          )}
        </div>
      </div>

      {/* REPORT HEADER + SECTION 01: WHAT MATERIALS TO LOOK AT (최상단 배치!) */}
      <Card
        padding="lg"
        className="space-y-7 border-t-4 border-t-brand-600 sm:p-8 dark:border-t-brand-500"
      >
        <div className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-start dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
              <Badge variant="brand" className="px-3 py-1 text-xs">
                단원 학습 리포트
              </Badge>
              <span>{roadmapTitle}</span>
              <span>·</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {chapterTitle}
              </span>
              {item.estimatedTime && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Timer className="h-3.5 w-3.5 text-brand-500" />
                  권장 {item.estimatedTime}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {item.title}
            </h1>
          </div>

          {/* Status Switcher */}
          {onStatusChange && (
            <div className="flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-800 dark:bg-slate-800/80">
              {STATUS_OPTIONS.map((opt) => {
                const isActive = item.status === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onStatusChange(item.id, opt.value)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition-all',
                      isActive
                        ? opt.value === 'DONE'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : opt.value === 'IN_PROGRESS'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    )}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 01: 무엇을 보고 공부할까요? (페이지 열자마자 바로 보이도록 최상단 배치) */}
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-bold text-white">
                01 · 필독 참고자료
              </span>
              <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                무엇을 보고 공부할까요?
              </h2>
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              우측 <strong className="text-brand-600 dark:text-brand-400">[이 자료 바로 열기 ↗]</strong> 버튼을 누르면 해당 교재/문서로 이동합니다.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {guide.recommendedResources.map((res, idx) => (
              <div
                key={`${res.title}-${idx}`}
                className="rounded-2xl border-2 border-slate-200/90 bg-slate-50/40 p-5 transition-all hover:border-brand-400 sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-600"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3.5 sm:items-center">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-base font-extrabold text-white dark:bg-brand-500">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={RESOURCE_BADGE_MAP[res.category]}>
                          {res.category}
                        </Badge>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {res.whyRecommended}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 sm:text-xl dark:text-white">
                        {res.title}
                      </h3>
                    </div>
                  </div>

                  {res.url && (
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-700 sm:self-auto dark:bg-brand-500 dark:hover:bg-brand-600"
                    >
                      <span>이 자료 바로 열기</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Concise "What to Read" Callout */}
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200/80 dark:bg-slate-800/70 dark:ring-slate-700">
                  <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-brand-600 dark:text-brand-400" />
                  <div className="text-base leading-relaxed text-slate-800 dark:text-slate-200">
                    <strong className="mr-2 font-bold text-brand-700 dark:text-brand-300">
                      볼 부분:
                    </strong>
                    {res.whatToRead}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary: Clear Start Guide & Time Allocation */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-6 dark:border-brand-900/60 dark:bg-brand-950/30">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs dark:bg-brand-500">
              <Compass className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-brand-950 sm:text-lg dark:text-brand-100">
                어떻게 공부를 시작할까요? (0순위 요약)
              </h3>
              <p className="text-base leading-relaxed text-slate-800 dark:text-slate-200">
                {guide.startHereGuide}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {guide.timeAllocation.map((slot, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
                    {slot.phase}
                  </span>
                  <Badge variant="brand">{slot.duration}</Badge>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {slot.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* SECTION 02: CORE CONCEPT & KEYWORDS (큰 글씨 & 짧은 요약) */}
      <Card padding="lg" className="space-y-6 sm:p-8">
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-bold text-white">
              02 · 핵심 개념
            </span>
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              핵심 원리 & 필수 용어 정리
            </h2>
          </div>
        </div>

        {/* Concise Overview */}
        <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/50">
          <p className="text-base font-medium leading-relaxed text-slate-900 sm:text-lg dark:text-slate-100">
            {guide.overview}
          </p>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand-700 sm:text-base dark:text-brand-300">
            <Lightbulb className="h-5 w-5 shrink-0 text-amber-500" />
            <span>핵심 중요도: {guide.whyItMatters}</span>
          </p>
        </div>

        {/* Keyword Cards with Larger Text & More Breathing Room */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {guide.keyConcepts.map((concept) => {
            const isHighlighted =
              highlightedKeyword &&
              concept.term.toLowerCase() === highlightedKeyword.toLowerCase();

            return (
              <div
                key={concept.term}
                className={cn(
                  'rounded-2xl border p-5 transition-all',
                  isHighlighted
                    ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-950/40'
                    : 'border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-brand-100 px-3 py-1 text-sm font-extrabold text-brand-800 dark:bg-brand-900/70 dark:text-brand-200">
                    <Tag className="h-3.5 w-3.5" />
                    {concept.term}
                  </span>
                  {isHighlighted && (
                    <Badge variant="brand">선택한 키워드</Badge>
                  )}
                </div>

                <p className="mt-3 text-base font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                  {concept.definition}
                </p>

                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  💡 <strong>팁:</strong> {concept.point}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* SECTION 03: PRACTICAL EXAMPLE */}
      <Card padding="lg" className="space-y-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-bold text-white">
              03 · 실전 예제
            </span>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
              <Code2 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              {guide.exampleTitle}
            </h2>
          </div>

          <Button
            variant="outline"
            size="md"
            leftIcon={
              copiedCode ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )
            }
            onClick={() => void handleCopyCode()}
          >
            {copiedCode ? '복사 완료!' : '예제 복사하기'}
          </Button>
        </div>

        <pre className="overflow-x-auto rounded-2xl bg-slate-900 p-5 text-sm leading-relaxed text-slate-100 sm:text-base dark:bg-slate-950 dark:ring-1 dark:ring-slate-800">
          <code>{guide.exampleCode}</code>
        </pre>

        <ul className="space-y-3 rounded-2xl bg-slate-50 p-5 text-base leading-relaxed text-slate-800 dark:bg-slate-800/50 dark:text-slate-200">
          {guide.exampleExplanation.map((exp, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <span>{exp}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* SECTION 04: STEP-BY-STEP CHECKLIST & PITFALLS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="lg" className="space-y-5 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
              <BookOpenCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              단계별 실습 순서 ({subTasks.length}단계)
            </h2>
          </div>

          <ul className="space-y-3">
            {subTasks.map((step, idx) => {
              const isChecked =
                item.status === 'DONE' || Boolean(checkedSteps[idx]);
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() =>
                      setCheckedSteps((prev) => ({
                        ...prev,
                        [idx]: !prev[idx],
                      }))
                    }
                    className={cn(
                      'flex w-full items-start gap-3.5 rounded-xl border p-4 text-left text-base transition-all',
                      isChecked
                        ? 'border-emerald-200 bg-emerald-50/40 text-slate-400 line-through dark:border-emerald-900/50 dark:bg-emerald-950/20'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
                        isChecked
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      {isChecked ? '✓' : idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card padding="lg" className="space-y-5 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            자주 하는 실수 주의하기
          </h2>

          <div className="space-y-3.5">
            {guide.commonMistakes.map((mistake, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 text-base leading-relaxed text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-sm font-bold text-amber-700 dark:text-amber-300">
                  !
                </span>
                <span>{mistake}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SECTION 05: SELF-CHECK Q&A & NOTE PAD */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="lg" className="space-y-5 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
            <HelpCircle className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            셀프 점검 퀴즈 (Q&A)
          </h2>

          <div className="space-y-3.5">
            {guide.selfCheckQuestions.map((qa, idx) => {
              const isOpen = Boolean(openAnswers[idx]);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAnswers((prev) => ({
                        ...prev,
                        [idx]: !prev[idx],
                      }))
                    }
                    className="flex w-full items-start justify-between gap-3 text-left"
                  >
                    <span className="text-base font-bold leading-relaxed text-slate-900 dark:text-white">
                      Q{idx + 1}. {qa.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        'mt-1 h-5 w-5 shrink-0 text-slate-400 transition-transform',
                        isOpen && 'rotate-180 text-brand-600'
                      )}
                    />
                  </button>

                  {isOpen ? (
                    <div className="mt-3.5 rounded-xl border border-brand-200/60 bg-white p-4 text-base leading-relaxed text-slate-800 dark:border-brand-900/50 dark:bg-slate-900 dark:text-slate-200">
                      <strong className="font-bold text-brand-600 dark:text-brand-400">
                        정답:
                      </strong>{' '}
                      {qa.answer}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setOpenAnswers((prev) => ({ ...prev, [idx]: true }))
                      }
                      className="mt-2.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
                    >
                      정답 확인하기 →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {onSaveMemo && (
          <Card
            padding="lg"
            className="flex flex-col justify-between space-y-5 sm:p-8"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
                  <StickyNote className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  내 3줄 요약 노트
                </h2>
                {memoSaved && (
                  <Badge variant="success">노트 저장 완료!</Badge>
                )}
              </div>

              <textarea
                rows={5}
                value={memoDraft}
                onChange={(e) => setMemoDraft(e.target.value)}
                placeholder="오늘 배운 핵심을 1~3줄로 가볍게 적어보세요..."
                className="w-full rounded-xl border border-slate-200 bg-white p-4 text-base leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              {item.status !== 'DONE' && onStatusChange && (
                <Button
                  variant="outline"
                  size="md"
                  leftIcon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                  onClick={() => {
                    handleSaveNote();
                    onStatusChange(item.id, 'DONE');
                  }}
                >
                  저장 후 완료 체크
                </Button>
              )}
              <Button
                variant="primary"
                size="md"
                leftIcon={<Save className="h-4 w-4" />}
                onClick={handleSaveNote}
              >
                노트 저장
              </Button>
            </div>
          </Card>
        )}
      </div>
    </article>
  );
};
