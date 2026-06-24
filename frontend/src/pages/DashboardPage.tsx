import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css';
import { AppLayout } from '../components/layout/AppLayout';
import { SystemHealth } from '../components/health/SystemHealth';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className={styles.page}>
        {/* ─── Welcome header ─────────────────────── */}
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.pageTitle}>
              Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
            </h1>
            <p className={styles.pageSubtitle}>
              TraceAI Phase 1 — Foundation. The system health monitor below
              calls the live backend health endpoints.
            </p>
          </div>
        </div>

        {/* ─── System health ──────────────────────── */}
        <SystemHealth />

        {/* ─── Placeholder sections ───────────────── */}
        <div className={styles.placeholderGrid}>
          <div className={styles.placeholder}>
            <p className={styles.placeholderIcon}>⬢</p>
            <p className={styles.placeholderTitle}>Projects</p>
            <p className={styles.placeholderBody}>
              Create and manage verification projects that organise your
              AI-response analyses.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/projects')}
            >
              Go to Projects
            </Button>
          </div>
          <div className={styles.placeholder}>
            <p className={styles.placeholderIcon}>◈</p>
            <p className={styles.placeholderTitle}>Analyses</p>
            <p className={styles.placeholderBody}>
              Submit AI responses for claim-level verification and track
              their evidence review status.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/analyses')}
            >
              Go to Analyses
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
