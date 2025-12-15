import React, { useMemo } from 'react';
import { ComplianceReport, ValidationRuleResult } from '../types';
import { calculateCompliance } from '../utils/businessRules';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon, BuildingOfficeIcon, SparklesIcon } from './icons';
import { useAppContext } from '../context/AppContext';
import { useUserProfile } from '../hooks/useUserProfile';

const ScoreGauge = ({ score }: { score: number }) => {
  // SVG Circle calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  let colorClass = "text-green-500";
  if (score < 50) colorClass = "text-red-500";
  else if (score < 80) colorClass = "text-yellow-500";

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
       {/* Background Circle */}
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

const CheckItem = ({ check }: { check: ValidationRuleResult }) => {
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
  const { analysisResults } = useAppContext();
  const userProfile = useUserProfile(analysisResults);
  
  const report: ComplianceReport = useMemo(() => calculateCompliance(userProfile), [userProfile]);

  const title = mode === 'nopriz' ? 'Внесение в НОПРИЗ' : 'Внесение в НОСТРОЙ';
  const subtitle = mode === 'nopriz' 
    ? 'Проверка документов для Национального объединения изыскателей и проектировщиков'
    : 'Автоматическая проверка документов на соответствие требованиям реестра';

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

                    <button 
                        disabled={report.status === 'error' || report.score === 0}
                        className={`
                            w-full py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2
                            ${report.status === 'error' || report.score === 0 
                                ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                                : 'bg-black hover:bg-gray-800 hover:-translate-y-0.5 shadow-black/20'
                            }
                        `}
                    >
                        <SparklesIcon className="w-4 h-4" />
                        <span>Сформировать заявку</span>
                    </button>
                    
                    {report.score > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-100 w-full text-left">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-3">Детализация</span>
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Документы</span>
                                    <span className="font-mono font-bold text-gray-900">
                                        {userProfile.passport.data ? 1 : 0} + {userProfile.diploma.data ? 1 : 0} + {userProfile.qualification.data ? 1 : 0} / 3
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Стаж (расчетный)</span>
                                    <span className="font-mono font-bold text-gray-900">N/A</span>
                                </div>
                            </div>
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