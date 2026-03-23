'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const AdminGuard = ({ children }) => {
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated || !isAdmin) {
      router.replace('/login');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading || !isAuthenticated || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-ink">Checking admin access...</div>;
  }

  return children;
};

export default AdminGuard;
