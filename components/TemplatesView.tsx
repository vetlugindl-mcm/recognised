import React, { useState } from 'react';
import { Dropzone } from './Dropzone';
import { DocumentTemplate, TemplateCategory } from '../types';
import { StorageService } from '../services/storageService';
import { useAppContext } from '../context/AppContext';
import { 
  DocumentIcon, 
  TrashIcon, 
  Square2StackIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  TagIcon,
  BuildingOfficeIcon,
  CitySkylineIcon
} from './icons';
import { VARIABLES_DATA } from '../configs/templateVariables';

const VariablesGuideModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const handleCopy = (variable: string) => {
    navigator.clipboard.writeText(variable);
    setCopiedVar(variable);
    setTimeout(() => setCopiedVar(null), 1500);
  };

  const filteredGroups = VARIABLES_DATA.map(group => ({
    ...group,
    fields: group.fields.filter(f => 
      f.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      f.variable.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.fields.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="glass-panel w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl relative animate-enter z-10 bg-white">
        {/* Modal Header */}
        <div className="flex flex-col px-6 py-5 border-b border-gray-100 bg-white rounded-t-2xl z-20">
           <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <TagIcon className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                    <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">Справочник переменных</h3>
                    <p className="text-xs text-gray-500 leading-none">Нажмите на переменную, чтобы скопировать</p>
                    </div>
               </div>
               <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
               </button>
           </div>
           
           <div className="relative">
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                    type="text" 
                    placeholder="Поиск переменной..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-1 focus:ring-black transition-all"
                />
           </div>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {filteredGroups.length > 0 ? (
              filteredGroups.map((group, idx) => (
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
            ))
          ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                  Переменные не найдены
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TemplateSlot = ({ 
    category, 
    template, 
    onAdd, 
    onRemove 
}: { 
    category: TemplateCategory, 
    template?: DocumentTemplate, 
    onAdd: (files: File[], category: TemplateCategory) => void,
    onRemove: (id: string) => void 
}) => {
    const isNostroy = category === 'nostroy';
    const Icon = isNostroy ? BuildingOfficeIcon : CitySkylineIcon;
    const title = isNostroy ? "Шаблон НОСТРОЙ" : "Шаблон НОПРИЗ";
    const desc = isNostroy ? "Заявление для строителей" : "Заявление для проектировщиков";

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg border ${isNostroy ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">{desc}</p>
                </div>
            </div>

            <div className="flex-1">
                {template ? (
                    <div className="glass-panel rounded-2xl p-5 hover:shadow-lg transition-all duration-300 group flex flex-col h-full border-gray-200 bg-white">
                         <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 text-gray-900 rounded-lg flex items-center justify-center border border-gray-200">
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
                            <button 
                                onClick={() => onRemove(template.id)} 
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-green-600 font-medium">
                            <CheckIcon className="w-4 h-4" />
                            <span>Шаблон активен</span>
                        </div>
                    </div>
                ) : (
                    <Dropzone 
                        onFilesAdded={(files) => onAdd(files, category)} 
                        title="Загрузить .docx"
                        subtitle="Перетащите файл шаблона"
                        accept=".docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    />
                )}
            </div>
        </div>
    );
};

export const TemplatesView: React.FC = () => {
  const { templates, setTemplates } = useAppContext();
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleFilesAdded = async (files: File[], category: TemplateCategory) => {
    if (files.length === 0) return;
    const file = files[0]; // Take first file only

    // Remove existing template for this category if exists
    const existing = templates.find(t => t.category === category);
    if (existing) {
        await handleRemove(existing.id);
    }

    const id = crypto.randomUUID();
    
    // Save to IndexedDB
    await StorageService.saveFile(id, file);

    const newTemplate: DocumentTemplate = {
        id,
        file,
        name: file.name,
        uploadDate: new Date(),
        variables: [], // Can implement scanning later
        size: file.size,
        category
    };

    setTemplates(prev => [...prev.filter(t => t.category !== category), newTemplate]);
  };

  const handleRemove = async (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    await StorageService.deleteFile(id);
  };

  const nostroyTemplate = templates.find(t => t.category === 'nostroy');
  const noprizTemplate = templates.find(t => t.category === 'nopriz');

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
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Реестр шаблонов</h1>
                  <p className="text-sm text-gray-500">Управление шаблонами заявлений для генерации</p>
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

        {/* Template Slots */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-enter">
            <TemplateSlot 
                category="nostroy" 
                template={nostroyTemplate} 
                onAdd={handleFilesAdded} 
                onRemove={handleRemove} 
            />
            <TemplateSlot 
                category="nopriz" 
                template={noprizTemplate} 
                onAdd={handleFilesAdded} 
                onRemove={handleRemove} 
            />
        </section>

        <section className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4 animate-enter" style={{ animationDelay: '100ms' }}>
            <InformationCircleIcon className="w-6 h-6 text-blue-500 shrink-0" />
            <div>
                <h4 className="text-sm font-bold text-blue-900 mb-1">Как это работает?</h4>
                <p className="text-xs text-blue-700 leading-relaxed">
                    Загрузите "болванки" .docx файлов для каждой категории. Система будет автоматически использовать их 
                    в разделах НОСТРОЙ и НОПРИЗ для заполнения данными, которые были извлечены из паспорта и диплома.
                </p>
            </div>
        </section>
      </div>

      <VariablesGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};