import React, { useMemo, useState } from 'react';
import { ComplianceReport, ValidationRuleResult } from '../types';
import { calculateCompliance } from '../utils/businessRules';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon, BuildingOfficeIcon, SparklesIcon, ArrowDownTrayIcon, LoaderIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { DocGeneratorService } from '../services/docGenerator';
import { StorageService } from '../services/storageService';
import { useNotification } from '../context/NotificationContext';

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  let colorClass = "text-green-500";
  if (score < 50) colorClass = "text-red-500";
  else if (score < 80) colorClass = "text-yellow-500";

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
       <svg className="w-full h-full transform -rotate-90">
         <circle
           cx="64"
           cy="64"
           r={radius}
           stroke="currentColor"
           strokeWidth="8"
           fill="transparent"
           className="text-gray-100"
         />
         <circle
           cx="64"
           cy="64"
           r={radius}
           stroke="currentColor"
           strokeWidth="8"
           fill="transparent"
           strokeDasharray={circumference}
           strokeDashoffset={offset}
           strokeLinecap="round"
           className={`${colorClass} transition-all duration-1000 ease-out`}
         />
       </svg>
       <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colorClass}`}>{score}%</span>
          <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Готовность</span>
       </div>
    </div>
  );
};

const CheckItem: React.FC<{ check: ValidationRuleResult }> = ({ check }) => {
    let icon = <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    let bgClass = "bg-green-50 border-green-100";
    
    if (check.status === 'error') {
        icon = <XMarkIcon className="w-5 h-5 text-red-500" strokeWidth={2.5} />;
        bgClass = "bg-red-50 border-red-100";
    } else if (check.status === 'warning') {
        icon = <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
        bgClass = "bg-yellow-50 border-yellow-100";
    }

    return (
        <div className={`flex items-start gap-4 p-4 rounded-xl border ${bgClass} transition-all`}>
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div>
                <h4 className="text-sm font-bold text-gray-900">{check.label}</h4>
                <p className="text-xs text-gray-600 mt-1">{check.message}</p>
            </div>
        </div>
    );
};

interface NostroyViewProps {
    mode?: 'nostroy' | 'nopriz';
}

export const NostroyView: React.FC<NostroyViewProps> = ({ mode = 'nostroy' }) => {
  const { analysisResults, templates } = useAppContext();
  const userProfile = useUserProfile(analysisResults);
  const { notify } = useNotification();
  
  const report: ComplianceReport = useMemo(() => calculateCompliance(userProfile), [userProfile]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionType, setActionType] = useState<'doc' | 'zip' | null>(null);

  const activeTemplate = templates.find(t => t.category === mode);
  const title = mode === 'nopriz' ? 'Внесение в НОПРИЗ' : 'Внесение в НОСТРОЙ';
  const subtitle = mode === 'nopriz' 
    ? 'Проверка документов для Национального объединения изыскателей и проектировщиков'
    : 'Автоматическая проверка документов на соответствие требованиям реестра';

  const canGenerate = report.status !== 'error' && report.score > 0 && !!activeTemplate;
  const missingTemplate = !activeTemplate;

  const handleGenerateDoc = async () => {
    if (!activeTemplate) return;
    setIsProcessing(true);
    setActionType('doc');
    try {
        const blob = await DocGeneratorService.generateDocumentBlob(activeTemplate.file, userProfile);
        const lastName = userProfile.passport.data?.lastName || 'Candidate';
        const fileName = `Заявление_${lastName}_${mode.toUpperCase()}.docx`;
        DocGeneratorService.saveBlob(blob, fileName);
        notify('success', 'Файл создан', fileName);
    } catch (e) {
        notify('error', 'Ошибка', 'Не удалось создать документ');
    } finally {
        setIsProcessing(false);
        setActionType(null);
    }
  };

  const handleGeneratePackage = async () => {
    if (!activeTemplate) return;
    setIsProcessing(true);
    setActionType('zip');
    try {
        // Hydrate source files from IDB
        const sourceFiles: File[] = [];
        const fileIds = analysisResults.map(r => r.fileId);
        
        for (const id of fileIds) {
            const file = await StorageService.getFile(id);
            if (file) sourceFiles.push(file);
        }

        if (sourceFiles.length === 0) {
            throw new Error("Исходные файлы не найдены в хранилище");
        }

        await DocGeneratorService.generatePackage(activeTemplate.file, userProfile, sourceFiles, mode);
        notify('success', 'Архив создан', 'Скачивание началось автоматически');
    } catch (e) {
        console.error(e);
        notify('error', 'Ошибка архивации', 'Не удалось создать ZIP архив');
    } finally {
        setIsProcessing(false);
        setActionType(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 flex flex-col gap-8">
       {/* Header */}
       <div className="flex items-center justify-between animate-enter">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <BuildingOfficeIcon className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                  <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
                  <p className="text-sm text-gray-500">{subtitle}</p>
              </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Summary Card */}
            <div className="lg:col-span-1 animate-enter" style={{ animationDelay: '100ms' }}>
                <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center shadow-lg shadow-gray-200/50">
                    <div className="mb-6">
                        <ScoreGauge score={report.score} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {report.score === 100 ? "Кандидат подходит" : "Есть замечания"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        {report.summary}
                    </p>

                    <div className="w-full space-y-3">
                        <button 
                            onClick={handleGeneratePackage}
                            disabled={!canGenerate || isProcessing}
                            className={`
                                w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                                ${!canGenerate || isProcessing
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                    : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 shadow-black/20'
                                }
                            `}
                        >
                            {isProcessing && actionType === 'zip' ? (
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                            ) : (
                                <SparklesIcon className="w-4 h-4" />
                            )}
                            <span>Сформировать пакет (ZIP)</span>
                        </button>

                        <button 
                            onClick={handleGenerateDoc}
                            disabled={!canGenerate || isProcessing}
                            className={`
                                w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all flex items-center justify-center gap-2
                                ${!canGenerate || isProcessing
                                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                }
                            `}
                        >
                             {isProcessing && actionType === 'doc' ? (
                                <LoaderIcon className="w-4 h-4 animate-spin" />
                            ) : (
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            )}
                            <span>Только заявление</span>
                        </button>
                    </div>
                    
                    {missingTemplate && (
                         <div className="mt-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 w-full text-center">
                             Шаблон {mode.toUpperCase()} не загружен
                         </div>
                    )}
                </div>
            </div>

            {/* Right Column: Detailed Checklist */}
            <div className="lg:col-span-2 space-y-4 animate-enter" style={{ animationDelay: '200ms' }}>
                 <div className="flex items-center justify-between px-1 mb-2">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Результаты проверки</h4>
                 </div>

                 {report.checks.length === 0 ? (
                    <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center text-center text-gray-400">
                        <BuildingOfficeIcon className="w-10 h-10 mb-3 opacity-20" />
                        <p>Загрузите документы в разделе "Загрузка документов" для начала проверки.</p>
                    </div>
                 ) : (
                    <div className="space-y-4">
                        {report.checks.map((check) => (
                            <CheckItem key={check.id} check={check} />
                        ))}
                    </div>
                 )}
            </div>
        </div>
    </div>
  );
};