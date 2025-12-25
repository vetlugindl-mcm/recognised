import React from 'react';
import { UserProfile, AnalyzedDocument, PassportData, DiplomaData, QualificationData } from '../types';
import { Field } from './common/FormFields';
import { 
    UserCircleIcon, 
    IdentificationIcon, 
    HomeIcon, 
    AcademicCapIcon, 
    ClipboardDocumentCheckIcon 
} from './icons';

interface UnifiedProfileFormProps {
  profile: UserProfile;
  onUpdate: (fileId: string, newData: AnalyzedDocument) => void;
}

// Reusable Card Container
const Card = ({ 
    title, 
    icon: Icon, 
    children, 
    className = "", 
    isEmpty = false, 
    emptyText = "Данные отсутствуют" 
}: { 
    title: string; 
    icon: any; 
    children?: React.ReactNode; 
    className?: string;
    isEmpty?: boolean;
    emptyText?: string;
}) => (
    <div className={`glass-panel bg-white rounded-2xl flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 ${className}`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                {title}
            </h3>
        </div>
        
        {/* Body */}
        <div className="p-5 flex-1 relative">
            {isEmpty ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 opacity-60">
                     <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-gray-300" />
                     </div>
                     <span className="text-xs text-gray-400 font-medium">{emptyText}</span>
                </div>
            ) : (
                children
            )}
        </div>
    </div>
);

