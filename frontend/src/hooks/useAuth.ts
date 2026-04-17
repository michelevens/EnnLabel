'use client';

import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireAuth() {
  const { user, isLoading, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user && !isLoading) {
      fetchUser();
    }
  }, [user, isLoading, fetchUser]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  return { user, isLoading };
}

export function useRequireRole(...roles: string[]) {
  const { user, isLoading } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !roles.includes(user.role.name)) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router, roles]);

  return { user, isLoading, authorized: user ? roles.includes(user.role.name) : false };
}

export function useIsAdmin() {
  const { user } = useAuthStore();
  return user?.role.name === 'admin';
}

export function useIsReviewer() {
  const { user } = useAuthStore();
  return user?.role.name === 'clinician_reviewer' ||
    user?.role.name === 'qa_reviewer' ||
    user?.role.name === 'admin';
}
