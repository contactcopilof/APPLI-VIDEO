export interface UploadedAsset {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  PREPARING = 'PREPARING',
  GENERATING = 'GENERATING',
  POLLING = 'POLLING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface VideoResult {
  uri: string;
  mimeType: string;
}
