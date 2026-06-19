import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({
  title,
  description,
  footer,
  children,
  className = '',
  noPadding = false,
}: CardProps) {
  return (
    <div className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || description) && (
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      )}
      <div className={[styles.body, noPadding ? styles.noPadding : ''].filter(Boolean).join(' ')}>
        {children}
      </div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
