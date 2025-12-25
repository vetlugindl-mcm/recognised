import React from 'react';
import { UserProfile, AnalyzedDocument } from '../types';
import { Field, FieldGroup } from './common/FormFields';
import { UserCircleIcon, ExclamationCircleIcon } from './icons';
import { DOCUMENT_SCHEMAS, SupportedDocTypes } from '../configs/documentSchemas';

interface UnifiedProfileFormProps {
  profile: UserProfile;
  onUpdate: (fileId: string, newData: AnalyzedDocument) => void;
}

const EmptySection = ({ text }: { text: string }) => (
  <div className="group relative overflow-hidden p-8 border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50/30 transition-all duration-500 hover:bg-gray-50 hover:border-gray-400">
    {/* Engineering Grid Pattern (Consistent with Dropzone) */}
    <div className="absolute inset-0 bg-grid opacity-[0.4] pointer-events-none" />
    
    <div className="relative z-10 flex flex-col items-center gap-3 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-1">
      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-500">
         <ExclamationCircleIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
      </div>
      <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900 transition-colors">{text}</span>
    </div>
  </div>
);

// Typed configuration to allow TS to understand the relationship between keys
interface SectionConfig {
    profileKey: keyof Omit<UserProfile, 'fullName'>; // Explicitly map to profile keys
    docType: SupportedDocTypes;
    emptyText: string;
}

export const UnifiedProfileForm: React.FC<UnifiedProfileFormProps> = ({ profile, onUpdate }) => {
  const { fullName } = profile;

  // Generic handler for field updates with safer typing
  const handleFieldUpdate = (
    data: AnalyzedDocument,
    fileId: string | null,
    fieldKey: string,
    value: string
  ) => {
    if (fileId && data) {
      // Create a copy to satisfy immutability conceptually, though spread does shallow copy
      const updatedData = { ...data, [fieldKey]: value };
      onUpdate(fileId, updatedData);
    }
  };

  // Helper to safely access data properties by string key
  const getSafeValue = (data: AnalyzedDocument, key: string): string => {
      return (data as any)[key] as string;
  };

  /**
   * Determines if a specific field should be highlighted as "Handwritten".
   * Rule:
   * - If Doc is NOT handwritten -> False
   * - If Doc IS handwritten:
   *    - For Passport: Only highlight 'registration' fields (Propiska), as main page is usually printed.
   *    - For Others (Diploma, etc.): Highlight everything, as they are often fully handwritten.
   */
  const shouldHighlightField = (docType: SupportedDocTypes, fieldKey: string, isDocHandwritten: boolean): boolean => {
      if (!isDocHandwritten) return false;

      if (docType === 'passport') {
          // Only warn about registration fields for passports
          return fieldKey.startsWith('registration');
      }

      // For other docs, assume the whole doc is risky if flagged
      return true;
  };

  const sectionsToRender: SectionConfig[] = [
    { profileKey: 'passport', docType: 'passport', emptyText: 'Паспорт не загружен' },
    { profileKey: 'diploma', docType: 'diploma', emptyText: 'Диплом не загружен' },
    { profileKey: 'qualification', docType: 'qualification', emptyText: 'Свидетельство НОК не загружено' },
  ];

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100 mb-10">
      
      {/* 0. Global Header */}
      <div className="bg-[#111827] text-white px-6 py-5 flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] blur-3xl rounded-full -mr-12 -mt-12 pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 backdrop-blur-md shadow-inner">
            <UserCircleIcon className="w-6 h-6 text-white/90" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white leading-snug">
              {fullName !== 'Неизвестный кандидат' ? fullName : <span className="opacity-50 font-normal">ФИО не определено</span>}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide uppercase">Единый цифровой профиль</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-12 bg-white">
        
        {/* Dynamic Section Rendering Loop */}
        {sectionsToRender.map((sectionConfig) => {
            const profileItem = profile[sectionConfig.profileKey];
            
            const data = profileItem?.data;
            const sourceFileId = profileItem?.sourceFileId;
            const schema = DOCUMENT_SCHEMAS[sectionConfig.docType];
            
            // Check for Handwritten Flag
            const isDocHandwritten = data?.isHandwritten === true;

            // Divider between main documents
            const isNotFirst = sectionConfig.profileKey !== 'passport';

            return (
                <section key={sectionConfig.profileKey} className="relative animate-enter">
                    {/* Visual separation for sections */}
                    {isNotFirst && <div className="absolute -top-6 left-0 right-0 border-t border-dashed border-gray-100"></div>}

                    {data ? (
                        <div className="space-y-8">
                            {schema.sections.map((schemaSection) => (
                                <FieldGroup key={schemaSection.id} title={schemaSection.title}>
                                    {schemaSection.fields.map((field) => (
                                        <Field 
                                            key={field.key}
                                            label={field.label}
                                            value={getSafeValue(data, field.key)}
                                            fullWidth={field.fullWidth}
                                            onSave={(val) => handleFieldUpdate(data, sourceFileId, field.key, val)}
                                            isHandwritten={shouldHighlightField(sectionConfig.docType, field.key, isDocHandwritten)}
                                        />
                                    ))}
                                </FieldGroup>
                            ))}
                        </div>
                    ) : (
                         <div className="mt-4">
                             {/* Show title even if empty to keep structure */}
                             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3 select-none">
                                {schema.title}
                                <div className="h-px bg-gray-100 flex-1"></div>
                             </h4>
                             <EmptySection text={sectionConfig.emptyText} />
                         </div>
                    )}
                </section>
            );
        })}

      </div>
    </div>
  );
};