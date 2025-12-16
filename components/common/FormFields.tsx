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

  // Update temp value if prop changes externally
  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  // Validation Logic
  // Check if the actual value passed to the component is "empty"
  const isValueEmpty = !value || (typeof value === 'string' && value.trim() === '') || value === 'null';
  
  // Check if the temporary value (while editing) is empty
  const isTempEmpty = !tempValue || (typeof tempValue === 'string' && tempValue.trim() === '');

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
        ${!isEditing && isValueEmpty ? 'bg-red-50/50 -mx-2 px-2 py-1 border border-red-100/50' : 'py-1 border border-transparent'}
    `}>
      <div className="flex items-center gap-2 mb-1.5 h-4">
          <span className={`text-xs font-medium font-sans tracking-wide transition-colors ${!isEditing && isValueEmpty ? 'text-red-500' : 'text-gray-500'}`}>
            {label}
          </span>
          
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-auto sm:ml-0">
               <button 
                onClick={handleStartEdit}
                className={`transform hover:scale-110 active:scale-95 transition-all p-0.5 ${isValueEmpty ? 'text-red-400 hover:text-red-600' : 'text-gray-400 hover:text-black'}`}
                title="Редактировать"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              {!isValueEmpty && (
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
                <span className="text-base leading-relaxed font-normal text-gray-900 break-words tracking-normal">
                    {value}
                </span>
            )}
        </div>
      )}
    </div>
  );
};