import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useId,
  type FormEvent,
  type ChangeEvent,
} from 'react';
import styles from './DocumentsPage.module.css';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Modal } from '../components/ui/Modal';
import { Loader } from '../components/ui/Loader';
import { Badge, type BadgeVariant } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import * as documentApi from '../api/documentApi';
import type { DocumentSummary, DocumentContentResponse } from '../api/documentApi';
import { getProjects } from '../api/projectApi';
import type { Project } from '../api/projectApi';
import type { DocumentProcessingStatus } from '../types/api';
import { parseApiError, parseFieldErrors } from '../utils/errorUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_MIME = ['application/pdf', 'text/plain'];
const ACCEPTED_EXT  = ['.pdf', '.txt'];

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  DocumentProcessingStatus,
  { variant: BadgeVariant; label: string; dot: boolean }
> = {
  uploaded:   { variant: 'info',    label: 'Uploaded',   dot: false },
  extracting: { variant: 'warning', label: 'Extracting', dot: true  },
  processed:  { variant: 'success', label: 'Processed',  dot: false },
  failed:     { variant: 'error',   label: 'Failed',     dot: false },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatMime(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType === 'text/plain') return 'Plain text';
  return mimeType;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_MIME.includes(file.type)) return true;
  const lower = file.name.toLowerCase();
  return ACCEPTED_EXT.some(ext => lower.endsWith(ext));
}

// ─── File drop zone ───────────────────────────────────────────────────────────

interface FileDropZoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  disabled?: boolean;
}

function FileDropZone({ file, onChange, error, disabled }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function pickFile(files: FileList | null) {
    if (files && files.length > 0) onChange(files[0]);
  }

  const zoneClass = [
    styles.dropZone,
    isDragOver && !disabled ? styles.dropZoneOver : '',
    error                   ? styles.dropZoneError : '',
    disabled                ? styles.dropZoneDisabled : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.fieldWrapper}>
      <span className={styles.fieldLabel} aria-hidden="true">File</span>
      <div
        className={zoneClass}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload area — click or press Enter to browse, or drag a file here"
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={e => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={e => {
          e.preventDefault();
          setIsDragOver(false);
          if (!disabled) pickFile(e.dataTransfer.files);
        }}
      >
        {/* Hidden native input — triggered by clicking the zone */}
        <input
          ref={inputRef}
          type="file"
          accept={[...ACCEPTED_EXT, ...ACCEPTED_MIME].join(',')}
          className={styles.hiddenInput}
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
          onChange={(e: ChangeEvent<HTMLInputElement>) => pickFile(e.target.files)}
        />

        {file ? (
          <div className={styles.fileSelected}>
            <span className={styles.fileSelectedIcon} aria-hidden="true">◫</span>
            <div className={styles.fileSelectedMeta}>
              <span className={styles.fileSelectedName}>{file.name}</span>
              <span className={styles.fileSelectedSize}>{formatBytes(file.size)}</span>
            </div>
            {!disabled && (
              <button
                type="button"
                className={styles.fileClearBtn}
                aria-label="Remove selected file"
                onClick={e => {
                  e.stopPropagation();
                  onChange(null);
                  if (inputRef.current) inputRef.current.value = '';
                }}
              >
                ✕
              </button>
            )}
          </div>
        ) : (
          <div className={styles.dropPrompt}>
            <span className={styles.dropArrow} aria-hidden="true">⬆</span>
            <p className={styles.dropText}>
              Drag a PDF or .txt file here, or{' '}
              <span className={styles.dropBrowse}>browse</span>
            </p>
            <p className={styles.dropHint}>PDF or plain text · max 10 MB</p>
          </div>
        )}
      </div>
      {error && (
        <p className={styles.fieldError} role="alert">{error}</p>
      )}
    </div>
  );
}

// ─── Upload modal ─────────────────────────────────────────────────────────────

interface UploadModalProps {
  projects: Project[];
  onClose: () => void;
  onUploaded: (doc: DocumentSummary) => void;
}

