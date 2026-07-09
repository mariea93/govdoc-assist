import { api } from "./api-client";

export async function waitForDocument(
  dbId: string,
  timeoutMs: number = 45000,
  pollIntervalMs: number = 1500
): Promise<any> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    const doc = await api.get<any>(`/documents/${dbId}`);
    if (doc.status === "Completed") {
      return doc;
    }
    if (doc.status === "Failed") {
      throw new Error("Document processing failed");
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }
  throw new Error("Document processing timed out");
}
