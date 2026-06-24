import {
  useState,
  useEffect,
  useCallback,
  useId,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import styles from './AnalysesPage.module.css';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import * as analysisApi from '../api/analysisApi';
import type { AnalysisSummary, AnalysisDetail } from '../api/analysisApi';
import { getProjects } from '../api/projectApi';
import type { Project } from '../api/projectApi';
import type { AnalysisStatus } from '../types/api';
import { parseApiError, parseFieldErrors } from '../utils/errorUtils';

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  AnalysisStatus,
  { variant: BadgeVariant; label: string; dot: boolean }
> = {
  draft:      { variant: 'default',  label: 'Draft',      dot: false },
  queued:     { variant: 'info',     label: 'Queued',     dot: true  },
  processing: { variant: 'warning',  label: 'Processing', dot: true  },
  completed:  { variant: 'success',  label: 'Completed',  dot: false },
  failed:     { variant: 'error',    label: 'Failed',     dot: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max).trimEnd() + '…';
}

// ─── Inline form primitives ───────────────────────────────────────────────────
// These match the existing Input/ProjectsPage textarea styling.

interface TextareaProps {
  label: string;
  id?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  disabled?: boolean;
}

function Textarea({
  label, id: externalId, value, onChange, error, hint,
  placeholder, rows = 5, required, disabled,
}: TextareaProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
      <textarea
        id={id}
        className={[styles.textarea, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? 'true' : undefined}
      />
      {error && <p id={`${id}-error`} className={styles.fieldError} role="alert">{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

interface SelectProps {
  label: string;
  id?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
}

function Select({
  label, id: externalId, value, onChange, error, hint,
  children, required, disabled,
}: SelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={id} className={styles.fieldLabel}>{label}</label>
      <select
        id={id}
        className={[styles.select, error ? styles.inputError : ''].filter(Boolean).join(' ')}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={error ? 'true' : undefined}
      >
        {children}
      </select>
      {error && <p id={`${id}-error`} className={styles.fieldError} role="alert">{error}</p>}
      {!error && hint && <p id={`${id}-hint`} className={styles.fieldHint}>{hint}</p>}
    </div>
  );
}

// ─── Create modal ─────────────────────────────────────────────────────────────

interface CreateFormState {
  projectId: string; // string for select value
  prompt: string;
  aiResponse: string;
  modelName: string;
  topic: string;
}

const EMPTY_CREATE_FORM: CreateFormState = {
  projectId: '',
  prompt: '',
  aiResponse: '',
  modelName: '',
  topic: '',
};

function validateCreate(form: CreateFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.projectId) errors.projectId = 'Please select a project.';
  if (!form.prompt.trim()) errors.prompt = 'Prompt is required.';
  if (!form.aiResponse.trim()) errors.aiResponse = 'AI response is required.';
  return errors;
}

interface CreateModalProps {
  projects: Project[];
  onClose: () => void;
  onCreated: (analysis: AnalysisSummary) => void;
}

function CreateModal({ projects, onClose, onCreated }: CreateModalProps) {
  const [form, setForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function set<K extends keyof CreateFormState>(key: K, val: CreateFormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    const errors = validateCreate(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const analysis = await analysisApi.createAnalysis({
        projectId: Number(form.projectId),
        prompt: form.prompt.trim(),
        aiResponse: form.aiResponse.trim(),
        modelName: form.modelName.trim() || null,
        topic: form.topic.trim() || null,
      });
      onCreated(analysis);
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
      title="Create analysis"
      footer={
        <div className={styles.modalFooter}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            form="create-analysis-form"
            type="submit"
            isLoading={isSubmitting}
          >
            Create analysis
          </Button>
        </div>
      }
    >
      <form
        id="create-analysis-form"
        onSubmit={handleSubmit}
        className={styles.modalForm}
        noValidate
      >
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
        )}

        <Select
          label="Project"
          value={form.projectId}
          onChange={e => set('projectId', e.target.value)}
          error={fieldErrors.projectId}
          required
        >
          <option value="">Select a project…</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </Select>

        <Textarea
          label="Prompt"
          value={form.prompt}
          onChange={e => set('prompt', e.target.value)}
          error={fieldErrors.prompt}
          placeholder="The prompt sent to the AI model…"
          rows={4}
          required
        />

        <Textarea
          label="AI response"
          value={form.aiResponse}
          onChange={e => set('aiResponse', e.target.value)}
          error={fieldErrors.aiResponse}
          placeholder="The AI model's response to verify…"
          rows={5}
          required
        />

        <Input
          label="Model name (optional)"
          type="text"
          value={form.modelName}
          onChange={e => set('modelName', e.target.value)}
          error={fieldErrors.modelName}
          placeholder="e.g. gpt-4o, claude-3-sonnet"
        />

        <Input
          label="Topic (optional)"
          type="text"
          value={form.topic}
          onChange={e => set('topic', e.target.value)}
          error={fieldErrors.topic}
          placeholder="e.g. Climate Science, Medical FAQ"
        />
      </form>
    </Modal>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  summary: AnalysisSummary;
  onClose: () => void;
}

function DetailModal({ summary, onClose }: DetailModalProps) {
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const d = await analysisApi.getAnalysis(summary.id);
        if (!cancelled) setDetail(d);
      } catch (err) {
        if (!cancelled) setError(parseApiError(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [summary.id]);

  const status = STATUS_CONFIG[summary.status];

  return (
    <Modal isOpen onClose={onClose} title="Analysis details">
      {isLoading && (
        <div className={styles.modalCentred}>
          <Loader size="md" label="Loading analysis…" />
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.modalError}>
          <Alert variant="error" message={error} />
        </div>
      )}

      {!isLoading && detail && (
        <div className={styles.detailBody}>
          {/* Status + meta */}
          <div className={styles.detailMeta}>
            <Badge variant={status.variant} dot={status.dot}>{status.label}</Badge>
            <span className={styles.detailMetaText}>
              Project: <strong>{detail.projectName}</strong>
            </span>
            {detail.modelName && (
              <span className={styles.detailMetaText}>
                Model: <strong>{detail.modelName}</strong>
              </span>
            )}
            {detail.topic && (
              <span className={styles.detailMetaText}>
                Topic: <strong>{detail.topic}</strong>
              </span>
            )}
          </div>

          {/* Timestamps */}
          <div className={styles.detailTimestamps}>
            <span>Created {formatDate(detail.createdAt)}</span>
            <span>Updated {formatDate(detail.updatedAt)}</span>
          </div>

          {/* Prompt */}
          <section>
            <h3 className={styles.detailSectionTitle}>Prompt</h3>
            <pre className={styles.detailPre}>{detail.prompt}</pre>
          </section>

          {/* AI Response */}
          <section>
            <h3 className={styles.detailSectionTitle}>AI Response</h3>
            <pre className={styles.detailPre}>{detail.aiResponse}</pre>
          </section>
        </div>
      )}
    </Modal>
  );
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

interface EditFormState {
  prompt: string;
  aiResponse: string;
  modelName: string;
  topic: string;
}

function validateEdit(form: EditFormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.prompt.trim()) errors.prompt = 'Prompt is required.';
  if (!form.aiResponse.trim()) errors.aiResponse = 'AI response is required.';
  return errors;
}

interface EditModalProps {
  summary: AnalysisSummary;
  onClose: () => void;
  onUpdated: (analysis: AnalysisSummary) => void;
}

function EditModal({ summary, onClose, onUpdated }: EditModalProps) {
  // Fetch full detail first (list doesn't include aiResponse)
  const [detail, setDetail] = useState<AnalysisDetail | null>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [form, setForm] = useState<EditFormState>({
    prompt: '',
    aiResponse: '',
    modelName: '',
    topic: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsFetching(true);
      setFetchError('');
      try {
        const d = await analysisApi.getAnalysis(summary.id);
        if (!cancelled) {
          setDetail(d);
          setForm({
            prompt: d.prompt,
            aiResponse: d.aiResponse,
            modelName: d.modelName ?? '',
            topic: d.topic ?? '',
          });
        }
      } catch (err) {
        if (!cancelled) setFetchError(parseApiError(err));
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [summary.id]);

  function set<K extends keyof EditFormState>(key: K, val: EditFormState[K]) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!detail) return;
    setApiError('');
    const errors = validateEdit(form);
    if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      const updated = await analysisApi.updateAnalysis(summary.id, {
        prompt: form.prompt.trim(),
        aiResponse: form.aiResponse.trim(),
        modelName: form.modelName.trim() || null,
        topic: form.topic.trim() || null,
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
      title="Edit analysis"
      footer={
        !isFetching && !fetchError ? (
          <div className={styles.modalFooter}>
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              form="edit-analysis-form"
              type="submit"
              isLoading={isSubmitting}
            >
              Save changes
            </Button>
          </div>
        ) : undefined
      }
    >
      {isFetching && (
        <div className={styles.modalCentred}>
          <Loader size="md" label="Loading analysis…" />
        </div>
      )}

      {!isFetching && fetchError && (
        <div className={styles.modalError}>
          <Alert variant="error" message={fetchError} />
          <div className={styles.modalErrorActions}>
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}

      {!isFetching && !fetchError && detail && (
        <form
          id="edit-analysis-form"
          onSubmit={handleSubmit}
          className={styles.modalForm}
          noValidate
        >
          {apiError && (
            <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
          )}

          {/* Read-only project info */}
          <div className={styles.editReadOnly}>
            <span className={styles.editReadOnlyLabel}>Project</span>
            <span className={styles.editReadOnlyValue}>{detail.projectName}</span>
          </div>

          <Textarea
            label="Prompt"
            value={form.prompt}
            onChange={e => set('prompt', e.target.value)}
            error={fieldErrors.prompt}
            rows={4}
            required
          />

          <Textarea
            label="AI response"
            value={form.aiResponse}
            onChange={e => set('aiResponse', e.target.value)}
            error={fieldErrors.aiResponse}
            rows={5}
            required
          />

          <Input
            label="Model name (optional)"
            type="text"
            value={form.modelName}
            onChange={e => set('modelName', e.target.value)}
            error={fieldErrors.modelName}
            placeholder="e.g. gpt-4o"
          />

          <Input
            label="Topic (optional)"
            type="text"
            value={form.topic}
            onChange={e => set('topic', e.target.value)}
            error={fieldErrors.topic}
            placeholder="e.g. Climate Science"
          />
        </form>
      )}
    </Modal>
  );
}

// ─── Analysis card ────────────────────────────────────────────────────────────

interface AnalysisCardProps {
  analysis: AnalysisSummary;
  onView: (a: AnalysisSummary) => void;
  onEdit: (a: AnalysisSummary) => void;
  onDeleteClick: (a: AnalysisSummary) => void;
}

function AnalysisCard({ analysis, onView, onEdit, onDeleteClick }: AnalysisCardProps) {
  const status = STATUS_CONFIG[analysis.status];

  return (
    <article className={styles.card}>
      {/* Top row: project chip + status badge */}
      <div className={styles.cardTop}>
        <span className={styles.projectChip}>{analysis.projectName}</span>
        <Badge variant={status.variant} dot={status.dot}>{status.label}</Badge>
      </div>

      {/* Prompt preview */}
      <p className={styles.cardPrompt}>{truncate(analysis.prompt, 160)}</p>

      {/* Optional meta chips */}
      {(analysis.modelName || analysis.topic) && (
        <div className={styles.cardChips}>
          {analysis.modelName && (
            <span className={styles.chip}>
              <span className={styles.chipLabel}>Model</span> {analysis.modelName}
            </span>
          )}
          {analysis.topic && (
            <span className={styles.chip}>
              <span className={styles.chipLabel}>Topic</span> {analysis.topic}
            </span>
          )}
        </div>
      )}

      {/* Footer: date + actions */}
      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>Updated {formatDate(analysis.updatedAt)}</span>
        <div className={styles.cardActions}>
          <Button variant="ghost" size="sm" onClick={() => onView(analysis)}>
            View
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onEdit(analysis)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDeleteClick(analysis)}>
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AnalysesPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingAnalyses, setIsLoadingAnalyses] = useState(true);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [filterProjectId, setFilterProjectId] = useState<number | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [viewTarget, setViewTarget] = useState<AnalysisSummary | null>(null);
  const [editTarget, setEditTarget] = useState<AnalysisSummary | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AnalysisSummary | null>(null);

  // Load projects once for filter and create form
  useEffect(() => {
    let cancelled = false;
    async function loadProjects() {
      setIsLoadingProjects(true);
      try {
        const list = await getProjects();
        if (!cancelled) setProjects(list);
      } catch {
        // Non-fatal: filter and create will just show empty options
      } finally {
        if (!cancelled) setIsLoadingProjects(false);
      }
    }
    void loadProjects();
    return () => { cancelled = true; };
  }, []);

  // Load analyses whenever filter changes
  const loadAnalyses = useCallback(async () => {
    setIsLoadingAnalyses(true);
    setLoadError('');
    try {
      const list = await analysisApi.getAnalyses(
        filterProjectId !== null ? filterProjectId : undefined,
      );
      setAnalyses(list);
    } catch (err) {
      setLoadError(parseApiError(err));
    } finally {
      setIsLoadingAnalyses(false);
    }
  }, [filterProjectId]);

  useEffect(() => { void loadAnalyses(); }, [loadAnalyses]);

  function handleCreated(analysis: AnalysisSummary) {
    // Only show in list if it matches current filter
    if (filterProjectId === null || filterProjectId === analysis.projectId) {
      setAnalyses(prev => [analysis, ...prev]);
    }
    setShowCreate(false);
  }

  function handleUpdated(analysis: AnalysisSummary) {
    setAnalyses(prev => prev.map(a => (a.id === analysis.id ? analysis : a)));
    setEditTarget(null);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!confirmTarget) return;
    try {
      await analysisApi.deleteAnalysis(confirmTarget.id);
      setAnalyses(prev => prev.filter(a => a.id !== confirmTarget.id));
    } catch (err) {
      // Rethrow as plain Error so ConfirmDialog can display the message
      throw new Error(parseApiError(err));
    }
  }

  const isLoadingAll = isLoadingAnalyses || isLoadingProjects;

  return (
    <AppLayout>
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Analyses</h1>
            <p className={styles.pageSubtitle}>
              Submit AI responses for claim-level verification and track
              their evidence review status.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreate(true)}
            disabled={isLoadingProjects || projects.length === 0}
            title={
              projects.length === 0 && !isLoadingProjects
                ? 'Create a project first before adding analyses'
                : undefined
            }
          >
            Create analysis
          </Button>
        </div>

        {/* Project filter */}
        {!isLoadingProjects && projects.length > 0 && (
          <div className={styles.filterBar}>
            <label htmlFor="project-filter" className={styles.filterLabel}>
              Filter by project
            </label>
            <select
              id="project-filter"
              className={styles.filterSelect}
              value={filterProjectId ?? ''}
              onChange={e => {
                const val = e.target.value;
                setFilterProjectId(val === '' ? null : Number(val));
              }}
            >
              <option value="">All projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Loading */}
        {isLoadingAnalyses && (
          <div className={styles.centred}>
            <Loader size="lg" label="Loading analyses…" />
          </div>
        )}

        {/* Load error */}
        {!isLoadingAnalyses && loadError && (
          <div className={styles.centred}>
            <div className={styles.stateBox}>
              <p className={styles.stateTitle} style={{ color: 'var(--color-danger)' }}>
                Failed to load analyses
              </p>
              <p className={styles.stateBody}>{loadError}</p>
              <Button variant="secondary" onClick={() => void loadAnalyses()}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoadingAll && !loadError && analyses.length === 0 && (
          <div className={styles.centred}>
            <div className={styles.stateBox}>
              <p className={styles.stateIcon}>◈</p>
              <p className={styles.stateTitle}>No analyses yet</p>
              <p className={styles.stateBody}>
                {projects.length === 0
                  ? 'Create a project first, then submit an AI response to start verifying.'
                  : filterProjectId !== null
                  ? 'No analyses found for this project.'
                  : 'Submit your first AI response to begin the verification process.'}
              </p>
              {projects.length > 0 && (
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                  Create analysis
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Analysis list */}
        {!isLoadingAnalyses && !loadError && analyses.length > 0 && (
          <div className={styles.list}>
            {analyses.map(analysis => (
              <AnalysisCard
                key={analysis.id}
                analysis={analysis}
                onView={setViewTarget}
                onEdit={setEditTarget}
                onDeleteClick={setConfirmTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          projects={projects}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Detail modal */}
      {viewTarget && (
        <DetailModal
          summary={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <EditModal
          summary={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={handleUpdated}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={confirmTarget !== null}
        title="Delete analysis?"
        subjectName={
          confirmTarget
            ? truncate(confirmTarget.prompt, 80)
            : ''
        }
        description="This will permanently delete the analysis and cannot be undone."
        confirmLabel="Delete analysis"
        loadingLabel="Deleting…"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
