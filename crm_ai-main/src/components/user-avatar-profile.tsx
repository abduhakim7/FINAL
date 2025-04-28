import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

interface UserAvatarProfileProps {
  user: User | null;
  showInfo?: boolean;
  className?: string;
}

export function UserAvatarProfile({
  user,
  showInfo = false,
  className
}: UserAvatarProfileProps) {
  if (!user) {
    return null;
  }

  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.email
        ? user.email.split('@')[0]
        : 'Anonymous User';

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email
        ? user.email.slice(0, 2).toUpperCase()
        : 'AU';

  return (
    <div className='flex items-center gap-2'>
      <Avatar className={cn('h-8 w-8', className)}>
        <AvatarImage
          src={
            user.imageUrl ||
            (user.email ? `https://avatar.vercel.sh/${user.email}` : undefined)
          }
          alt={displayName}
        />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      {showInfo && (
        <div className='flex flex-col'>
          <span className='text-sm font-medium'>{displayName}</span>
          <span className='text-muted-foreground text-xs'>
            {user.email || 'No email provided'}
          </span>
        </div>
      )}
    </div>
  );
}
