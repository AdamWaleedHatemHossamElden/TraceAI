import { useState, useCallback } from 'react';
import styles from './SystemHealth.module.css';
import { HealthCard } from './HealthCard';
import { Button } from '../ui/Button';
import {
  getBackendHealth,
  getDatabaseHealth,
  getAiServiceHealth,
} from '../../api/healthApi';
import { parseApiError } from '../../utils/errorUtils';
import type { ServiceHealth } from '../../types/api';

const INITIAL_STATE: ServiceHealth = { status: 'loading', service: '' };

export function SystemHealth() {
  const [backend, setBackend] = useState<ServiceHealth>(INITIAL_STATE);
  const [database, setDatabase] = useState<ServiceHealth>(INITIAL_STATE);
  const [aiService, setAiService] = useState<ServiceHealth>(INITIAL_STATE);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkBackend = useCallback(async () => {
    setBackend((s) => ({ ...s, status: 'loading' }));
    try {
      const res = await getBackendHealth();
      setBackend({ status: 'online', service: res.service, timestamp: res.timestamp });
    } catch (err) {
      setBackend({ status: 'offline', service: 'traceai-backend', message: parseApiError(err) });
    }
  }, []);

  const checkDatabase = useCallback(async () => {
    setDatabase((s) => ({ ...s, status: 'loading' }));
    try {
      const res = await getDatabaseHealth();
      setDatabase({ status: 'online', service: res.service });
    } catch (err) {
      setDatabase({ status: 'offline', service: 'traceai-database', message: parseApiError(err) });
    }
  }, []);

  const checkAiService = useCallback(async () => {
    setAiService((s) => ({ ...s, status: 'loading' }));
    try {
      const res = await getAiServiceHealth();
      setAiService({ status: 'online', service: res.service });
    } catch (err) {
      setAiService({ status: 'offline', service: 'traceai-ai-service', message: parseApiError(err) });
    }
  }, []);

  const checkAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([checkBackend(), checkDatabase(), checkAiService()]);
    setIsRefreshing(false);
  }, [checkBackend, checkDatabase, checkAiService]);

  // Run checks on first render
  useState(() => { void checkAll(); });

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>System Health</h2>
          <p className={styles.subtitle}>
            Live status of the TraceAI backend, database, and AI service.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={checkAll}
          isLoading={isRefreshing}
        >
          Refresh all
        </Button>
      </div>

      <div className={styles.grid}>
        <HealthCard
          title="Backend Service"
          subtitle="Node.js · Express · TypeScript"
          icon="⬡"
          status={backend.status}
          timestamp={backend.timestamp}
          errorMessage={backend.message}
          onRefresh={checkBackend}
          isRefreshing={isRefreshing}
        />
        <HealthCard
          title="MySQL Database"
          subtitle="mysql2 · traceai schema"
          icon="◈"
          status={database.status}
          timestamp={database.timestamp}
          errorMessage={database.message}
          onRefresh={checkDatabase}
          isRefreshing={isRefreshing}
        />
        <HealthCard
          title="AI Service"
          subtitle="Python · FastAPI"
          icon="◉"
          status={aiService.status}
          timestamp={aiService.timestamp}
          errorMessage={aiService.message}
          onRefresh={checkAiService}
          isRefreshing={isRefreshing}
        />
      </div>
    </section>
  );
}
