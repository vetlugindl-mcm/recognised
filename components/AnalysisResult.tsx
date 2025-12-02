import React, { useState, useEffect } from 'react';
import { AnalysisItem, DiplomaData, PassportData, AnalyzedDocument } from '../types';
import { IdentificationIcon, AcademicCapIcon, DocumentIcon, ClipboardIcon, PencilIcon } from './icons';

interface AnalysisResultProps {
  item: AnalysisItem;
  onUpdate?: (fileId: string, newData: AnalyzedDocument) => void;
}

// --- SKELETON COMPONENT ---
export const AnalysisSkeleton = () => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px]">
      {/* Header Skeleton */}
      <div className="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between bg-white/40">
         <div className="flex flex-col gap-2">
            <div className="h-6 w-32 skeleton rounded-md"></div>
            <div className="h-4 w-24 skeleton rounded-md"></div>
         </div>
         <div className="w-10 h-10 skeleton rounded-xl"></div>
      </div>
      
      {/* Body Skeleton */}
      <div className="p-6 space-y-8 flex-1">
        {[1, 2, 3].map((i) => (
           <div key={i} className="space-y-4">
              <div className="h-4 w-24 skeleton rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <div className="h-3 w-16 skeleton rounded"></div>
                    <div className="h-5 w-full skeleton rounded"></div>
                 </div>
                 <div className="space-y-2">
                    <div className="h-3 w-20 skeleton rounded"></div>
                    <div className="h-5 w-3/4 skeleton rounded"></div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  )
}

const FieldGroup = ({ title, children, className }: { title: string, children?: React.ReactNode, className?: string }) => (
  <div className={`mb-8 last:mb-0 ${className}`}>
    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3 select-none">
      {title}
      <div className="h-px bg-gray-100 flex-1"></div>
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
      {children}
    </div>
  </div>
);

interface FieldProps {
  label: string;
  value: string | null;
  fullWidth?: boolean;
  onSave?: (newValue: string) => void;
}

const Field = ({ label, value, fullWidth = false, onSave }: FieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  // Update temp value if prop changes externally
  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const displayValue = value && value !== 'null' ? value : '—';
  
  const handleCopy = () => {
     if (value) navigator.clipboard.writeText(value);
  };

  const handleStartEdit = () => {
    setTempValue(value || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(tempValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`
        flex flex-col group relative rounded-lg transition-colors duration-200
        ${fullWidth ? 'sm:col-span-2' : ''}
    `}>
      <div className="flex items-center gap-2 mb-1.5 h-4">
          <span className="text-xs font-medium text-gray-500 font-sans tracking-wide">{label}</span>
          
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <button 
                onClick={handleStartEdit}
                className="text-gray-400 hover:text-black transform hover:scale-110 active:scale-95 transition-all p-0.5"
                title="Редактировать"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button 
                onClick={handleCopy} 
                className="text-gray-400 hover:text-black transform hover:scale-110 active:scale-95 transition-all p-0.5"
                title="Копировать"
              >
                <ClipboardIcon className="w-3 h-3" />
              </button>
            </div>
          )}
      </div>

      {isEditing ? (
        <input 
          autoFocus
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="text-base leading-relaxed font-normal text-gray-900 bg-transparent border-b border-black outline-none w-full p-0 pb-0.5 placeholder-gray-300"
        />
      ) : (
        <span className="text-base leading-relaxed font-normal text-gray-900 break-words tracking-normal min-h-[1.5rem]">
          {displayValue}
        </span>
      )}
    </div>
  );
};

interface DataProps<T> {
  data: T;
  onUpdate?: (updatedData: T) => void;
}

const PassportResult = ({ data, onUpdate }: DataProps<PassportData>) => {
  
  const updateField = (key: keyof PassportData, val: string) => {
    if (onUpdate) {
      onUpdate({ ...data, [key]: val });
    }
  };

  return (
    <>
      <FieldGroup title="01. Личные данные">
        <Field label="Фамилия" value={data.lastName} onSave={(v) => updateField('lastName', v)} />
        <Field label="Имя" value={data.firstName} onSave={(v) => updateField('firstName', v)} />
        <Field label="Отчество" value={data.middleName} fullWidth onSave={(v) => updateField('middleName', v)} />
        <Field label="Дата рождения" value={data.birthDate} onSave={(v) => updateField('birthDate', v)} />
        <Field label="Место рождения" value={data.birthPlace} onSave={(v) => updateField('birthPlace', v)} />
        <Field label="СНИЛС" value={data.snils} onSave={(v) => updateField('snils', v)} />
      </FieldGroup>

      <FieldGroup title="02. Паспорт">
        <Field label="Серия / Номер" value={data.seriesNumber} onSave={(v) => updateField('seriesNumber', v)} />
        <Field label="Код подразделения" value={data.departmentCode} onSave={(v) => updateField('departmentCode', v)} />
        <Field label="Кем выдан" value={data.issuedBy} fullWidth onSave={(v) => updateField('issuedBy', v)} />
        <Field label="Дата выдачи" value={data.dateIssued} onSave={(v) => updateField('dateIssued', v)} />
      </FieldGroup>

      <FieldGroup title="03. Прописка">
        <Field label="Адрес регистрации" value={data.registration} fullWidth onSave={(v) => updateField('registration', v)} />
      </FieldGroup>
    </>
  );
};

