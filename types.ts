

export interface UploadedFile {
  file: File;
  id: string;
  // previewUrl is removed to prevent memory leaks and state duplication. 
  // Visual components should derive it using useObjectUrl or PdfService.
}

export type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';

// UPDATED: New View IDs
export type ViewState = 'upload_docs' | 'nostroy_match' | 'nopriz_match' | 'templates';

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
  isHandwritten?: boolean;
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
  
  // Registration fields
  registrationCity: string | null;
  registrationStreet: string | null; 
  registrationHouse: string | null;  
  registrationFlat: string | null;   
  registrationDate: string | null;
  
  snils: string | null;
  isHandwritten?: boolean;
}

// NEW: Standalone SNILS Document
export interface SnilsData {
  type: 'snils';
  lastName: string;
  firstName: string;
  middleName: string;
  snils: string; // The main value we need
  dateIssued?: string;
  isHandwritten?: boolean;
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
  isHandwritten?: boolean;
}

export interface RawData {
  type: 'raw';
  rawText: string;
  isHandwritten?: boolean;
}

export type AnalyzedDocument = DiplomaData | PassportData | QualificationData | SnilsData | RawData;

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
  // We keep SNILS logically attached to Identity (Passport) in the unified view, 
  // but we can track the source document if needed.
}

// --- Validation & Compliance Types ---

export type ComplianceStatus = 'success' | 'warning' | 'error';

export interface ValidationRuleResult {
  id: string;
  label: string;
  status: ComplianceStatus;
  message: string;
}

export interface ComplianceReport {
  score: number; // 0 to 100
  status: ComplianceStatus;
  checks: ValidationRuleResult[];
  summary: string;
}