import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬡' },
  { to: '/projects', label: 'Projects', icon: '⬢' },
  { to: '/analyses', label: 'Analyses', icon: '◈' },
  // Reviews will be enabled in a later backend phase
  { to: '/reviews', label: 'Reviews', icon: '◉', disabled: true },
];

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav} aria-label="Application navigation">
        <p className={styles.section}>Navigation</p>
        <ul className={styles.list}>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              {item.disabled ? (
                <span className={[styles.navItem, styles.disabled].join(' ')}>
                  <span className={styles.icon}>{item.icon}</span>
                  <span>{item.label}</span>
                  <span className={styles.comingSoon}>Soon</span>
                </span>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [styles.navItem, isActive ? styles.active : '']
                      .filter(Boolean)
                      .join(' ')
                  }
                >
                  <span className={styles.icon}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
