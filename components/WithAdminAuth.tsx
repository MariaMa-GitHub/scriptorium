import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { CircularProgress, Box, Alert } from '@mui/material';

export function withAdminAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AdminProtectedRoute(props: P) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && (!user || user.role !== 'ADMIN')) {
        router.push('/');
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!user || user.role !== 'ADMIN') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Alert severity="error">
            You do not have permission to access this page.
          </Alert>
        </Box>
      );
    }

    return <Component {...props} />;
  };
}