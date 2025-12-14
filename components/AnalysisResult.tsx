import React from 'react';
import { AnalysisItem, AnalyzedDocument } from '../types';
import { DocumentIcon } from './icons';
import { Field, FieldGroup } from './common/FormFields';
import { getDocumentSchema, DocumentSchema } from '../configs/documentSchemas';

interface AnalysisResultProps {
  item: AnalysisItem;
  onUpdate?: (fileId: string, newData: AnalyzedDocument) => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ item, onUpdate }) => {
  const { data, error, fileName, fileId } = item;
  
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

  // Handle RAW data (fallback)
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

  // Determine Schema
  const schema: DocumentSchema | null = getDocumentSchema(data.type);

  // Fallback for unknown types (should not happen with strict types but good for safety)
  if (!schema) {
      return (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
              Unknown document type: {data.type}
          </div>
      );
  }

  const Icon = schema.icon;
  const isDarkHeader = schema.isDarkHeader;

  const handleDataUpdate = (fieldKey: string, newValue: string) => {
    if (onUpdate) {
      onUpdate(fileId, { ...data, [fieldKey]: newValue });
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
                    {schema.title}
                </h3>
                <p className={`text-xs font-mono opacity-60 uppercase tracking-widest ${isDarkHeader ? 'text-gray-400' : 'text-gray-500'}`}>
                    {fileName}
                </p>
            </div>
            <div className={`
                p-3 rounded-xl backdrop-blur-md border relative z-10 shadow-sm transition-transform duration-500 group-hover:scale-105
                ${isDarkHeader ? 'bg-white/10 border-white/10 text-white' : 'bg-gray-50 border-gray-100 text-gray-900'}
            `}>
                <Icon className="w-6 h-6" />
            </div>
        </div>

        {/* Card Body - Generated from Schema */}
        <div className="p-6 sm:p-8 flex-1 bg-white/60">
            {schema.sections.map((section) => (
                <FieldGroup key={section.id} title={section.title}>
                    {section.fields.map((field) => (
                        <Field 
                            key={field.key}
                            label={field.label}
                            // @ts-ignore - dynamic key access
                            value={data[field.key]}
                            onSave={(val) => handleDataUpdate(field.key, val)}
                            fullWidth={field.fullWidth}
                        />
                    ))}
                </FieldGroup>
            ))}
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
