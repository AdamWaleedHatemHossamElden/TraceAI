import styles from './HealthCard.module.css';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Loader } from '../ui/Loader';
import type { ServiceStatus } from '../../types/api';

interface HealthCardProps {
  title: string;
  subtitle: string;
  icon: string;
  status: ServiceStatus;
  timestamp?: string;
  errorMessage?: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

function formatTimestamp(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return ts;
  }
}

export function HealthCard({
  title,
  subtitle,
  icon,
  status,
  timestamp,
  errorMessage,
  onRefresh,
  isRefreshing,
}: HealthCardProps) {
  return (
    <div className={[styles.card, styles[status]].join(' ')}>
      {/* ─── Header ─────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <span className={styles.icon} aria-hidden="true">{icon}</span>
        </div>
        <div className={styles.meta}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      {/* ─── Status ─────────────────────────────────── */}
      <div className={styles.statusRow}>
        {status === 'loading' ? (
          <div className={styles.loadingState}>
            <Loader size="sm" />
            <span className={styles.loadingText}>Checking…</span>
          </div>
        ) : (
          <Badge
            variant={status === 'online' ? 'success' : 'error'}
            dot
          >
            {status === 'online' ? 'Online' : 'Offline'}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          isLoading={isRefreshing && status === 'loading'}
          disabled={isRefreshing}
          aria-label={`Refresh ${title} health check`}
          className={styles.refreshBtn}
        >
          ↻
        </Button>
      </div>

      {/* ─── Details ────────────────────────────────── */}
      {status === 'online' && timestamp && (
        <p className={styles.timestamp}>
          Last checked at {formatTimestamp(timestamp)}
        </p>
      )}
      {status === 'offline' && errorMessage && (
        <p className={styles.errorMessage}>{errorMessage}</p>
      )}
    </div>
  );
}
