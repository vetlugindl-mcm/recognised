import React, { useState } from 'react';
import { Dropzone } from './Dropzone';
import { DocumentTemplate } from '../types';
import { DocGeneratorService } from '../services/docGenerator';
import { StorageService } from '../services/storageService';
import { useAppContext } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { VARIABLES_DATA } from '../configs/templateVariables';
import { 
  DocumentIcon, 
  TagIcon, 
  TrashIcon, 
  Square2StackIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClipboardIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  RocketLaunchIcon,
  LoaderIcon
} from './icons';

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
           
           {/* Search Bar */}
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

        {/* Modal Body - Scrollable */}
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

export const TemplatesView: React.FC = () => {
  const { templates, setTemplates, analysisResults } = useAppContext();
  const userProfile = useUserProfile(analysisResults);
  
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleFilesAdded = async (files: File[]) => {
    const newTemplates: DocumentTemplate[] = [];

    for (const file of files) {
        const id = Math.random().toString(36).substring(7);
        
        // Save to IndexedDB
        await StorageService.saveFile(id, file);

        // Mock variable detection
        const mockVars = [];
        if (file.name.toLowerCase().includes('dogovor') || file.name.toLowerCase().includes('contract')) {
            mockVars.push('passport_last_name', 'passport_series_number');
        } else {
            mockVars.push('passport_last_name', 'snils');
        }

        newTemplates.push({
            id,
            file,
            name: file.name,
            uploadDate: new Date(),
            variables: mockVars,
            size: file.size
        });
    }

    setTemplates(prev => [...prev, ...newTemplates]);
  };

  const handleRemove = async (id: string) => {
    // Remove from State
    setTemplates(prev => prev.filter(t => t.id !== id));
    // Remove from IndexedDB
    await StorageService.deleteFile(id);
  };

  const handleGenerate = async (template: DocumentTemplate) => {
    setGeneratingId(template.id);
    try {
        await DocGeneratorService.generateDocument(template.file, userProfile);
    } catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        } else {
            console.error("Generation failed:", error);
            alert("Произошла неизвестная ошибка при генерации документа.");
        }
    } finally {
        setGeneratingId(null);
    }
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
                  <p className="text-sm text-gray-500">Загрузите .docx файлы для генерации заявлений</p>
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
              subtitle="Поддерживаются .DOCX с переменными {var}"
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
                              {/* Changed to Grayscale/Black for Premium Utility */}
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
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                              <button onClick={() => handleRemove(template.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>

                      <div className="mt-auto space-y-4">
                          <button 
                            onClick={() => handleGenerate(template)}
                            disabled={generatingId === template.id}
                            className="w-full py-2.5 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                             {generatingId === template.id ? (
                                <>
                                  <LoaderIcon className="w-4 h-4 animate-spin" />
                                  <span>Генерация...</span>
                                </>
                             ) : (
                                <>
                                  <RocketLaunchIcon className="w-4 h-4" />
                                  <span>Заполнить заявление</span>
                                </>
                             )}
                          </button>
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