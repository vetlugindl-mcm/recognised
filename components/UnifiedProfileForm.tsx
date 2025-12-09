import React from 'react';
import { UserProfile, AnalyzedDocument } from '../types';
import { Field, FieldGroup } from './common/FormFields';
import { UserCircleIcon, ExclamationCircleIcon } from './icons';

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
  const { passport, diploma, qualification, fullName } = profile;

  // STRICT TYPE SAFETY: Use generics to ensure 'field' key belongs to the data object type.
  const handleFieldUpdate = <T extends AnalyzedDocument>(
    data: T | null,
    fileId: string | null,
    field: keyof T,
    value: string
  ) => {
    if (fileId && data) {
      // We know data and field match T, so this spread is type-safe
      onUpdate(fileId, { ...data, [field]: value });
    }
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 ring-1 ring-gray-100 mb-10">
      
      {/* 0. Global Header - Compact & Clean */}
      <div className="bg-[#111827] text-white px-6 py-5 flex items-center justify-between relative overflow-hidden">
        {/* Background Effects */}
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

      <div className="p-8 space-y-10 bg-white">
        
        {/* 1. Passport Data */}
        <section>
          <FieldGroup title="1. Данные паспорта">
             {passport.data ? (
                <>
                  <Field 
                    label="Фамилия" 
                    value={passport.data.lastName} 
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'lastName', v)} 
                  />
                  <Field 
                    label="Имя" 
                    value={passport.data.firstName} 
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'firstName', v)} 
                  />
                  <Field 
                    label="Отчество" 
                    value={passport.data.middleName} 
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'middleName', v)} 
                  />
                  <Field 
                    label="Дата рождения" 
                    value={passport.data.birthDate} 
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'birthDate', v)} 
                  />
                  <Field 
                    label="Место рождения" 
                    value={passport.data.birthPlace} fullWidth
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'birthPlace', v)} 
                  />
                  <Field 
                    label="Адрес регистрации" 
                    value={passport.data.registration} fullWidth
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'registration', v)} 
                  />
                  <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                    <Field 
                        label="Серия и Номер" 
                        value={passport.data.seriesNumber} 
                        onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'seriesNumber', v)} 
                    />
                     <Field 
                        label="Код подразделения" 
                        value={passport.data.departmentCode} 
                        onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'departmentCode', v)} 
                    />
                  </div>
                  <Field 
                    label="Кем выдан" 
                    value={passport.data.issuedBy} fullWidth
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'issuedBy', v)} 
                  />
                  <Field 
                    label="Дата выдачи" 
                    value={passport.data.dateIssued} 
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'dateIssued', v)} 
                  />
                </>
             ) : (
               <div className="col-span-2">
                 <EmptySection text="Паспорт не загружен" />
               </div>
             )}
          </FieldGroup>
        </section>

        {/* 2. SNILS */}
        <section>
          <FieldGroup title="2. СНИЛС">
            {passport.data && passport.data.snils ? (
                <Field 
                    label="Номер СНИЛС" 
                    value={passport.data.snils} 
                    onSave={(v) => handleFieldUpdate(passport.data, passport.sourceFileId, 'snils', v)} 
                />
            ) : (
                <div className="col-span-2">
                    <EmptySection text="СНИЛС не найден (ожидается в данных паспорта)" />
                </div>
            )}
          </FieldGroup>
        </section>

        {/* 3. Diploma */}
        <section>
          <FieldGroup title="3. Диплом">
            {diploma.data ? (
                <>
                   <Field 
                        label="Серия и Номер" 
                        value={`${diploma.data.series || ''} ${diploma.data.number}`} 
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'number', v)} 
                   />
                   <Field 
                        label="Регистрационный номер" 
                        value={diploma.data.regNumber} 
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'regNumber', v)} 
                   />
                   <Field 
                        label="Учебное заведение" 
                        value={diploma.data.institution} fullWidth
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'institution', v)} 
                   />
                   <Field 
                        label="Специальность" 
                        value={diploma.data.specialty} fullWidth
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'specialty', v)} 
                   />
                   <Field 
                        label="Квалификация" 
                        value={diploma.data.qualification} fullWidth
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'qualification', v)} 
                   />
                   <Field 
                        label="Город" 
                        value={diploma.data.city} 
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'city', v)} 
                   />
                   <Field 
                        label="Дата окончания" 
                        value={diploma.data.dateIssued} 
                        onSave={(v) => handleFieldUpdate(diploma.data, diploma.sourceFileId, 'dateIssued', v)} 
                   />
                </>
            ) : (
                <div className="col-span-2">
                    <EmptySection text="Диплом не загружен" />
                </div>
            )}
          </FieldGroup>
        </section>

        {/* 4. Qualification (NOK) */}
        <section>
          <FieldGroup title="4. Независимая оценка">
             {qualification.data ? (
                 <>
                    <Field 
                        label="Регистрационный номер" 
                        value={qualification.data.registrationNumber} fullWidth
                        onSave={(v) => handleFieldUpdate(qualification.data, qualification.sourceFileId, 'registrationNumber', v)} 
                    />
                    <Field 
                        label="Дата выдачи" 
                        value={qualification.data.issueDate} 
                        onSave={(v) => handleFieldUpdate(qualification.data, qualification.sourceFileId, 'issueDate', v)} 
                    />
                    <Field 
                        label="Действителен до" 
                        value={qualification.data.expirationDate} 
                        onSave={(v) => handleFieldUpdate(qualification.data, qualification.sourceFileId, 'expirationDate', v)} 
                    />
                    <Field 
                        label="Наименование ЦОК" 
                        value={qualification.data.assessmentCenterName} fullWidth
                        onSave={(v) => handleFieldUpdate(qualification.data, qualification.sourceFileId, 'assessmentCenterName', v)} 
                    />
                    <Field 
                        label="Рег. номер ЦОК" 
                        value={qualification.data.assessmentCenterRegNumber} fullWidth
                        onSave={(v) => handleFieldUpdate(qualification.data, qualification.sourceFileId, 'assessmentCenterRegNumber', v)} 
                    />
                 </>
             ) : (
                 <div className="col-span-2">
                    <EmptySection text="Свидетельство НОК не загружено" />
                 </div>
             )}
          </FieldGroup>
        </section>

      </div>
    </div>
  );
};