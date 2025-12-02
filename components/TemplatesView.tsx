import React, { useState } from 'react';
import { Dropzone } from './Dropzone';
import { DocumentTemplate } from '../types';
import { 
  DocumentIcon, 
  TagIcon, 
  EyeIcon, 
  ArrowDownTrayIcon, 
  TrashIcon, 
  Square2StackIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClipboardIcon,
  CheckIcon
} from './icons';

interface VariableGroup {
  category: string;
  fields: { label: string; variable: string }[];
}

// Mapping database fields from types.ts (PassportData, DiplomaData) to Template Variables
const VARIABLES_DATA: VariableGroup[] = [
  {
    category: 'Паспорт РФ',
    fields: [
      { label: 'Фамилия', variable: '{{passport_last_name}}' },
      { label: 'Имя', variable: '{{passport_first_name}}' },
      { label: 'Отчество', variable: '{{passport_middle_name}}' },
      { label: 'Серия и Номер', variable: '{{passport_series_number}}' },
      { label: 'Дата выдачи', variable: '{{passport_date_issued}}' },
      { label: 'Код подразделения', variable: '{{passport_department_code}}' },
      { label: 'Кем выдан', variable: '{{passport_issued_by}}' },
      { label: 'Дата рождения', variable: '{{passport_birth_date}}' },
      { label: 'Место рождения', variable: '{{passport_birth_place}}' },
      { label: 'Адрес регистрации', variable: '{{passport_registration}}' },
      { label: 'СНИЛС', variable: '{{snils}}' },
    ]
  },
  {
    category: 'Диплом об образовании',
    fields: [
      { label: 'Фамилия', variable: '{{diploma_last_name}}' },
      { label: 'Имя', variable: '{{diploma_first_name}}' },
      { label: 'Отчество', variable: '{{diploma_middle_name}}' },
      { label: 'Серия', variable: '{{diploma_series}}' },
      { label: 'Номер', variable: '{{diploma_number}}' },
      { label: 'Регистрационный номер', variable: '{{diploma_reg_number}}' },
      { label: 'Учебное заведение', variable: '{{diploma_institution}}' },
      { label: 'Город', variable: '{{diploma_city}}' },
      { label: 'Специальность', variable: '{{diploma_specialty}}' },
      { label: 'Квалификация', variable: '{{diploma_qualification}}' },
      { label: 'Дата выдачи', variable: '{{diploma_date_issued}}' },
    ]
  }
];

const VariablesGuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl relative animate-enter z-10 bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
           <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
               <TagIcon className="w-5 h-5 text-gray-900" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-gray-900">Справочник переменных</h3>
               <p className="text-xs text-gray-500">Нажмите на переменную, чтобы скопировать</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
             <XMarkIcon className="w-6 h-6" />
           </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {VARIABLES_DATA.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                {group.category}
                <div className="h-px bg-gray-100 flex-1"></div>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {group.fields.map((field) => (
                  <button
                    key={field.variable}
                    onClick={() => handleCopy(field.variable)}
                    className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all text-left"
                  >
                    <span className="text-xs font-medium text-gray-500">{field.label}</span>
                    <div className="flex items-center gap-2">
                      <code className="text-[11px] font-mono font-bold text-gray-900 bg-gray-200/50 px-1.5 py-0.5 rounded">
                        {field.variable}
                      </code>
                      <div className="w-4 h-4 flex items-center justify-center text-gray-400">
                        {copiedVar === field.variable ? (
                          <CheckIcon className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <ClipboardIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const TemplatesView: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleFilesAdded = (files: File[]) => {
    const newTemplates: DocumentTemplate[] = files.map(file => {
      // Mock variable detection based on file content/name
      const mockVars = [];
      if (file.name.toLowerCase().includes('dogovor') || file.name.toLowerCase().includes('contract')) {
        mockVars.push('company_name', 'director_name', 'date_start', 'amount');
      } else {
        mockVars.push('passport_last_name', 'passport_series_number', 'snils');
      }

      return {
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        uploadDate: new Date(),
        variables: mockVars,
        size: file.size
      };
    });

    setTemplates(prev => [...prev, ...newTemplates]);
  };

  const handleRemove = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      <div className="max-w-5xl mx-auto pb-10 flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Square2StackIcon className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Шаблоны документов</h1>
                  <p className="text-sm text-gray-500">Загрузите .docx файлы для генерации документов</p>
              </div>
          </div>
          
          <button 
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700"
          >
            <InformationCircleIcon className="w-5 h-5 text-gray-400" />
            <span className="hidden sm:inline">Справочник переменных</span>
          </button>
        </div>

        {/* Upload Area */}
        <section className="animate-enter">
          <Dropzone 
              onFilesAdded={handleFilesAdded} 
              title="Загрузить шаблон"
              subtitle="Поддерживаются .DOCX с переменными {{var}}"
              accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
          />
        </section>

        {/* Templates Grid */}
        {templates.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 animate-enter" style={{ animationDelay: '100ms' }}>
              {templates.map((template) => (
                  <div key={template.id} className="glass-panel rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center border border-blue-100">
                                  <DocumentIcon className="w-5 h-5" />
                              </div>
                              <div>
                                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 break-all" title={template.name}>
                                      {template.name}
                                  </h3>
                                  <p className="text-xs text-gray-400">
                                      {(template.size / 1024).toFixed(1)} KB • {template.uploadDate.toLocaleDateString()}
                                  </p>
                              </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                  <EyeIcon className="w-4 h-4" />
                              </button>
                              <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                                  <ArrowDownTrayIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleRemove(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>

                      <div className="mt-auto">
                          <div className="flex items-center gap-2 mb-2">
                              <TagIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Переменные</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                              {template.variables.map(v => (
                                  <span key={v} className="px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-[11px] font-mono text-gray-600">
                                      {`{{${v}}}`}
                                  </span>
                              ))}
                          </div>
                      </div>
                  </div>
              ))}
          </section>
        )}
      </div>

      <VariablesGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};