function UploadModal({ projects, onClose, onUploaded }: UploadModalProps) {
  const selectId = useId();
  const [projectId, setProjectId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError]   = useState('');
  const [isSaving, setIsSaving]   = useState(false);

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!projectId) {
      errs.projectId = 'Please select a project.';
    }
    if (!file) {
      errs.file = 'Please select a file to upload.';
    } else if (!isAcceptedFile(file)) {
      errs.file = 'Only PDF (.pdf) and plain text (.txt) files are accepted.';
    } else if (file.size > MAX_FILE_SIZE) {
      errs.file = `File is too large (${formatBytes(file.size)}). Maximum is 10 MB.`;
    }
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setFieldErrors({});
    setIsSaving(true);
    try {
      // file is confirmed non-null by validate()
      const doc = await documentApi.uploadDocument(Number(projectId), file!);
      onUploaded(doc);
    } catch (err) {
      const fe = parseFieldErrors(err);
      if (Object.keys(fe).length > 0) setFieldErrors(fe);
      else setApiError(parseApiError(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Upload document"
      footer={
        <div className={styles.modalFooter}>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            form="upload-doc-form"
            type="submit"
            isLoading={isSaving}
          >
            Upload
          </Button>
        </div>
      }
    >
      <form
        id="upload-doc-form"
        onSubmit={handleSubmit}
        className={styles.modalForm}
        noValidate
      >
        {apiError && (
          <Alert variant="error" message={apiError} onClose={() => setApiError('')} />
        )}

        {/* Project select */}
        <div className={styles.fieldWrapper}>
          <label htmlFor={selectId} className={styles.fieldLabel}>Project</label>
          <select
            id={selectId}
            className={[
              styles.select,
              fieldErrors.projectId ? styles.inputError : '',
            ].filter(Boolean).join(' ')}
            value={projectId}
            onChange={e => setProjectId(e.target.value)}
            disabled={isSaving}
            required
            aria-describedby={fieldErrors.projectId ? `${selectId}-err` : undefined}
            aria-invalid={fieldErrors.projectId ? 'true' : undefined}
          >
            <option value="">Select a project…</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {fieldErrors.projectId && (
            <p id={`${selectId}-err`} className={styles.fieldError} role="alert">
              {fieldErrors.projectId}
            </p>
          )}
        </div>

        <FileDropZone
          file={file}
          onChange={f => {
            setFile(f);
            // Clear the file error as soon as the user picks a new file
            if (fieldErrors.file) setFieldErrors(prev => ({ ...prev, file: '' }));
          }}
          error={fieldErrors.file}
          disabled={isSaving}
        />
      </form>
    </Modal>
  );
}

// ─── Content modal ────────────────────────────────────────────────────────────

interface ContentModalProps {
  document: DocumentSummary;
  onClose: () => void;
}

function ContentModal({ document, onClose }: ContentModalProps) {
  const [content, setContent]   = useState<DocumentContentResponse | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  const isProcessed = document.processingStatus === 'processed';

  useEffect(() => {
    if (!isProcessed) return;
    let cancelled = false;
    setLoading(true);
    setFetchError('');
    documentApi.getDocumentContent(document.id).then(data => {
      if (!cancelled) setContent(data);
    }).catch(err => {
      if (!cancelled) setFetchError(parseApiError(err));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [document.id, isProcessed]);

  const status = STATUS_CONFIG[document.processingStatus];

  return (
    <Modal isOpen onClose={onClose} title={document.originalFilename}>
      <div className={styles.detailBody}>
        {/* Metadata row */}
        <div className={styles.detailMeta}>
          <Badge variant={status.variant} dot={status.dot}>{status.label}</Badge>
          <span className={styles.detailMetaItem}>
            Project: <strong>{document.projectName}</strong>
          </span>
          <span className={styles.detailMetaItem}>{formatMime(document.mimeType)}</span>
          <span className={styles.detailMetaItem}>{formatBytes(document.fileSizeBytes)}</span>
          {isProcessed && document.chunkCount > 0 && (
            <span className={styles.detailMetaItem}>
              {document.chunkCount} chunk{document.chunkCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className={styles.detailTimestamps}>
          <span>Uploaded {formatDate(document.createdAt)}</span>
          <span>Updated {formatDate(document.updatedAt)}</span>
        </div>

        {/* Not-yet-processed states */}
        {!isProcessed && (
          document.processingStatus === 'failed' ? (
            <Alert
              variant="error"
              message="This document failed to process. Content extraction is unavailable."
            />
          ) : (
            <Alert
              variant="info"
              message={
                document.processingStatus === 'extracting'
                  ? 'This document is currently being processed. Content will be available once extraction completes.'
                  : 'This document is queued for processing. Content will be available once extraction completes.'
              }
            />
          )
        )}

        {/* Fetching content */}
        {isProcessed && isLoading && (
          <div className={styles.modalCentred}>
            <Loader size="md" label="Loading document content…" />
          </div>
        )}

        {/* Fetch error */}
        {isProcessed && !isLoading && fetchError && (
          <Alert variant="error" message={fetchError} />
        )}

        {/* Chunks */}
        {isProcessed && !isLoading && !fetchError && content && (
          <>
            {content.chunks.length === 0 ? (
              <p className={styles.noChunks}>
                No content chunks were extracted from this document.
              </p>
            ) : (
              <div className={styles.chunksContainer}>
                <p className={styles.chunksHeader}>
                  Extracted content — {content.chunks.length} chunk
                  {content.chunks.length !== 1 ? 's' : ''}
                </p>
                {content.chunks
                  .slice()
                  .sort((a, b) => a.chunkIndex - b.chunkIndex)
                  .map(chunk => (
                    <div key={chunk.id} className={styles.chunk}>
                      <div className={styles.chunkMeta}>
                        <span className={styles.chunkIndex}>
                          Chunk {chunk.chunkIndex + 1}
                        </span>
                        {chunk.pageNumber !== null && (
                          <span className={styles.chunkMetaItem}>
                            Page {chunk.pageNumber}
                          </span>
                        )}
                        {chunk.charStart !== null && chunk.charEnd !== null && (
                          <span className={styles.chunkMetaItem}>
                            Chars {chunk.charStart}–{chunk.charEnd}
                          </span>
                        )}
                      </div>
                      <pre className={styles.chunkContent}>{chunk.content}</pre>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Document card ────────────────────────────────────────────────────────────

interface DocumentCardProps {
  document: DocumentSummary;
  onView:        (doc: DocumentSummary) => void;
  onDeleteClick: (doc: DocumentSummary) => void;
  onRefresh:     () => void;
}

function DocumentCard({ document, onView, onDeleteClick, onRefresh }: DocumentCardProps) {
  const status     = STATUS_CONFIG[document.processingStatus];
  const canView    = document.processingStatus === 'processed';
  const isPending  = document.processingStatus === 'uploaded' ||
                     document.processingStatus === 'extracting';

  return (
    <article className={styles.card}>
      {/* Top row: filename + status */}
      <div className={styles.cardTop}>
        <div className={styles.cardTitleGroup}>
          <span className={styles.fileTypeTag}>{formatMime(document.mimeType)}</span>
          <h2 className={styles.cardTitle}>{document.originalFilename}</h2>
        </div>
        <Badge variant={status.variant} dot={status.dot}>{status.label}</Badge>
      </div>

      {/* Meta chips */}
      <div className={styles.cardChips}>
        <span className={styles.projectChip}>{document.projectName}</span>
        <span className={styles.chip}>{formatBytes(document.fileSizeBytes)}</span>
        {canView && document.chunkCount > 0 && (
          <span className={styles.chip}>
            {document.chunkCount} chunk{document.chunkCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Footer: date + actions */}
      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>Uploaded {formatDate(document.createdAt)}</span>
        <div className={styles.cardActions}>
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              title="Refresh status"
            >
              ↻ Refresh
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(document)}
            disabled={!canView}
            title={
              !canView
                ? `Content unavailable — document is ${status.label.toLowerCase()}`
                : 'View extracted content'
            }
          >
            View
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeleteClick(document)}
          >
            Delete
          </Button>
        </div>
      </div>
    </article>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DocumentsPage() {
  const [documents, setDocuments]           = useState<DocumentSummary[]>([]);
  const [projects,  setProjects]            = useState<Project[]>([]);
  const [filterProjectId, setFilter]        = useState<number | null>(null);
  const [isLoadingDocs, setLoadingDocs]     = useState(true);
  const [isLoadingProjects, setLoadingProj] = useState(true);
  const [loadError, setLoadError]           = useState('');

  const [showUpload,    setShowUpload]    = useState(false);
  const [viewTarget,    setViewTarget]    = useState<DocumentSummary | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<DocumentSummary | null>(null);

  // Load projects once (for filter dropdown and upload form)
  useEffect(() => {
    let cancelled = false;
    setLoadingProj(true);
    getProjects().then(list => {
      if (!cancelled) setProjects(list);
    }).catch(() => {
      // Non-fatal: filter and upload will gracefully show empty
    }).finally(() => {
      if (!cancelled) setLoadingProj(false);
    });
    return () => { cancelled = true; };
  }, []);

  // Load documents whenever filter changes
  const loadDocuments = useCallback(async () => {
    setLoadingDocs(true);
    setLoadError('');
    try {
      const list = await documentApi.listDocuments(
        filterProjectId !== null ? filterProjectId : undefined,
      );
      setDocuments(list);
    } catch (err) {
      setLoadError(parseApiError(err));
    } finally {
      setLoadingDocs(false);
    }
  }, [filterProjectId]);

  useEffect(() => { void loadDocuments(); }, [loadDocuments]);

  function handleUploaded(doc: DocumentSummary) {
    if (filterProjectId === null || filterProjectId === doc.projectId) {
      setDocuments(prev => [doc, ...prev]);
    }
    setShowUpload(false);
  }

  async function handleConfirmDelete(): Promise<void> {
    if (!confirmTarget) return;
    try {
      await documentApi.deleteDocument(confirmTarget.id);
      setDocuments(prev => prev.filter(d => d.id !== confirmTarget.id));
    } catch (err) {
      throw new Error(parseApiError(err));
    }
  }

  const noProjects     = !isLoadingProjects && projects.length === 0;
  const isLoadingAll   = isLoadingDocs || isLoadingProjects;
  const showEmptyState = !isLoadingDocs && !loadError && documents.length === 0;

  return (
    <AppLayout>
      <div className={styles.page}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>Documents</h1>
            <p className={styles.pageSubtitle}>
              Upload PDF and plain text files to extract content for
              AI-response verification.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowUpload(true)}
            disabled={isLoadingProjects || noProjects}
            title={noProjects ? 'Create a project first before uploading documents' : undefined}
          >
            Upload document
          </Button>
        </div>

        {/* ── Project filter ──────────────────────────────── */}
        {!isLoadingProjects && projects.length > 0 && (
          <div className={styles.filterBar}>
            <label htmlFor="doc-filter" className={styles.filterLabel}>
              Filter by project
            </label>
            <select
              id="doc-filter"
              className={styles.filterSelect}
              value={filterProjectId ?? ''}
              onChange={e => {
                const v = e.target.value;
                setFilter(v === '' ? null : Number(v));
              }}
            >
              <option value="">All projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────── */}
        {isLoadingDocs && (
          <div className={styles.centred}>
            <Loader size="lg" label="Loading documents…" />
          </div>
        )}

        {/* ── Load error ──────────────────────────────────── */}
        {!isLoadingDocs && loadError && (
          <div className={styles.centred}>
            <div className={styles.stateBox}>
              <p className={styles.stateTitle} style={{ color: 'var(--color-danger)' }}>
                Failed to load documents
              </p>
              <p className={styles.stateBody}>{loadError}</p>
              <Button variant="secondary" onClick={() => void loadDocuments()}>
                Try again
              </Button>
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────── */}
        {showEmptyState && (
          <div className={styles.centred}>
            <div className={styles.stateBox}>
              <p className={styles.stateIcon}>◫</p>
              <p className={styles.stateTitle}>No documents yet</p>
              <p className={styles.stateBody}>
                {noProjects
                  ? 'Create a project first, then upload a PDF or plain text file.'
                  : filterProjectId !== null
                  ? 'No documents have been uploaded to this project.'
                  : 'Upload a PDF or plain text file to extract content for verification.'}
              </p>
              {!noProjects && (
                <Button variant="primary" onClick={() => setShowUpload(true)}>
                  Upload document
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Document list ────────────────────────────────── */}
        {!isLoadingAll && !loadError && documents.length > 0 && (
          <div className={styles.list}>
            {documents.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={setViewTarget}
                onDeleteClick={setConfirmTarget}
                onRefresh={() => void loadDocuments()}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      {showUpload && (
        <UploadModal
          projects={projects}
          onClose={() => setShowUpload(false)}
          onUploaded={handleUploaded}
        />
      )}

      {viewTarget && (
        <ContentModal
          document={viewTarget}
          onClose={() => setViewTarget(null)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmTarget !== null}
        title="Delete document?"
        subjectName={confirmTarget?.originalFilename ?? ''}
        description="This will permanently delete the document and all extracted content. This cannot be undone."
        confirmLabel="Delete document"
        loadingLabel="Deleting…"
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </AppLayout>
  );
}
