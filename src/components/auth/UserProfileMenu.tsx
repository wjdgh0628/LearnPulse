import React from 'react';
import { UserCheck, User } from 'lucide-react';
import { Button } from '@/components/common';
import type { UserProfile } from '@/types';

export interface UserProfileMenuProps {
  user: UserProfile | null;
  onOpenModal: () => void;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  user,
  onOpenModal,
}) => {
  return (
    <Button
      variant={user ? 'secondary' : 'outline'}
      size="sm"
      leftIcon={
        user ? (
          <User className="h-4 w-4 text-brand-600 dark:text-brand-400" />
        ) : (
          <UserCheck className="h-4 w-4" />
        )
      }
      onClick={onOpenModal}
    >
      {user ? `${user.nickname} 님` : '게스트 모드'}
    </Button>
  );
};
