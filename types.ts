

export interface UploadedFile {
  file: File;
  id: string;
  previewUrl?: string;
}

export type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';
export type ViewState = 'scanner' | 'nostroy' | 'templates';

export interface DiplomaData {
  type: 'diploma';
  lastName: string;
  firstName: string;
  middleName: string;
  series: string | null;
  number: string;
  regNumber: string;
  institution: string;
  city: string;
  specialty: string;
  qualification: string;
  dateIssued: string;
}

export interface PassportData {
  type: 'passport';
  lastName: string;
  firstName: string;
  middleName: string;
  seriesNumber: string;
  issuedBy: string;
  dateIssued: string;
  departmentCode: string;
  birthDate: string;
  birthPlace: string;
  registration: string;
  snils: string | null;
}

export interface RawData {
  type: 'raw';
  rawText: string;
}

export type AnalyzedDocument = DiplomaData | PassportData | RawData;

export interface AnalysisItem {
  fileId: string;
  fileName: string;
  data: AnalyzedDocument | null;
  error?: string;
}

export interface DocumentTemplate {
  id: string;
  file: File;
  name: string;
  uploadDate: Date;
  variables: string[];
  size: number;
}