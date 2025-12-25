import React, { useState, useEffect } from 'react';
import { PencilIcon, ClipboardIcon, ExclamationCircleIcon } from '../icons';

export const FieldGroup: React.FC<{ title: string, children?: React.ReactNode, className?: string }> = ({ title, children, className }) => (
  <div className={`mb-8 last:mb-0 ${className}`}>
    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-3 select-none">
      {title}
      <div className="h-px bg-gray-100 flex-1"></div>
    </h4>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
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
  className?: string;
}

export const Field: React.FC<FieldProps> = ({ label, value, fullWidth = false, onSave, isHandwritten = false, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const [hasUserEdited, setHasUserEdited] = useState(false);

  useEffect(() => {
    setTempValue(value || '');
  }, [value]);

  const isValueEmpty = !value || (typeof value === 'string' && value.trim() === '') || value === 'null';
  const isTempEmpty = !tempValue || (typeof tempValue === 'string' && tempValue.trim() === '');
  const isHandwrittenWarning = !isValueEmpty && isHandwritten && !hasUserEdited;

  const handleCopy = (e: React.MouseEvent) => {
     e.stopPropagation();
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
    setHasUserEdited(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTempValue(value || '');
      setIsEditing(false);
    }
  };

  return (
    <div className={`
        group flex flex-col relative
        ${fullWidth ? 'col-span-1 sm:col-span-2' : ''}
        ${className}
    `}>
      {/* Top Label Row */}
      {/* Added min-h-[20px] to prevent layout shift when badge appears */}
      <div className="flex items-center justify-between mb-1.5 min-h-[20px]">
          <label 
            className="text-xs text-gray-500 uppercase tracking-wide font-semibold select-none truncate whitespace-nowrap" 
            title={label}
          >
              {label}
          </label>
          
          {/* Handwritten Warning Badge */}
          {!isEditing && isHandwrittenWarning && (
              <span className="flex items-center gap-1 text-[9px] text-red-600 font-bold uppercase tracking-wider bg-red-50 px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">
                  <ExclamationCircleIcon className="w-3 h-3" />
                  Check
              </span>
          )}
      </div>

      {/* Input / Display Area */}
      <div className="relative">
          {isEditing ? (
            <input 
              autoFocus
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={`
                w-full bg-white border rounded-lg px-3 py-2 text-sm text-gray-900 font-medium outline-none transition-all shadow-sm
                ${isTempEmpty 
                    ? 'border-red-300 ring-2 ring-red-100' 
                    : 'border-black ring-1 ring-black/10'
                }
              `}
            />
          ) : (
            <div 
                onClick={handleStartEdit}
                className={`
                    w-full min-h-[38px] px-3 py-2 rounded-lg border flex items-center justify-between cursor-text transition-all duration-200
                    ${isValueEmpty 
                        ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
                        : isHandwrittenWarning
                            ? 'bg-red-50/50 border-red-200 text-gray-900 shadow-sm shadow-red-100 hover:border-red-300'
                            : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-300 hover:shadow-sm'
                    }
                `}
            >
                {/* Content */}
                <span className={`text-sm font-medium truncate ${isValueEmpty ? 'text-red-500 italic' : 'text-gray-900'}`}>
                    {isValueEmpty ? 'Не заполнено' : value}
                </span>

                {/* Hover Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={(e) => { e.stopPropagation(); handleStartEdit(); }}
                        className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-200/50"
                     >
                        <PencilIcon className="w-3.5 h-3.5" />
                     </button>
                     {!isValueEmpty && (
                         <button 
                            onClick={handleCopy}
                            className="p-1 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-200/50"
                         >
                            <ClipboardIcon className="w-3.5 h-3.5" />
                         </button>
                     )}
                </div>
            </div>
          )}
      </div>
    </div>
  );
};