import type { ReactNode } from 'react';
import styles from './Alert.module.css';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  message: string;
  onClose?: () => void;
  children?: ReactNode;
}

const ICONS: Record<AlertVariant, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export function Alert({ variant, message, onClose, children }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[variant]].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.icon} aria-hidden="true">
        {ICONS[variant]}
      </span>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
        {children && <div className={styles.extra}>{children}</div>}
      </div>
      {onClose && (
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Dismiss alert"
          type="button"
        >
          ✕
        </button>
      )}
    </div>
  );
}
