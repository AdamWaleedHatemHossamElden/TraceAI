import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

interface NavbarProps {
  /** Pass true on the landing page to show public CTAs instead of the app nav */
  isPublic?: boolean;
}

export function Navbar({ isPublic = false }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={styles.navbar}>
      <div className={[styles.inner, 'container'].join(' ')}>
        {/* ─── Logo ──────────────────────────────────── */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoMark}>⬡</span>
          <span className={styles.logoText}>TraceAI</span>
        </Link>

        {/* ─── Desktop navigation ─────────────────────── */}
        <nav className={styles.desktopNav} aria-label="Main navigation">
          {isPublic ? (
            <>
              <a href="#features" className={styles.navLink}>Features</a>
              <a href="#how-it-works" className={styles.navLink}>How It Works</a>
              <a href="#technology" className={styles.navLink}>Technology</a>
            </>
          ) : (
            isAuthenticated && (
              <>
                <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
                <Link to="/projects" className={styles.navLink}>Projects</Link>
              </>
            )
          )}
        </nav>

        {/* ─── Desktop CTA ────────────────────────────── */}
        <div className={styles.desktopActions}>
          {isAuthenticated ? (
            <>
              <span className={styles.userEmail}>{user?.fullName}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </div>

        {/* ─── Mobile menu toggle ─────────────────────── */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span className={[styles.bar, menuOpen ? styles.barTop : ''].join(' ')} />
          <span className={[styles.bar, menuOpen ? styles.barMid : ''].join(' ')} />
          <span className={[styles.bar, menuOpen ? styles.barBot : ''].join(' ')} />
        </button>
      </div>

      {/* ─── Mobile drawer ──────────────────────────────── */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {isPublic ? (
            <>
              <a href="#features" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>How It Works</a>
              <a href="#technology" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Technology</a>
            </>
          ) : (
            isAuthenticated && (
              <>
                <Link to="/dashboard" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/projects" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Projects
                </Link>
              </>
            )
          )}
          <div className={styles.mobileDivider} />
          {isAuthenticated ? (
            <button className={styles.mobileLink} onClick={handleLogout}>Sign out</button>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link to="/register" className={[styles.mobileLink, styles.mobilePrimary].join(' ')} onClick={() => setMenuOpen(false)}>
                Get started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
