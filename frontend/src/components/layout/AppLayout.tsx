import type { ReactNode } from 'react';
import styles from './AppLayout.module.css';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
}

export function AppLayout({ children, hideSidebar = false }: AppLayoutProps) {
  return (
    <div className={styles.root}>
      <Navbar />
      <div className={styles.body}>
        {!hideSidebar && <Sidebar />}
        <main className={styles.main} id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
