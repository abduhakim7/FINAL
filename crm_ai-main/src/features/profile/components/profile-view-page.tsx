'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-context';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { IconPencil } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function ProfileViewPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return null;
  }

  return (
    <div className='flex w-full flex-col space-y-4 p-4'>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-start justify-between'>
            <div className='flex items-center space-x-4'>
              <UserAvatarProfile user={user} className='h-20 w-20' />
              <div>
                <h2 className='text-2xl font-bold'>
                  {user.firstName} {user.lastName}
                </h2>
                <p className='text-muted-foreground'>{user.email}</p>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/dashboard/profile/edit')}
            >
              <IconPencil className='mr-2 h-4 w-4' />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h3 className='font-medium'>Email</h3>
            <p className='text-muted-foreground'>{user.email}</p>
          </div>
          <Separator />
          <div>
            <h3 className='font-medium'>Name</h3>
            <p className='text-muted-foreground'>
              {user.firstName} {user.lastName}
            </p>
          </div>
          {user.imageUrl && (
            <>
              <Separator />
              <div>
                <h3 className='font-medium'>Profile Picture</h3>
                <p className='text-muted-foreground'>
                  Using custom profile picture
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
