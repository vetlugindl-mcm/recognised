import React, { useState, useEffect } from 'react';
import { useObjectUrl } from '../hooks/useObjectUrl';
import { PdfService } from '../services/pdfService';
import { PhotoIcon, AcademicCapIcon, DocumentIcon } from './icons';

interface FilePreviewProps {
    file: File;
    className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, className }) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    
    // Strategy 1: For Images, use the lightweight hook
    const imageUrl = useObjectUrl(isImage ? file : null);

    // Strategy 2: For PDFs, generate thumbnail async
    const [pdfThumbnail, setPdfThumbnail] = useState<string | null>(null);

    useEffect(() => {
        if (isPdf) {
            let active = true;
            PdfService.generateThumbnail(file).then(url => {
                if (active && url) {
                    setPdfThumbnail(url);
                }
            });
            return () => { active = false; };
        }
    }, [file, isPdf]);

    const containerClasses = `w-full h-full flex items-center justify-center bg-gray-50 overflow-hidden ${className || ''}`;

    // 1. Image Render
    if (isImage && imageUrl) {
        return (
            <div className={containerClasses}>
                <img 
                    src={imageUrl} 
                    alt="preview" 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
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
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                    />
                </div>
            );
        }
        // Fallback while loading or if failed
        return (
            <div className={`${containerClasses} text-gray-400`}>
                <AcademicCapIcon className="w-5 h-5" />
            </div>
        );
    }

    // 3. Word/Other Render - Updated to Monochrome
    if (file.type.includes('word') || file.type.includes('doc')) {
        return (
             <div className={`${containerClasses} text-gray-900 bg-gray-100`}>
                <DocumentIcon className="w-5 h-5" />
            </div>
        );
    }

    // 4. Default
    return (
        <div className={`${containerClasses} text-gray-400`}>
            <PhotoIcon className="w-5 h-5" />
        </div>
    );
};