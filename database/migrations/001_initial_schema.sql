CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user', 'reviewer', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  owner_user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_projects_owner_user_id (owner_user_id),
  CONSTRAINT fk_projects_owner_user_id
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS analyses (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  prompt TEXT NOT NULL,
  ai_response MEDIUMTEXT NOT NULL,
  model_name VARCHAR(255) NULL,
  topic VARCHAR(255) NULL,
  status ENUM('draft', 'queued', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_analyses_project_id (project_id),
  KEY idx_analyses_status (status),
  CONSTRAINT fk_analyses_project_id
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  project_id BIGINT UNSIGNED NOT NULL,
  uploaded_by_user_id BIGINT UNSIGNED NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  storage_key VARCHAR(512) NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NOT NULL,
  processing_status ENUM('uploaded', 'extracting', 'processed', 'failed') NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_documents_project_id (project_id),
  KEY idx_documents_uploaded_by_user_id (uploaded_by_user_id),
  CONSTRAINT fk_documents_project_id
    FOREIGN KEY (project_id) REFERENCES projects(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_documents_uploaded_by_user_id
    FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  document_id BIGINT UNSIGNED NOT NULL,
  chunk_index INT UNSIGNED NOT NULL,
  content MEDIUMTEXT NOT NULL,
  page_number INT UNSIGNED NULL,
  char_start INT UNSIGNED NULL,
  char_end INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_document_chunks_document_index (document_id, chunk_index),
  FULLTEXT KEY ft_document_chunks_content (content),
  CONSTRAINT fk_document_chunks_document_id
    FOREIGN KEY (document_id) REFERENCES documents(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS claims (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  analysis_id BIGINT UNSIGNED NOT NULL,
  claim_index INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  status ENUM('pending', 'analyzed', 'reviewed', 'failed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_claims_analysis_index (analysis_id, claim_index),
  KEY idx_claims_analysis_id (analysis_id),
  CONSTRAINT fk_claims_analysis_id
    FOREIGN KEY (analysis_id) REFERENCES analyses(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS claim_evidence_links (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  claim_id BIGINT UNSIGNED NOT NULL,
  document_chunk_id BIGINT UNSIGNED NOT NULL,
  relevance_score DECIMAL(6,5) NULL,
  rank_position INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_claim_evidence_claim_chunk (claim_id, document_chunk_id),
  KEY idx_claim_evidence_claim_id (claim_id),
  KEY idx_claim_evidence_document_chunk_id (document_chunk_id),
  CONSTRAINT fk_claim_evidence_claim_id
    FOREIGN KEY (claim_id) REFERENCES claims(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_claim_evidence_document_chunk_id
    FOREIGN KEY (document_chunk_id) REFERENCES document_chunks(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_results (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  claim_id BIGINT UNSIGNED NOT NULL,
  classification ENUM('supported', 'partially_supported', 'contradicted', 'unverifiable') NOT NULL,
  confidence DECIMAL(5,4) NULL,
  rationale TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_verification_results_claim_id (claim_id),
  CONSTRAINT fk_verification_results_claim_id
    FOREIGN KEY (claim_id) REFERENCES claims(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS human_reviews (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  claim_id BIGINT UNSIGNED NOT NULL,
  reviewer_user_id BIGINT UNSIGNED NOT NULL,
  decision ENUM('accept', 'correct', 'needs_more_evidence') NOT NULL,
  corrected_classification ENUM('supported', 'partially_supported', 'contradicted', 'unverifiable') NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_human_reviews_claim_id (claim_id),
  KEY idx_human_reviews_reviewer_user_id (reviewer_user_id),
  CONSTRAINT fk_human_reviews_claim_id
    FOREIGN KEY (claim_id) REFERENCES claims(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_human_reviews_reviewer_user_id
    FOREIGN KEY (reviewer_user_id) REFERENCES users(id)
    ON DELETE RESTRICT
);
