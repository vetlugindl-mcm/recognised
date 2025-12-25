import React, { useState, useEffect } from 'react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { PdfService } from '../services/pdfService';
import { PhotoIcon, AcademicCapIcon, DocumentIcon } from './icons';

interface FilePreviewProps {
    file: File;
    className?: string;
    fit?: 'cover' | 'contain';
    highRes?: boolean;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ 
    file, 
    className, 
    fit = 'cover',
    highRes = false 
}) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    
    // Strategy 1: For Images, use the lightweight hook
    const imageUrl = useObjectUrl(isImage ? file : null);

    // Strategy 2: For PDFs, generate thumbnail async
    const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);

    useEffect(() => {
        if (isPdf) {
            let active = true;
            // Use larger width for highRes mode (e.g. Modal view) vs List view
            const targetWidth = highRes ? 1200 : 300;
            
            PdfService.generateThumbnail(file, targetWidth).then(url => {
                if (active && url) {
                    setPdfThumbnail(url);
                }
            });
            return () => { active = false; };
        }
    }, [file, isPdf, highRes]);

    const containerClasses = `w-full h-full flex items-center justify-center overflow-hidden ${className || ''}`;
    const imgClasses = `w-full h-full transition-opacity duration-300 ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${fit === 'contain' ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`;

    // 1. Image Render
    if (isImage && imageUrl) {
        return (
            <div className={containerClasses}>
                <img 
                    src={imageUrl} 
                    alt="preview" 
                    className={imgClasses} 
                />
            </div>
        );
    }

    // 2. PDF Render
    if (isPdf) {
        if (pdfThumbnail) {
             return (
                <div className={containerClasses}>
                    <img 
                        src={pdfThumbnail} 
                        alt="pdf preview" 
                        className={imgClasses} 
                    />
                </div>
            );
        }
        // Fallback while loading or if failed
        return (
            <div className={`${containerClasses} ${highRes ? 'bg-gray-100' : 'bg-gray-50'} text-gray-400`}>
                <AcademicCapIcon className={highRes ? "w-16 h-16 opacity-20" : "w-5 h-5"} />
                {highRes && <span className="mt-4 text-sm font-medium opacity-50">Загрузка предпросмотра PDF...</span>}
            </div>
        );
    }

    // 3. Word/Other Render
    if (file.type.includes('word') || file.type.includes('doc')) {
        return (
             <div className={`${containerClasses} text-gray-900 bg-gray-100 flex-col gap-2`}>
                <DocumentIcon className={highRes ? "w-16 h-16 opacity-50" : "w-5 h-5"} />
                 {highRes && <span className="text-sm font-medium text-gray-500">Предпросмотр недоступен для Word</span>}
            </div>
        );
    }

    // 4. Default
    return (
        <div className={`${containerClasses} text-gray-400 bg-gray-50`}>
            <PhotoIcon className={highRes ? "w-16 h-16 opacity-20" : "w-5 h-5"} />
        </div>
    );
};