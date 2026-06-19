# TraceAI Project Specification

## Summary
TraceAI is a full-stack, human-in-the-loop platform for verifying AI-generated answers at the claim level. Users submit an AI response and supporting evidence documents. The system extracts factual claims, links them to evidence passages, classifies support status, and lets human reviewers confirm or correct results.

## Core Workflow
1. User submits an original prompt, AI-generated answer, model name, and topic.
2. User uploads supporting PDF or text evidence documents.
3. The system extracts and stores evidence text chunks.
4. The AI service later extracts factual claims and retrieves relevant evidence.
5. The system stores claim labels, evidence links, confidence scores, and review decisions.
6. Reviewers inspect evidence and correct automated assessments.

## Phase 1 Goal
Create the project foundation only:
- Backend and AI-service skeletons.
- MySQL schema files.
- Documentation and API contract.
- Health endpoints.
- Docker Compose configuration for later use.

## Deferred Work
- Authentication implementation.
- Upload processing.
- PDF/text extraction.
- Claim extraction.
- Embeddings, vector search, and semantic retrieval.
- Claim classification.
- Human review UI.
- Dashboard and frontend pages.
