

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

export interface QualificationData {
  type: 'qualification';
  lastName: string;
  firstName: string;
  middleName: string;
  registrationNumber: string;
  issueDate: string;
  expirationDate: string;
  assessmentCenterName: string; // п. 4.5
  assessmentCenterRegNumber: string; // п. 4.6
}

export interface RawData {
  type: 'raw';
  rawText: string;
}

export type AnalyzedDocument = DiplomaData | PassportData | QualificationData | RawData;

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

// Aggregated Profile Type for the Unified Form
export interface UserProfile {
  fullName: string;
  passport: {
    data: PassportData | null;
    sourceFileId: string | null;
  };
  diploma: {
    data: DiplomaData | null;
    sourceFileId: string | null;
  };
  qualification: {
    data: QualificationData | null;
    sourceFileId: string | null;
  };
}