
import React from 'react';
import { AnalysisItem, DiplomaData, PassportData } from '../types';
import { SparklesIcon, CheckCircleIcon, DocumentIcon } from './Icons';

interface AnalysisResultProps {
  item: AnalysisItem;
}

const FieldGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-1">
      {title}
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

const Field = ({ label, value, fullWidth = false }: { label: string, value: string | null, fullWidth?: boolean }) => {
  const displayValue = value && value !== 'null' ? value : '—';
  return (
    <div className={`flex flex-col ${fullWidth ? 'md:col-span-2' : ''}`}>
      <span className="text-[10px] sm:text-xs text-indigo-400 font-medium mb-1">{label}</span>
      <span className="text-sm sm:text-base font-semibold text-gray-800 break-words leading-tight">
        {displayValue}
      </span>
    </div>
  );
};

// Render Passport Data
const PassportResult = ({ data }: { data: PassportData }) => (
  <>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-100 rounded-lg">
           <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">Паспорт РФ</h3>
      </div>
      <div className="text-xs font-medium px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
        AI Passport
      </div>
    </div>

    <FieldGroup title="Личные данные">
      <Field label="Фамилия" value={data.lastName} />
      <Field label="Имя" value={data.firstName} />
      <Field label="Отчество" value={data.middleName} fullWidth />
      <Field label="Дата рождения" value={data.birthDate} />
      <Field label="Место рождения" value={data.birthPlace} />
    </FieldGroup>

    <FieldGroup title="Данные документа">
      <Field label="Серия и Номер" value={data.seriesNumber} />
      <Field label="Дата выдачи" value={data.dateIssued} />
      <Field label="Код подразделения" value={data.departmentCode} />
      <Field label="Кем выдан" value={data.issuedBy} fullWidth />
    </FieldGroup>

    <FieldGroup title="Регистрация">
      <Field label="Прописка" value={data.registration} fullWidth />
    </FieldGroup>
  </>
);

// Render Diploma Data
const DiplomaResult = ({ data }: { data: DiplomaData }) => (
  <>
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
           <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
        </div>
        <h3 className="font-bold text-gray-800 text-lg">Диплом</h3>
      </div>
      <div className="text-xs font-medium px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100">
        AI Diploma
      </div>
    </div>

    <FieldGroup title="Выпускник">
      <Field label="Фамилия" value={data.lastName} />
      <Field label="Имя" value={data.firstName} />
      <Field label="Отчество" value={data.middleName} fullWidth />
    </FieldGroup>

    <FieldGroup title="Учебное заведение">
      <Field label="Наименование" value={data.institution} fullWidth />
      <Field label="Город" value={data.city} />
      <Field label="Дата выдачи" value={data.dateIssued} />
    </FieldGroup>

    <FieldGroup title="Квалификация">
      <Field label="Специальность" value={data.specialty} fullWidth />
      <Field label="Квалификация (Степень)" value={data.qualification} fullWidth />
    </FieldGroup>

    <FieldGroup title="Реквизиты документа">
      {data.series && <Field label="Серия" value={data.series} />}
      <Field label="Номер" value={data.number} />
      <Field label="Регистрационный номер" value={data.regNumber} fullWidth />
    </FieldGroup>
  </>
);

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ item }) => {
  const { data, error, fileName } = item;

  if (error) {
    return (
      <div className="animate-in fade-in zoom-in-95 duration-500 bg-red-50 rounded-2xl p-6 border border-red-100 shadow-sm">
         <div className="flex items-center gap-3 mb-2">
            <DocumentIcon className="w-5 h-5 text-red-400" />
            <span className="text-sm font-semibold text-red-700">{fileName}</span>
         </div>
         <p className="text-sm text-red-600 ml-8">{error}</p>
      </div>
    );
  }

  if (!data) return null;

  // If JSON parsing failed entirely or unknown type, we have raw text
  if (data.type === 'raw') {
      return (
        <div className="animate-in fade-in zoom-in-95 duration-500 bg-orange-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
             <div className="flex items-center gap-2 mb-3 pb-3 border-b border-orange-200/50">
                <DocumentIcon className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-semibold text-gray-700">{fileName}</span>
             </div>
            <h3 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <span className="text-xl">⚠️</span> Частичное распознавание
            </h3>
            <p className="text-sm text-orange-800 mb-4">
                Не удалось автоматически определить тип документа. Вот что удалось прочитать:
            </p>
            <div className="bg-white p-4 rounded-xl border border-orange-100 font-mono text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap max-h-60 scrollbar-thin">
                {data.rawText}
            </div>
        </div>
      )
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 slide-in-from-bottom-4">
      <div className="relative bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden">
        
        {/* File Indicator Header */}
        <div className="bg-gray-50/80 px-6 py-2 border-b border-gray-100 flex items-center gap-2">
             <DocumentIcon className="w-4 h-4 text-gray-400" />
             <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Файл: {fileName}</span>
        </div>

        {/* Decorative Top Bar */}
        <div className={`h-1.5 bg-gradient-to-r ${data.type === 'passport' ? 'from-emerald-400 via-teal-500 to-cyan-500' : 'from-indigo-500 via-purple-500 to-pink-500'}`}></div>

        <div className="p-6 md:p-8">
          {data.type === 'passport' ? (
            <PassportResult data={data} />
          ) : data.type === 'diploma' ? (
            <DiplomaResult data={data} />
          ) : (
             <div className="text-center text-gray-500 py-10">Неизвестный тип данных</div>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
           <span>Проверьте корректность данных</span>
           <span className="flex items-center gap-1">
             <SparklesIcon className="w-3 h-3 text-yellow-500" /> Gemini 2.5 Flash
           </span>
        </div>
      </div>
    </div>
  );
};
