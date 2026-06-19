import styles from './Loader.module.css';

export type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  size?: LoaderSize;
  label?: string;
}

export function Loader({ size = 'md', label = 'Loading…' }: LoaderProps) {
  return (
    <span
      className={[styles.spinner, styles[size]].join(' ')}
      role="status"
      aria-label={label}
    />
  );
}
