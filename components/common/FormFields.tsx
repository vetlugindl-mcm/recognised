import React, { useState, useEffect } from 'react';
import { PencilIcon, ClipboardIcon, ExclamationCircleIcon } from '../icons';

export const FieldGroup = ({ title, children, className }: { title: string, children?: React.ReactNode, className?: string }) => (
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

export interface FieldProps {
  label: string;
  value: string | null;
  fullWidth?: boolean;
  onSave?: (newValue: string) => void;
}

export const Field = ({ label, value, fullWidth = false, onSave }: FieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');

  // Helper to determine strict emptiness based on OCR artifacts
  const checkIsEmpty = (v: string | null | undefined) => {
      return !v || v === 'null' || (typeof v === 'string' && v.trim() === '');
  };

  const isEmpty = checkIsEmpty(value);
  const isTempEmpty = checkIsEmpty(tempValue);

  // Update temp value if prop changes externally
  useEffect(() => {
    setTempValue(value || '');
  }, [value]);
  
  const handleCopy = (e: React.MouseEvent) => {
     e.stopPropagation();
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
    <div 
        className={`
            flex flex-col group relative rounded-lg transition-colors duration-200
            ${fullWidth ? 'sm:col-span-2' : ''}
        `}
    >
      <div className="flex items-center gap-2 mb-1.5 h-4">
          <span className={`text-xs font-medium font-sans tracking-wide transition-colors ${isEmpty ? 'text-red-500' : 'text-gray-500'}`}>
              {label}
          </span>
          
          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <button 
                onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
                className="text-gray-400 hover:text-black transform hover:scale-110 active:scale-95 transition-all p-0.5"
                title="Редактировать"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              {!isEmpty && (
                <button 
                    onClick={handleCopy} 
                    className="text-gray-400 hover:text-black transform hover:scale-110 active:scale-95 transition-all p-0.5"
                    title="Копировать"
                >
                    <ClipboardIcon className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
      </div>

      {isEditing ? (
        <div className="relative">
            <input 
            autoFocus
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Введите значение..."
            className={`
                text-base leading-relaxed font-normal bg-transparent outline-none w-full p-0 pb-0.5 transition-colors
                ${isTempEmpty 
                    ? 'border-b border-red-500 text-red-900 placeholder-red-300' 
                    : 'border-b border-black text-gray-900 placeholder-gray-300'
                }
            `}
            />
            {isTempEmpty && (
                <div className="absolute right-0 top-0 bottom-0 flex items-center pointer-events-none">
                     <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Обязательно</span>
                </div>
            )}
        </div>
      ) : (
        <div 
            onClick={handleStartEdit}
            className={`
                text-base leading-relaxed font-normal break-words tracking-normal min-h-[1.75rem] flex items-center rounded-md cursor-pointer -ml-2 px-2 py-0.5 transition-all duration-200
                ${isEmpty 
                    ? 'text-red-500 bg-red-50 border border-red-100/50 hover:bg-red-100' 
                    : 'text-gray-900 hover:bg-gray-100 border border-transparent'
                }
            `}
        >
          {isEmpty ? (
              <div className="flex items-center gap-1.5">
                  <ExclamationCircleIcon className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium">Не распознано</span>
              </div>
          ) : (
              value
          )}
        </div>
      )}
    </div>
  );
};