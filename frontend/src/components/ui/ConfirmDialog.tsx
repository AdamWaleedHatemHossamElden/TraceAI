import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './ConfirmDialog.module.css';
import { Button } from './Button';

interface ConfirmDialogProps {
  /** Whether the dialog is currently open */
  isOpen: boolean;
  /** Dialog heading */
  title: string;
  /** The name of the item being deleted — displayed in a highlighted block */
  subjectName: string;
  /** Warning text shown below the subject name */
  description: string;
  /** Label for the confirm button (default: "Delete") */
  confirmLabel?: string;
  /** Label shown on the confirm button while the request is in flight */
  loadingLabel?: string;
  /** Called when the user cancels or the dialog is dismissed */
  onCancel: () => void;
  /**
   * Called when the user confirms.  Should perform the async work and either
   * resolve (success) or reject with an Error (failure).  On success the
   * dialog calls `onCancel` to close itself.  On failure it keeps itself
   * open and shows the error message.
   */
  onConfirm: () => Promise<void>;
}

export function ConfirmDialog({
  isOpen,
  title,
  subjectName,
  description,
  confirmLabel = 'Delete',
  loadingLabel = 'Deleting…',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Close on ESC — but not while the deletion request is in flight
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, isSubmitting, onCancel]);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Reset internal state each time the dialog opens
  useEffect(() => {
    if (isOpen) {
      setIsSubmitting(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleConfirm() {
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm();
      // onConfirm resolved — success; close the dialog
      onCancel();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return createPortal(
    <div
      className={styles.backdrop}
      onClick={() => { if (!isSubmitting) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
          <button
            className={styles.closeBtn}
            onClick={onCancel}
            disabled={isSubmitting}
            aria-label="Close dialog"
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          <div className={styles.subject} aria-label={`Project: ${subjectName}`}>
            {subjectName}
          </div>
          <p className={styles.description}>{description}</p>

          {error && (
            <div className={styles.errorBanner} role="alert">
              <span className={styles.errorIcon} aria-hidden="true">✕</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? loadingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
