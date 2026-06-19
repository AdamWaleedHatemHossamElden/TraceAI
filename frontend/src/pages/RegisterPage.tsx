import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';
import { AuthLayout } from '../components/layout/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../hooks/useAuth';
import { parseApiError } from '../utils/errorUtils';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = 'Full name is required.';
    else if (fullName.trim().length < 2)
      errors.fullName = 'Full name must be at least 2 characters.';
    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 8)
      errors.password = 'Password must be at least 8 characters.';
    if (password !== confirm) errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validate()) return;

    try {
      await register(fullName, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(parseApiError(err));
    }
  }

  return (
    <AuthLayout
      title="Create an account"
      subtitle="Start verifying AI answers with evidence today."
      footer={
        <p>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {error && (
          <Alert variant="error" message={error} onClose={() => setError('')} />
        )}

        <Input
          label="Full name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={fieldErrors.fullName}
          autoComplete="name"
          placeholder="Adam Hatem"
          required
        />

        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
          placeholder="adam@example.com"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          hint="Minimum 8 characters."
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />

        <Input
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={fieldErrors.confirm}
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />

        <Button
          type="submit"
          fullWidth
          isLoading={isLoading}
          className={styles.submitBtn}
        >
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
