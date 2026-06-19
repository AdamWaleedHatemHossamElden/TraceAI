import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className={styles.root}>
      <div className={styles.card}>
        {/* ─── Logo ───────────────────── */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>⬡</span>
          <span className={styles.logoText}>TraceAI</span>
        </Link>

        {/* ─── Heading ────────────────── */}
        <div className={styles.heading}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {/* ─── Form content ───────────── */}
        <div className={styles.body}>{children}</div>

        {/* ─── Footer link ────────────── */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
