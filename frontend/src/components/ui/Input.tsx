import { type InputHTMLAttributes, type ReactNode, useId } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  rightElement?: ReactNode;
}

export function Input({
  label,
  error,
  hint,
  rightElement,
  className = '',
  id: externalId,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className={styles.wrapper}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.inputRow}>
        <input
          id={id}
          className={[
            styles.input,
            error ? styles.inputError : '',
            rightElement ? styles.inputWithRight : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={error ? 'true' : undefined}
          {...rest}
        />
        {rightElement && (
          <div className={styles.rightElement}>{rightElement}</div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
