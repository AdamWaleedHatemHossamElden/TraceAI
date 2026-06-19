# TraceAI MySQL Schema

## Purpose
The Phase 1 schema stores relational data for users, projects, analyses, evidence documents, document chunks, extracted claims, evidence links, verification results, and human reviews.

## Main Tables
- `users`: accounts, roles, hashed passwords, and timestamps.
- `projects`: user-owned verification workspaces.
- `analyses`: submitted prompts, AI responses, model/topic metadata, and processing status.
- `documents`: uploaded evidence file metadata.
- `document_chunks`: extracted text passages from evidence documents.
- `claims`: factual claims extracted from AI responses.
- `claim_evidence_links`: relationship between claims and candidate evidence chunks.
- `verification_results`: automated classification output and confidence scores.
- `human_reviews`: reviewer decisions and correction notes.

## Evidence Retrieval Direction
Document chunks and metadata are stored in MySQL during Phase 1. Embeddings, vector search, semantic retrieval, and model selection are deferred to the Python AI service in a later phase.

## Security Notes
- Passwords must be hashed with bcrypt before storage.
- Uploaded files must be validated before persistence.
- Ownership checks must be enforced before reading project, analysis, document, claim, or review records.
- SQL files must be reviewed before manual execution.
