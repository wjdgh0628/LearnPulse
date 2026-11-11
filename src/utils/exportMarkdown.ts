import {
  calculateRoadmapStats,
  formatDateShort,
  formatLevelLabel,
} from '@/utils/formatters';
import type { Roadmap } from '@/types';

export function convertRoadmapToMarkdown(roadmap: Roadmap): string {
  const stats = calculateRoadmapStats(roadmap);
  const lines: string[] = [];

  lines.push(`# ${roadmap.title}`);
  lines.push('');
  lines.push(`> ${roadmap.summary}`);
  lines.push('');
  lines.push('## 학습 개요');
  lines.push(`- **주제:** ${roadmap.topic}`);
  lines.push(`- **수준:** ${formatLevelLabel(roadmap.level)} (${roadmap.level})`);
  lines.push(`- **목표 기간:** ${roadmap.targetDuration}`);
  lines.push(
    `- **진척도:** ${stats.percentage}% (${stats.doneItems}/${stats.totalItems} 완료 · 진행 중 ${stats.inProgressItems}개)`
  );
  lines.push(`- **생성일:** ${formatDateShort(roadmap.createdAt)}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const chapter of roadmap.chapters) {
    const chDone = chapter.items.filter((i) => i.status === 'DONE').length;
    lines.push(
      `## ${chapter.title} (${chDone}/${chapter.items.length} 완료)`
    );
    if (chapter.description) {
      lines.push(`${chapter.description}`);
    }
    lines.push('');

    for (const item of chapter.items) {
      const checkbox = item.status === 'DONE' ? '[x]' : '[ ]';
      const statusTag =
        item.status === 'IN_PROGRESS' ? ' *(진행 중)*' : '';
      const timeTag = item.estimatedTime ? ` \`⏱ ${item.estimatedTime}\`` : '';
      lines.push(`- ${checkbox} **${item.title}**${timeTag}${statusTag}`);

      if (item.description) {
        lines.push(`  - 💡 개념 설명: ${item.description}`);
      }
      if (item.keywords && item.keywords.length > 0) {
        lines.push(
          `  - 🏷️ 핵심 키워드: ${item.keywords.map((k) => `\`#${k}\``).join(' ')}`
        );
      }
      if (item.subTasks && item.subTasks.length > 0) {
        lines.push(`  - 📋 세부 학습 가이드:`);
        for (const sub of item.subTasks) {
          lines.push(`    - ${sub}`);
        }
      }
      if (item.memo && item.memo.trim().length > 0) {
        lines.push(`  - 📝 내 메모: ${item.memo.trim()}`);
      }
      if (item.referenceLink && item.referenceLink.trim().length > 0) {
        lines.push(`  - 🔗 참고 자료: ${item.referenceLink.trim()}`);
      }
    }

    lines.push('');
  }

  lines.push('---');
  lines.push('*Exported from LearnPulse (AI 학습 로드맵 & 진행 관리 서비스)*');

  return lines.join('\n');
}

export async function copyRoadmapMarkdownToClipboard(
  roadmap: Roadmap
): Promise<boolean> {
  const markdown = convertRoadmapToMarkdown(roadmap);
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(markdown);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function downloadRoadmapMarkdownFile(roadmap: Roadmap): void {
  const markdown = convertRoadmapToMarkdown(roadmap);
  const safeFileName = roadmap.title
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${safeFileName || 'learnpulse-roadmap'}.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