export const UnifiedProfileForm: React.FC<UnifiedProfileFormProps> = ({ profile, onUpdate }) => {
  
  // -- Helper to update data (Generic) --
  // T must extend AnalyzedDocument to ensure we are working with valid types
  const handleUpdate = <T extends AnalyzedDocument>(
    docData: T | null, 
    fileId: string | null, 
    key: keyof T, 
    val: string
  ) => {
      if (docData && fileId) {
          // We need to cast key to string to satisfy the mapped type update, 
          // or construct the object explicitly.
          const updated = { ...docData, [key]: val };
          onUpdate(fileId, updated);
      }
  };

  // -- Helper to safely get value (Generic) --
  // Ensures 'key' exists on 'T', preventing typo-based runtime errors
  const getVal = <T extends AnalyzedDocument>(data: T | null, key: keyof T): string => {
      if (!data) return '';
      const val = data[key];
      // Handle boolean or null values by converting to empty string for the Form Field
      if (val === null || val === undefined) return '';
      if (typeof val === 'boolean') return ''; // Booleans aren't text fields
      return String(val);
  };

  // -- Data Sources --
  const passport = profile.passport.data;
  const diploma = profile.diploma.data;
  const qualification = profile.qualification.data;

  // -- Flags --
  const isPassportHandwritten = passport?.isHandwritten === true;
  const isPropiskaHandwritten = isPassportHandwritten; 

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20 animate-enter">
        
        {/* ROW 1: PERSONAL + IDENTITY */}
        
        {/* 1. Personal Info (Left, Wide) */}
        <div className="md:col-span-8">
            <Card title="Личные данные" icon={UserCircleIcon} isEmpty={!passport} emptyText="Загрузите паспорт">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {/* Name Group */}
                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <Field 
                            label="Фамилия" 
                            value={getVal<PassportData>(passport, 'lastName')} 
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'lastName', v)}
                        />
                        <Field 
                            label="Имя" 
                            value={getVal<PassportData>(passport, 'firstName')} 
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'firstName', v)}
                        />
                         <Field 
                            label="Отчество" 
                            value={getVal<PassportData>(passport, 'middleName')} 
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'middleName', v)}
                        />
                    </div>
                    
                    {/* Secondary Info */}
                    <Field 
                        label="Дата рождения" 
                        value={getVal<PassportData>(passport, 'birthDate')} 
                        onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'birthDate', v)}
                    />
                     <Field 
                        label="Место рождения" 
                        value={getVal<PassportData>(passport, 'birthPlace')} 
                        fullWidth 
                        className="sm:col-span-2"
                        onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'birthPlace', v)}
                    />
                    <Field 
                        label="СНИЛС" 
                        value={getVal<PassportData>(passport, 'snils')} 
                        onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'snils', v)}
                    />
                </div>
            </Card>
        </div>

        {/* 2. Identity / Passport Details (Right, Narrow) */}
        <div className="md:col-span-4">
            <Card title="Паспортные данные" icon={IdentificationIcon} isEmpty={!passport} emptyText="Нет данных">
                <div className="flex flex-col gap-4 h-full">
                     <div className="grid grid-cols-2 gap-4">
                        <Field 
                            label="Серия / Номер" 
                            value={getVal<PassportData>(passport, 'seriesNumber')} 
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'seriesNumber', v)}
                        />
                         <Field 
                            label="Код подр." 
                            value={getVal<PassportData>(passport, 'departmentCode')} 
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'departmentCode', v)}
                        />
                     </div>
                     <Field 
                        label="Дата выдачи" 
                        value={getVal<PassportData>(passport, 'dateIssued')} 
                        onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'dateIssued', v)}
                    />
                     <Field 
                        label="Кем выдан" 
                        value={getVal<PassportData>(passport, 'issuedBy')} 
                        className="flex-1"
                        onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'issuedBy', v)}
                    />
                </div>
            </Card>
        </div>

        {/* ROW 2: ADDRESS (Full Width) */}
        <div className="md:col-span-12">
            <Card title="Место жительства" icon={HomeIcon} isEmpty={!passport} emptyText="Нет данных о прописке">
                <div className="grid grid-cols-1 sm:grid-cols-4 md:grid-cols-12 gap-5 items-start">
                     <div className="md:col-span-4">
                        <Field 
                            label="Город / Населенный пункт" 
                            value={getVal<PassportData>(passport, 'registrationCity')} 
                            isHandwritten={isPropiskaHandwritten}
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'registrationCity', v)}
                        />
                     </div>
                     <div className="md:col-span-4">
                        <Field 
                            label="Улица" 
                            value={getVal<PassportData>(passport, 'registrationStreet')} 
                            isHandwritten={isPropiskaHandwritten}
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'registrationStreet', v)}
                        />
                     </div>
                     <div className="md:col-span-2">
                        <Field 
                            label="Дом" 
                            value={getVal<PassportData>(passport, 'registrationHouse')} 
                            isHandwritten={isPropiskaHandwritten}
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'registrationHouse', v)}
                        />
                     </div>
                     <div className="md:col-span-2">
                        <Field 
                            label="Квартира" 
                            value={getVal<PassportData>(passport, 'registrationFlat')} 
                            isHandwritten={isPropiskaHandwritten}
                            onSave={(v) => handleUpdate(passport, profile.passport.sourceFileId, 'registrationFlat', v)}
                        />
                     </div>
                </div>
            </Card>
        </div>

        {/* ROW 3: EDUCATION + QUALIFICATION */}
        
        {/* 4. Education */}
        <div className="md:col-span-6">
            <Card title="Образование" icon={AcademicCapIcon} isEmpty={!diploma} emptyText="Диплом не загружен">
                <div className="space-y-5">
                    <Field 
                        label="Учебное заведение" 
                        value={getVal<DiplomaData>(diploma, 'institution')} 
                        onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'institution', v)}
                    />
                    
                    <div className="grid grid-cols-2 gap-5">
                        <Field 
                            label="Город обучения" 
                            value={getVal<DiplomaData>(diploma, 'city')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'city', v)}
                        />
                         <Field 
                            label="Дата окончания" 
                            value={getVal<DiplomaData>(diploma, 'dateIssued')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'dateIssued', v)}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-5">
                         <Field 
                            label="Серия" 
                            value={getVal<DiplomaData>(diploma, 'series')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'series', v)}
                        />
                         <Field 
                            label="Номер" 
                            value={getVal<DiplomaData>(diploma, 'number')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'number', v)}
                        />
                        <Field 
                            label="Рег. номер" 
                            value={getVal<DiplomaData>(diploma, 'regNumber')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'regNumber', v)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <Field 
                            label="Специальность" 
                            value={getVal<DiplomaData>(diploma, 'specialty')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'specialty', v)}
                        />
                        <Field 
                            label="Квалификация" 
                            value={getVal<DiplomaData>(diploma, 'qualification')} 
                            onSave={(v) => handleUpdate(diploma, profile.diploma.sourceFileId, 'qualification', v)}
                        />
                    </div>
                </div>
            </Card>
        </div>

        {/* 5. Qualification */}
        <div className="md:col-span-6">
            <Card title="Независимая оценка квалификации" icon={ClipboardDocumentCheckIcon} isEmpty={!qualification} emptyText="Свидетельство НОК не загружено">
                 <div className="space-y-5">
                    <Field 
                        label="Наименование ЦОК" 
                        value={getVal<QualificationData>(qualification, 'assessmentCenterName')} 
                        onSave={(v) => handleUpdate(qualification, profile.qualification.sourceFileId, 'assessmentCenterName', v)}
                    />
                    <div className="grid grid-cols-2 gap-5">
                        <Field 
                            label="Номер ЦОК" 
                            value={getVal<QualificationData>(qualification, 'assessmentCenterRegNumber')} 
                            onSave={(v) => handleUpdate(qualification, profile.qualification.sourceFileId, 'assessmentCenterRegNumber', v)}
                        />
                         <Field 
                            label="Рег. номер свид." 
                            value={getVal<QualificationData>(qualification, 'registrationNumber')} 
                            onSave={(v) => handleUpdate(qualification, profile.qualification.sourceFileId, 'registrationNumber', v)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <Field 
                            label="Дата выдачи" 
                            value={getVal<QualificationData>(qualification, 'issueDate')} 
                            onSave={(v) => handleUpdate(qualification, profile.qualification.sourceFileId, 'issueDate', v)}
                        />
                         <Field 
                            label="Действителен до" 
                            value={getVal<QualificationData>(qualification, 'expirationDate')} 
                            onSave={(v) => handleUpdate(qualification, profile.qualification.sourceFileId, 'expirationDate', v)}
                        />
                    </div>
                 </div>
            </Card>
        </div>

    </div>
  );
};