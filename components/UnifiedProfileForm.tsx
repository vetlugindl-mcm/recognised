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
  <div className="p-6 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center bg-gray-50/50">
    <div className="flex items-center gap-2 text-gray-400">
      <ExclamationCircleIcon className="w-5 h-5" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  </div>
);

export const UnifiedProfileForm: React.FC<UnifiedProfileFormProps> = ({ profile, onUpdate }) => {
  const { fullName } = profile;

  // Generic handler for field updates
  const handleFieldUpdate = (
    data: any, // We trust the schema matches the data structure
    fileId: string | null,
    fieldKey: string,
    value: string
  ) => {
    if (fileId && data) {
      onUpdate(fileId, { ...data, [fieldKey]: value });
    }
  };

  // Define the render order and mapping to profile keys
  const sectionsToRender: { profileKey: keyof UserProfile; docType: SupportedDocTypes; emptyText: string }[] = [
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
          </div>
        </div>
      </div>

      <div className="p-8 space-y-12 bg-white">
        
        {/* Dynamic Section Rendering Loop */}
        {sectionsToRender.map((sectionConfig) => {
            const profileItem = profile[sectionConfig.profileKey];
            // @ts-ignore - complex union type mapping
            const data = profileItem?.data;
            // @ts-ignore
            const sourceFileId = profileItem?.sourceFileId;
            const schema = DOCUMENT_SCHEMAS[sectionConfig.docType];

            // Divider between main documents
            const isNotFirst = sectionConfig.profileKey !== 'passport';

            return (
                <section key={sectionConfig.profileKey} className="relative">
                    {/* Visual separation for sections */}
                    {isNotFirst && <div className="absolute -top-6 left-0 right-0 border-t border-gray-100"></div>}

                    {/* Section Title (Optional, schema doesn't have a main title used here, we use Schema Sections) */}
                    
                    {data ? (
                        <div className="space-y-8">
                            {schema.sections.map((schemaSection) => (
                                <FieldGroup key={schemaSection.id} title={schemaSection.title}>
                                    {schemaSection.fields.map((field) => (
                                        <Field 
                                            key={field.key}
                                            label={field.label}
                                            value={data[field.key]}
                                            fullWidth={field.fullWidth}
                                            onSave={(val) => handleFieldUpdate(data, sourceFileId, field.key, val)}
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
