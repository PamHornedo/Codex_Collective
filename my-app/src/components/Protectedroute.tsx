import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store';

interface ProtectedRouteProps {
  children: ReactNode;
}

// ✅ Define selectors OUTSIDE component to prevent infinite loops
const selectUser = (state: ReturnType<typeof useUserStore.getState>) => state.user;
const selectIsLoading = (state: ReturnType<typeof useUserStore.getState>) => state.isLoading;

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const user = useUserStore(selectUser);
  const isLoading = useUserStore(selectIsLoading);
  const isAuthenticated = !!user;

  if (isLoading) {
    // Show loading state
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
