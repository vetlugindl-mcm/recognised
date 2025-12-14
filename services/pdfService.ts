import { AppError } from "../utils/errors";

// --- Types for PDF.js Integration ---
interface PDFPageViewport {
    width: number;
    height: number;
}
interface PDFPageProxy {
    getViewport: (params: { scale: number }) => PDFPageViewport;
    render: (params: { canvasContext: CanvasRenderingContext2D; viewport: PDFPageViewport }) => { promise: Promise<void> };
}
interface PDFDocumentProxy {
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
}
interface PDFJSStatic {
    getDocument: (data: { data: ArrayBuffer }) => { promise: Promise<PDFDocumentProxy> };
    GlobalWorkerOptions: { workerSrc: string };
}

// Extend Window interface locally for this module
declare global {
  interface Window {
    pdfjsLib?: PDFJSStatic;
  }
}

export class PdfService {
  /**
   * Generates a thumbnail from the first page of a PDF file.
   * Uses client-side rendering via PDF.js.
   */
  static async generateThumbnail(file: File): Promise<string | null> {
    try {
      const pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        console.warn("PDF.js library not loaded via CDN. Thumbnail generation skipped.");
        return null;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      
      // Scale for thumbnail (target width ~200px)
      const viewport = page.getViewport({ scale: 1.0 });
      const scale = 200 / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new AppError('PDF_GENERATION_ERROR', 'Failed to create canvas context for PDF rendering.');
      }

      // Draw white background (handle transparent PDFs)
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);

      const renderContext = {
        canvasContext: context,
        viewport: scaledViewport,
      };
      
      await page.render(renderContext).promise;
      return canvas.toDataURL('image/jpeg', 0.8);

    } catch (error) {
      // We don't want to crash the app if a thumbnail fails, just log it and return null
      console.error("PDF Thumbnail Generation Error:", error);
      return null;
    }
  }
}
