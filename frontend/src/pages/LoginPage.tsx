import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { parseApiError } from '../utils/errorUtils';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect to original destination after login, or fall back to /dashboard
  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(parseApiError(err));
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your TraceAI account to continue."
      footer={
        <p>
          Don&apos;t have an account?{' '}
          <Link to="/register">Create one free</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <Alert variant="error" message={error} onClose={() => setError('')} />
        )}

        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="adam@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className={styles.submitBtn}
        >
          Sign in
        </Button>
      </form>

      <p className={styles.mockNote}>
        ⚠ Authentication is mocked. Any email and password will work.
      </p>
    </AuthLayout>
  );
}
