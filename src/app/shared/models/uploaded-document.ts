export interface UploadedDocument {
  id: string;
  fileName: string;
  chunksIndexed: number;
  uploadedAt: string;
  previewable: boolean;
}
