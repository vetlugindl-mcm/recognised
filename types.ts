

export interface UploadedFile {
  file: File;
  id: string;
}

export type AnalysisState = 'idle' | 'analyzing' | 'complete' | 'error';

export type ViewState = 'upload_docs' | 'nostroy_match' | 'nopriz_match' | 'templates';

// --- Notifications ---
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// --- Document Data Types ---

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

export interface SnilsData {
  type: 'snils';
  lastName: string;
  firstName: string;
  middleName: string;
  snils: string; 
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
  assessmentCenterName: string; 
  assessmentCenterRegNumber: string; 
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

export type TemplateCategory = 'nostroy' | 'nopriz';

export interface DocumentTemplate {
  id: string;
  file: File;
  name: string;
  uploadDate: Date;
  variables: string[];
  size: number;
  category: TemplateCategory;
}

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

export type ComplianceStatus = 'success' | 'warning' | 'error';

export interface ValidationRuleResult {
  id: string;
  label: string;
  status: ComplianceStatus;
  message: string;
}

export interface ComplianceReport {
  score: number; 
  status: ComplianceStatus;
  checks: ValidationRuleResult[];
  summary: string;
}