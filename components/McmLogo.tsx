
import React from 'react';

export const McmLogo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Main Title */}
      <div className="leading-none flex">
        <span className="font-black text-gray-900 text-3xl tracking-tighter">MCM</span>
      </div>
      
      {/* Subtitle - Perfectly Justified */}
      <div className="w-full flex justify-between mt-[3px] px-[1px]">
        {['S', 'E', 'R', 'V', 'I', 'C', 'E'].map((char, index) => (
          <span key={index} className="text-[9px] font-bold text-gray-400 block leading-none">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};
