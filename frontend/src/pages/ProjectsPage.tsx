import { useState, useEffect, useCallback, type FormEvent, useId } from 'react';
import styles from './ProjectsPage.module.css';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import * as projectApi from '../api/projectApi';
import type { Project } from '../api/projectApi';
import { parseApiError, parseFieldErrors } from '../utils/errorUtils';

// ─── Textarea ────────────────────────────────────────────────────────────────
// Inline because no Textarea component exists yet; matches Input styling.

interface TextareaProps {
  label: string;
  id?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
}

function Textarea({ label, id: externalId, value, onChange, error, hint, placeholder, rows = 4 }: TextareaProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
      <textarea
        id={id}
        className={[styles.textarea, error ? styles.textareaError : ''].filter(Boolean).join(' ')}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? 'true' : undefined}
      />
      {error && <p id={`${id}-error`} className={styles.fieldError} role="alert">{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ─── Project form state ───────────────────────────────────────────────────────

interface ProjectFormState {
  name: string;
  description: string;
}

const EMPTY_FORM: ProjectFormState = { name: '', description: '' };

function validateForm(form: ProjectFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  const trimmed = form.name.trim();
  if (!trimmed) errors.name = 'Project name is required.';
  else if (trimmed.length > 255) errors.name = 'Project name must be 255 characters or fewer.';
  return errors;
}

// ─── Create modal ─────────────────────────────────────────────────────────────

interface CreateModalProps {
  onClose: () => void;
  onCreated: (project: Project) => void;
}

function CreateModal({ onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const project = await projectApi.createProject({
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      onCreated(project);
    } catch (err) {
      const fe = parseFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      else setApiError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Create project"
      footer={
        <div className={styles.modalFooter}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            form="create-project-form"
            type="submit"
            isLoading={isSubmitting}
          >
            Create project
          </Button>
        </div>
      }
    >
      <form id="create-project-form" onSubmit={handleSubmit} className={styles.modalForm} noValidate>
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
        )}
        <Input
          label="Project name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={fieldErrors.name}
          placeholder="e.g. Climate FAQ verification"
          required
          autoFocus
        />
        <Textarea
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          error={fieldErrors.description}
          placeholder="Briefly describe what this project verifies…"
        />
      </form>
    </Modal>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  project: Project;
  onClose: () => void;
  onUpdated: (project: Project) => void;
}

function EditModal({ project, onClose, onUpdated }: EditModalProps) {
  const [form, setForm] = useState<ProjectFormState>({
    name: project.name,
    description: project.description ?? '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const updated = await projectApi.updateProject(project.id, {
        name: form.name.trim(),
        description: form.description.trim() || null,
      });
      onUpdated(updated);
    } catch (err) {
      const fe = parseFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      else setApiError(parseApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Edit project"
      footer={
        <div className={styles.modalFooter}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            form="edit-project-form"
            type="submit"
            isLoading={isSubmitting}
          >
            Save changes
          </Button>
        </div>
      }
    >
      <form id="edit-project-form" onSubmit={handleSubmit} className={styles.modalForm} noValidate>
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
        )}
        <Input
          label="Project name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={fieldErrors.name}
          required
          autoFocus
        />
        <Textarea
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          error={fieldErrors.description}
          placeholder="Briefly describe what this project verifies…"
        />
      </form>
    </Modal>
  );
}

// ─── Project card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDeleteClick: (project: Project) => void;
}

function ProjectCard({ project, onEdit, onDeleteClick }: ProjectCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <h2 className={styles.cardTitle}>{project.name}</h2>
        <p className={styles.cardDescription}>
          {project.description ?? <span className={styles.noDescription}>No description</span>}
        </p>
        <p className={styles.cardMeta}>Updated {formatDate(project.updatedAt)}</p>
      </div>
      <div className={styles.cardActions}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(project)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDeleteClick(project)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Project | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const list = await projectApi.getProjects();
      setProjects(list);
    } catch (err) {
      setLoadError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function handleCreated(project: Project) {
    setProjects((prev) => [project, ...prev]);
    setShowCreate(false);
  }

  function handleUpdated(project: Project) {
    setProjects((prev) => [project, ...prev.filter((p) => p.id !== project.id)]);
    setEditingProject(null);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!confirmTarget) return;
    await projectApi.deleteProject(confirmTarget.id);
    // Only reached on success — remove from list
    setProjects((prev) => prev.filter((p) => p.id !== confirmTarget.id));
    // ConfirmDialog calls onCancel (setConfirmTarget(null)) after this resolves
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Projects</h1>
            <p className={styles.pageSubtitle}>
              Organise your AI-response verification work into projects.
              Each project groups related analyses and their evidence trails.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreate(true)}
            disabled={isLoading}
          >
            Create project
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className={styles.centred}>
            <Loader size="lg" label="Loading projects…" />
          </div>
        )}

        {/* Load error */}
        {!isLoading && loadError && (
          <div className={styles.centred}>
            <div className={styles.errorState}>
              <p className={styles.errorTitle}>Failed to load projects</p>
              <p className={styles.errorBody}>{loadError}</p>
              <Button variant="secondary" onClick={() => void load()}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !loadError && projects.length === 0 && (
          <div className={styles.centred}>
            <div className={styles.emptyState}>
              <p className={styles.emptyIcon}>⬢</p>
              <p className={styles.emptyTitle}>No projects yet</p>
              <p className={styles.emptyBody}>
                Create your first project to start organising your AI-response
                verification work.
              </p>
              <Button variant="primary" onClick={() => setShowCreate(true)}>
                Create project
              </Button>
            </div>
          </div>
        )}

        {/* Project grid */}
        {!isLoading && !loadError && projects.length > 0 && (
          <div className={styles.grid}>
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={setEditingProject}
                onDeleteClick={setConfirmTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Edit modal */}
      {editingProject && (
        <EditModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={confirmTarget !== null}
        title="Delete project?"
        subjectName={confirmTarget?.name ?? ''}
        description="This will permanently delete the project and cannot be undone."
        confirmLabel="Delete project"
        loadingLabel="Deleting…"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
