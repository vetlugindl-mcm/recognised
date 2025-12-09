import React, { useState, useEffect } from 'react';
import { PencilIcon, ClipboardIcon } from '../icons';

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

  const displayValue = value && value !== 'null' ? value : '—';
  
  const handleCopy = () => {
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
    <div className={`
        flex flex-col group relative rounded-lg transition-colors duration-200
        ${fullWidth ? 'sm:col-span-2' : ''}
    `}>
      <div className="flex items-center gap-2 mb-1.5 h-4">
          <span className="text-xs font-medium text-gray-500 font-sans tracking-wide">{label}</span>
          
          {!isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <button 
                onClick={handleStartEdit}
                className="text-gray-400 hover:text-black transform hover:scale-110 active:scale-95 transition-all p-0.5"
                title="Редактировать"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button 
                onClick={handleCopy} 
                className="text-gray-400 hover:text-black transform hover:scale-110 active:scale-95 transition-all p-0.5"
                title="Копировать"
              >
                <ClipboardIcon className="w-3 h-3" />
              </button>
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
          className="text-base leading-relaxed font-normal text-gray-900 bg-transparent border-b border-black outline-none w-full p-0 pb-0.5 placeholder-gray-300"
        />
      ) : (
        <span className="text-base leading-relaxed font-normal text-gray-900 break-words tracking-normal min-h-[1.5rem]">
          {displayValue}
        </span>
      )}
    </div>
  );
};