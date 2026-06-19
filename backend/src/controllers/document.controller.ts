import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.js";
import * as documentService from "../services/document.service.js";

export async function uploadDocument(req: AuthenticatedRequest, res: Response) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "missing_file", message: "Please upload a document first" });
    return;
  }

  const result = await documentService.createDocument(req.user.id, {
    fileName: file.originalname,
    filePath: file.path,
    mimeType: file.mimetype,
    fileSizeBytes: file.size,
    sourceLanguage: req.body.sourceLanguage,
    targetLanguage: req.body.targetLanguage,
    action: req.body.action,
    summaryLength: req.body.summaryLength,
  });

  res.status(201).json(result);
}

export async function summarizeText(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.createTextDocument(req.user.id, {
    fileName: "text-input.txt",
    sourceLanguage: req.body.sourceLanguage,
    action: "SUMMARIZE",
    summaryLength: req.body.summaryLength,
    textPreview: req.body.text,
  });

  res.status(201).json({
    ...result,
    message: "Document job created. AI processing will be handled by the Python service.",
  });
}

export async function translateText(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.createTextDocument(req.user.id, {
    fileName: "text-input.txt",
    sourceLanguage: req.body.sourceLanguage,
    targetLanguage: req.body.targetLanguage,
    action: "TRANSLATE",
    textPreview: req.body.text,
  });

  res.status(201).json({
    ...result,
    message: "Document job created. AI processing will be handled by the Python service.",
  });
}

export async function listDocuments(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.listDocuments(req.user.id, req.user.role, req.query as never);
  res.json(result);
}

export async function getDocument(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.getDocumentById(req.params.id, req.user.id, req.user.role);
  res.json(result);
}

export async function updateDocument(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.updateDocument(req.params.id, req.body);
  res.json(result);
}

export async function updateProcessingResult(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.updateProcessingResult(req.params.id, req.body);
  res.json(result);
}

export async function deleteDocument(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.deleteDocument(req.params.id, req.user.id, req.user.role);
  res.json(result);
}

export async function saveToHistory(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.saveToHistory(req.params.id, req.user.id);
  res.json(result);
}

export async function getHistory(req: AuthenticatedRequest, res: Response) {
  const result = await documentService.listDocuments(req.user.id, req.user.role, req.query as never);
  res.json(result);
}
