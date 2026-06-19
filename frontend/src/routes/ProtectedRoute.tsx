import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Loader } from '../components/ui/Loader';
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialising } = useAuth();
  const location = useLocation();

  // Block any redirect until the startup GET /auth/me check has completed.
  // Without this guard, a page refresh would always redirect to /login before
  // the session has a chance to be restored from sessionStorage.
  if (isInitialising) {
    return (
      <div className={styles.initScreen}>
        <Loader size="lg" label="Restoring session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Preserve the attempted path so LoginPage can redirect back after sign-in.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
