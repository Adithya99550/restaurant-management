'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { redirectByRole } from '../lib/auth';

export default function Home() {
  const router = useRouter();
  const { auth, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (auth?.user?.role) {
        router.push(redirectByRole(auth.user.role));
      } else {
        router.push('/login');
      }
    }
  }, [auth, loading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-pulse text-foreground">Loading...</div>
    </div>
  );
}