const DiplomaResult = ({ data, onUpdate }: DataProps<DiplomaData>) => {

  const updateField = (key: keyof DiplomaData, val: string) => {
    if (onUpdate) {
      onUpdate({ ...data, [key]: val });
    }
  };

  return (
    <>
      <FieldGroup title="01. Выпускник">
        <Field label="Фамилия" value={data.lastName} onSave={(v) => updateField('lastName', v)} />
        <Field label="Имя" value={data.firstName} onSave={(v) => updateField('firstName', v)} />
        <Field label="Отчество" value={data.middleName} fullWidth onSave={(v) => updateField('middleName', v)} />
      </FieldGroup>

      <FieldGroup title="02. Образование">
        <Field label="Учебное заведение" value={data.institution} fullWidth onSave={(v) => updateField('institution', v)} />
        <Field label="Город" value={data.city} onSave={(v) => updateField('city', v)} />
        <Field label="Дата окончания" value={data.dateIssued} onSave={(v) => updateField('dateIssued', v)} />
      </FieldGroup>

      <FieldGroup title="03. Квалификация">
        <Field label="Специальность" value={data.specialty} fullWidth onSave={(v) => updateField('specialty', v)} />
        <Field label="Квалификация" value={data.qualification} fullWidth onSave={(v) => updateField('qualification', v)} />
      </FieldGroup>

      <FieldGroup title="04. Реквизиты">
        {data.series && <Field label="Серия" value={data.series} onSave={(v) => updateField('series', v)} />}
        <Field label="Номер" value={data.number} onSave={(v) => updateField('number', v)} />
        <Field label="Регистрационный номер" value={data.regNumber} fullWidth onSave={(v) => updateField('regNumber', v)} />
      </FieldGroup>
    </>
  );
};

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ item, onUpdate }) => {
  const { data, error, fileName, fileId } = item;
  const isPassport = data?.type === 'passport';

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[250px] border border-red-100 bg-red-50/20">
         <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-4 border border-red-100 shadow-sm">
             <DocumentIcon className="w-6 h-6 text-red-400" />
         </div>
         <h3 className="font-bold text-gray-900 mb-2 text-sm">{fileName}</h3>
         <p className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  if (data.type === 'raw') {
      return (
        <div className="glass-panel rounded-2xl overflow-hidden h-full flex flex-col">
             <div className="px-6 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-md shadow-sm border border-gray-100">
                    <DocumentIcon className="w-4 h-4 text-gray-500" />
                </div>
                <h3 className="font-semibold text-sm text-gray-900">{fileName}</h3>
                <span className="ml-auto text-xs font-bold text-gray-400 uppercase tracking-wider border border-gray-200 px-2 py-0.5 rounded">Raw Data</span>
             </div>
             <div className="p-6 flex-1 bg-white">
                <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-600 font-mono whitespace-pre-wrap border border-gray-200 leading-relaxed h-full overflow-auto max-h-[400px]">
                    {data.rawText}
                </div>
             </div>
        </div>
      )
  }

  const isDarkHeader = isPassport;

  const handleDataUpdate = (newData: AnalyzedDocument) => {
    if (onUpdate) {
      onUpdate(fileId, newData);
    }
  }

  return (
    <div className={`
        glass-panel rounded-2xl overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-gray-200/40 transition-all duration-500 group
    `}>
        {/* Card Header */}
        <div className={`
            px-6 py-6 border-b flex items-center justify-between relative overflow-hidden
            ${isDarkHeader ? 'bg-[#050505] text-white border-black' : 'bg-white text-gray-900 border-gray-100'}
        `}>
            {/* Subtle highlight for dark header */}
            {isDarkHeader && <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-[0.03] blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none"></div>}

            <div className="flex flex-col gap-1 relative z-10">
                <h3 className="font-bold text-xl tracking-tight leading-none">
                    {isPassport ? 'Паспорт РФ' : 'Диплом'}
                </h3>
                <p className={`text-xs font-mono opacity-60 uppercase tracking-widest ${isDarkHeader ? 'text-gray-400' : 'text-gray-500'}`}>
                    {fileName}
                </p>
            </div>
            <div className={`
                p-3 rounded-xl backdrop-blur-md border relative z-10 shadow-sm transition-transform duration-500 group-hover:scale-105
                ${isDarkHeader ? 'bg-white/10 border-white/10 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}
            `}>
                {isPassport ? <IdentificationIcon className="w-6 h-6" /> : <AcademicCapIcon className="w-6 h-6" />}
            </div>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 flex-1 bg-white/60">
            {isPassport ? 
              <PassportResult data={data as PassportData} onUpdate={handleDataUpdate} /> : 
              <DiplomaResult data={data as DiplomaData} onUpdate={handleDataUpdate} />
            }
        </div>
        
        {/* Card Footer */}
        <div className="bg-white/80 backdrop-blur-md px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-xs text-gray-500 font-medium tracking-wide">
                    AI Verified
                </span>
            </div>
           
            <div className="flex gap-1.5 opacity-20">
                <div className="w-1 h-1 rounded-full bg-black"></div>
                <div className="w-1 h-1 rounded-full bg-black"></div>
            </div>
        </div>
    </div>
  );
};