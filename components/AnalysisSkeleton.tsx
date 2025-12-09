import React from 'react';

export const AnalysisSkeleton: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-full min-h-[400px]">
      {/* Header Skeleton */}
      <div className="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between bg-white/40">
         <div className="flex flex-col gap-2">
            <div className="h-6 w-32 skeleton rounded-md"></div>
            <div className="h-4 w-24 skeleton rounded-md"></div>
         </div>
         <div className="w-10 h-10 skeleton rounded-xl"></div>
      </div>
      
      {/* Body Skeleton */}
      <div className="p-6 space-y-8 flex-1">
        {[1, 2, 3].map((i) => (
           <div key={i} className="space-y-4">
              <div className="h-4 w-24 skeleton rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <div className="h-3 w-16 skeleton rounded"></div>
                    <div className="h-5 w-full skeleton rounded"></div>
                 </div>
                 <div className="space-y-2">
                    <div className="h-3 w-20 skeleton rounded"></div>
                    <div className="h-5 w-3/4 skeleton rounded"></div>
                 </div>
              </div>
           </div>
        ))}
      </div>
    </div>
  );
};