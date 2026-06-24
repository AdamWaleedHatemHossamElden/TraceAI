import type { DocumentChunkInput } from "../types/document.types";

const TARGET_CHUNK_SIZE = 1400;
const MIN_BOUNDARY_SIZE = 700;
const OVERLAP_SIZE = 200;

const findBoundary = (text: string, start: number, targetEnd: number): number => {
  const minBoundary = Math.min(start + MIN_BOUNDARY_SIZE, targetEnd);
  const boundaryCandidates = [
    text.lastIndexOf("\n\n", targetEnd),
    text.lastIndexOf(". ", targetEnd),
    text.lastIndexOf("? ", targetEnd),
    text.lastIndexOf("! ", targetEnd)
  ].filter((index) => index >= minBoundary);

  if (boundaryCandidates.length === 0) {
    return targetEnd;
  }

  const boundary = Math.max(...boundaryCandidates);
  return text.startsWith("\n\n", boundary) ? boundary + 2 : boundary + 1;
};

const trimChunkRange = (text: string, start: number, end: number): { start: number; end: number } => {
  let trimmedStart = start;
  let trimmedEnd = end;

  while (trimmedStart < trimmedEnd && /\s/.test(text[trimmedStart] ?? "")) {
    trimmedStart += 1;
  }

  while (trimmedEnd > trimmedStart && /\s/.test(text[trimmedEnd - 1] ?? "")) {
    trimmedEnd -= 1;
  }

  return { start: trimmedStart, end: trimmedEnd };
};

export const chunkDocumentText = (text: string): DocumentChunkInput[] => {
  const chunks: DocumentChunkInput[] = [];
  let start = 0;

  while (start < text.length) {
    const targetEnd = Math.min(start + TARGET_CHUNK_SIZE, text.length);
    const end = targetEnd === text.length ? targetEnd : findBoundary(text, start, targetEnd);
    const range = trimChunkRange(text, start, end);
    const content = text.slice(range.start, range.end);

    if (content.length > 0) {
      chunks.push({
        chunkIndex: chunks.length,
        content,
        pageNumber: null,
        charStart: range.start,
        charEnd: range.end
      });
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(range.end - OVERLAP_SIZE, range.start + 1);
  }

  return chunks;
};
