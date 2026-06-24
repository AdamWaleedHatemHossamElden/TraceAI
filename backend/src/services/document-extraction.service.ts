import { PDFParse } from "pdf-parse";

import { ApiError } from "../errors/api-error";
import type { DocumentMimeType } from "../types/document.types";
import { normalizeExtractedText } from "../utils/text-normalization";

const extractPdfText = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
};

export const extractDocumentText = async (
  buffer: Buffer,
  mimeType: DocumentMimeType
): Promise<string> => {
  const rawText =
    mimeType === "application/pdf" ? await extractPdfText(buffer) : buffer.toString("utf8");

  const normalizedText = normalizeExtractedText(rawText);

  if (normalizedText.length === 0) {
    throw new ApiError(422, "INVALID_FILE", "No readable text could be extracted from the document.");
  }

  return normalizedText;
};
