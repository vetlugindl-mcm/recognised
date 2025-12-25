import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, MinusIcon, ArrowDownTrayIcon } from './icons';

interface ImageZoomProps {
  src: string;
  alt?: string;
}

export const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt = "Preview" }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when src changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [src]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Zoom factor
    const delta = e.deltaY * -0.002;
    const newScale = Math.min(Math.max(1, scale + delta), 5);
    
    setScale(newScale);

    // Reset position if zoomed out completely
    if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 5));
  const handleZoomOut = () => {
      setScale(s => {
          const next = Math.max(1, s - 0.5);
          if (next === 1) setPosition({ x: 0, y: 0 });
          return next;
      });
  };
  const handleReset = () => {
      setScale(1);
      setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black/5 flex flex-col group">
      
      {/* Viewport */}
      <div 
        ref={containerRef}
        className={`flex-1 w-full h-full flex items-center justify-center overflow-hidden cursor-${isDragging ? 'grabbing' : scale > 1 ? 'grab' : 'default'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img 
            src={src} 
            alt={alt}
            draggable={false}
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)'
            }}
            className="max-w-full max-h-full object-contain select-none"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 z-[80]">
         <div className="flex items-center p-1 bg-gray-900/80 backdrop-blur-md rounded-full border border-white/10 shadow-2xl">
            <button 
                onClick={handleZoomOut} 
                className="p-2.5 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                disabled={scale <= 1}
                title="Уменьшить"
            >
                <MinusIcon className="w-5 h-5" />
            </button>
            
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            
            <button 
                onClick={handleReset} 
                className="px-3 text-xs font-bold text-white uppercase hover:text-white/80 transition-colors"
                title="Сбросить масштаб"
            >
                {Math.round(scale * 100)}%
            </button>

            <div className="w-px h-4 bg-white/20 mx-1"></div>
            
            <button 
                onClick={handleZoomIn} 
                className="p-2.5 text-white hover:bg-white/20 rounded-full transition-colors disabled:opacity-30"
                disabled={scale >= 5}
                title="Увеличить"
            >
                <PlusIcon className="w-5 h-5" />
            </button>
         </div>
      </div>
    </div>
  );
};
