import { get, set, del, keys } from 'idb-keyval';
import { AnalysisItem, DocumentTemplate } from '../types';

const STORAGE_KEYS = {
    ANALYSIS_RESULTS: 'mcm_analysis_results',
    TEMPLATES_META: 'mcm_templates_meta'
};

/**
 * Service to handle data persistence.
 * Strategy:
 * - Metadata (JSON) -> LocalStorage (Fast, Synchronous)
 * - Blobs (Files) -> IndexedDB (Async, Large capacity)
 */
export class StorageService {
    
    // --- METADATA (LocalStorage) ---

    static saveAnalysisResults(results: AnalysisItem[]) {
        try {
            localStorage.setItem(STORAGE_KEYS.ANALYSIS_RESULTS, JSON.stringify(results));
        } catch (e) {
            console.error("Failed to save analysis results to LocalStorage", e);
        }
    }

    static loadAnalysisResults(): AnalysisItem[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.ANALYSIS_RESULTS);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            console.error("Failed to load analysis results", e);
            return [];
        }
    }

    static saveTemplatesMeta(templates: DocumentTemplate[]) {
        try {
            // We strip the 'file' object because it can't be JSON serialized
            const meta = templates.map(({ file, ...rest }) => rest);
            localStorage.setItem(STORAGE_KEYS.TEMPLATES_META, JSON.stringify(meta));
        } catch (e) {
            console.error("Failed to save templates meta", e);
        }
    }

    static loadTemplatesMeta(): Omit<DocumentTemplate, 'file'>[] {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATES_META);
            // Convert string dates back to Date objects
            const parsed = raw ? JSON.parse(raw) : [];
            return parsed.map((t: any) => ({
                ...t,
                uploadDate: new Date(t.uploadDate)
            }));
        } catch (e) {
            return [];
        }
    }

    // --- BLOBS (IndexedDB) ---

    static async saveFile(id: string, file: File): Promise<void> {
        try {
            await set(id, file);
        } catch (e) {
            console.error(`Failed to save file ${id} to IDB`, e);
        }
    }

    static async getFile(id: string): Promise<File | undefined> {
        try {
            return await get(id);
        } catch (e) {
            console.error(`Failed to get file ${id} from IDB`, e);
            return undefined;
        }
    }

    static async deleteFile(id: string): Promise<void> {
        try {
            await del(id);
        } catch (e) {
            console.error(`Failed to delete file ${id} from IDB`, e);
        }
    }

    /**
     * Cleanup utility: Removes orphaned files from IndexedDB that are not referenced in metadata.
     */
    static async performCleanup(activeFileIds: string[]) {
        try {
            const allKeys = await keys();
            const activeSet = new Set(activeFileIds);
            
            for (const key of allKeys) {
                if (typeof key === 'string' && !activeSet.has(key)) {
                    // console.debug(`Cleaning up orphaned file: ${key}`);
                    await del(key);
                }
            }
        } catch (e) {
            console.warn("Cleanup failed", e);
        }
    }
}
