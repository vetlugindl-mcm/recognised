import React, { useState, useEffect } from 'react';
import { PencilIcon, ClipboardIcon, ExclamationCircleIcon } from '../icons';

export const FieldGroup: React.FC<{ title: string, children?: React.ReactNode, className?: string }> = ({ title, children, className }) => (
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
  isHandwritten?: boolean; // Controls the red highlighting
}

export const Field: React.FC<FieldProps> = ({ label, value, fullWidth = false, onSave, isHandwritten = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  // New state: Tracks if the user has manually approved/edited this field in this session
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Update temp value if prop changes externally
  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  // Validation Logic
  const isValueEmpty = !value || (typeof value === 'string' && value.trim() === '') || value === 'null';
  const isTempEmpty = !tempValue || (typeof tempValue === 'string' && tempValue.trim() === '');
  
  // Warning State logic:
  // 1. Must not be empty (empty fields have their own error state)
  // 2. Must be flagged by AI as handwritten
  // 3. User MUST NOT have edited it yet. If they edited it, we trust them.
  const isHandwrittenWarning = !isValueEmpty && isHandwritten && !hasUserEdited;

  const handleCopy = () => {
     if (value && !isValueEmpty) navigator.clipboard.writeText(value);
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
    // Mark as verified by user interaction
    setHasUserEdited(true);
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
        flex flex-col group relative rounded-lg transition-all duration-300
        ${fullWidth ? 'sm:col-span-2' : ''}
        ${!isEditing && isValueEmpty 
            ? 'bg-red-50 -mx-2 px-2 py-1 border border-red-200' 
            : !isEditing && isHandwrittenWarning
                ? 'bg-red-50 -mx-2 px-2 py-1 border border-red-200 shadow-sm shadow-red-100' // Warning Highlight
                : 'py-1 border border-transparent' // Normal State (or User Verified)
        }
    `}>
      {/* Header Row: Label + Badge + Right-Aligned Actions */}
      <div className="flex items-center justify-between mb-1.5 min-h-[1.25rem]">
          <div className="flex items-center gap-2">
            <span className={`
                text-xs font-medium font-sans tracking-wide transition-colors
                ${!isEditing && isValueEmpty ? 'text-red-600' : ''}
                ${!isEditing && isHandwrittenWarning ? 'text-red-600' : 'text-gray-500'}
            `}>
                {label}
            </span>
            
            {/* Handwritten Badge - Explicitly Red */}
            {!isEditing && isHandwrittenWarning && (
                <div className="flex items-center gap-1 bg-red-100 px-1.5 py-0.5 rounded text-[10px] text-red-700 font-bold leading-none select-none border border-red-200">
                    <PencilIcon className="w-3 h-3" />
                    <span>Проверьте данные</span>
                </div>
            )}
          </div>
          
          {/* Action Icons - Right Aligned (Material Design Style) */}
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
               <button 
                onClick={handleStartEdit}
                className={`
                    p-1 rounded-md transition-colors 
                    ${isValueEmpty || isHandwrittenWarning 
                        ? 'text-red-500 hover:bg-red-100 hover:text-red-700' 
                        : 'text-gray-400 hover:bg-gray-100 hover:text-black'
                    }
                `}
                title="Редактировать"
              >
                <PencilIcon className="w-3.5 h-3.5" />
              </button>
              {!isValueEmpty && (
                <button 
                    onClick={handleCopy} 
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-black transition-colors"
                    title="Копировать"
                >
                    <ClipboardIcon className="w-3.5 h-3.5" />
                </button>
              )}
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
          placeholder="Введите значение"
          className={`
            text-base leading-relaxed font-normal bg-transparent border-b outline-none w-full p-0 pb-0.5 transition-colors
            ${isTempEmpty 
                ? 'border-red-500 text-gray-900 placeholder-red-300' 
                : 'border-black text-gray-900 placeholder-gray-300'
            }
          `}
        />
      ) : (
        <div className="flex items-center gap-2 min-h-[1.5rem]">
            {isValueEmpty ? (
                <div className="flex items-center gap-1.5 animate-enter">
                    <ExclamationCircleIcon className="w-4 h-4 text-red-500" />
                    <span className="text-base leading-relaxed font-medium text-red-500 break-words tracking-normal">
                        Не распознано
                    </span>
                </div>
            ) : (
                <span className={`
                    text-base leading-relaxed font-normal break-words tracking-normal 
                    ${isHandwrittenWarning ? 'text-gray-900' : 'text-gray-900'}
                `}>
                    {value}
                </span>
            )}
        </div>
      )}
    </div>
  );
};