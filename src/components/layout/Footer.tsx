import React from 'react';
import { Container } from '@/components/layout/Container';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 dark:border-slate-800 dark:bg-slate-950">
      <Container className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-row">
        <p>© {new Date().getFullYear()} LearnPulse. AI-Powered Learning Roadmap & Progress Tracker.</p>
        <p className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          Zero-Config LocalStorage & Cloud Hybrid Ready
        </p>
      </Container>
    </footer>
  );
};
