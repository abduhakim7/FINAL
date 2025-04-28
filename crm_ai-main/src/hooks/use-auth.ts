import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      // Replace this with your actual API call to get the user
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signOut = async () => {
    try {
      // Replace this with your actual sign out API call
      const response = await fetch('/api/auth/signout', {
        method: 'POST'
      });

      if (response.ok) {
        setUser(null);
        router.push('/auth/sign-in');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    isLoading,
    signOut
  };
}
