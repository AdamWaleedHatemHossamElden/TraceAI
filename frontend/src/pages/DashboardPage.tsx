import styles from './DashboardPage.module.css';
import { AppLayout } from '../components/layout/AppLayout';
import { SystemHealth } from '../components/health/SystemHealth';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className={styles.page}>
        {/* ─── Welcome header ─────────────────────── */}
        <div className={styles.welcome}>
          <div>
            <h1 className={styles.pageTitle}>
              Welcome back{user?.name ? `, ${user.name}` : ''}
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
              Create and manage verification projects. Available in Phase 2.
            </p>
          </div>
          <div className={styles.placeholder}>
            <p className={styles.placeholderIcon}>◈</p>
            <p className={styles.placeholderTitle}>Analyses</p>
            <p className={styles.placeholderBody}>
              Submit AI responses and view extracted claims. Available in Phase 2.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
