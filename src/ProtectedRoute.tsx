
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  // Premium Loading State
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Premium Spinner */}
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200" />
            <div className="absolute top-0 left-0 h-12 w-12 animate-spin rounded-full border-4 border-transparent border-t-indigo-600" />
          </div>
          <p className="text-sm font-medium text-slate-500 tracking-wide animate-pulse">
            Loading your library...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if no user is found
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}