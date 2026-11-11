import React, { useState } from 'react';
import { Mail, User, ShieldCheck, LogOut, Sparkles } from 'lucide-react';
import { Button, Input, Modal, Badge } from '@/components/common';
import type { StorageMode, UserProfile } from '@/types';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  storageMode: StorageMode;
  onLogin: (email: string, nickname?: string) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  user,
  storageMode,
  onLogin,
  onLogout,
}) => {
  const [email, setEmail] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('유효한 이메일 주소를 입력해 주세요.');
      return;
    }
    setError('');
    onLogin(trimmedEmail, nickname);
    setEmail('');
    setNickname('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? '내 학습 프로필 및 동기화 상태' : '3초 간편 계정 연동'}
      description={
        user
          ? '현재 계정에 모든 로드맵과 학습 기록이 귀속되어 안전하게 관리되고 있습니다.'
          : '비로그인 게스트 상태에서 생성한 로드맵이 로그인 즉시 내 계정으로 자동 귀속됩니다.'
      }
    >
      {user ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {user.nickname} 님
                </p>
                <Badge variant="success">로그인됨</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<LogOut className="h-4 w-4" />}
              onClick={() => {
                onLogout();
                onClose();
              }}
            >
              게스트 전환
            </Button>
          </div>

          <div className="flex items-start gap-3 rounded-xl bg-brand-50/70 p-3.5 text-xs text-brand-900 dark:bg-brand-950/50 dark:text-brand-200">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
            <div>
              <p className="font-semibold">
                스토리지 엔진: {storageMode === 'SUPABASE' ? 'Supabase Cloud' : 'LocalStorage Hybrid'}
              </p>
              <p className="mt-0.5 opacity-90">
                작성한 모든 체크리스트 진행 상태와 메모가 데이터 손실 없이 자동 보존됩니다.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일 주소"
            type="email"
            placeholder="learner@learnpulse.ai"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
            leftAddon={<Mail className="h-4 w-4" />}
          />

          <Input
            label="학습 닉네임 (선택)"
            placeholder="예: 열정적인 개발자"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            leftAddon={<User className="h-4 w-4" />}
          />

          <div className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            <span>
              게스트 모드에서 이미 생성한 로드맵이 있다면 로그인과 동시에 손실 없이 계정에 귀속됩니다.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              나중에 하기
            </Button>
            <Button type="submit" variant="primary" size="sm">
              계정 연동 완료하기
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
