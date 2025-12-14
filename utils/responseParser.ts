import { AnalyzedDocument } from '../types';
import { DocumentSchema } from './validationSchemas';
import { AppError } from './errors';

/**
 * Parses a potential JSON string from an LLM response and validates it against Zod schemas.
 * Handles Markdown code blocks (```json ... ```) and raw text safely.
 */
export const cleanAndParseJson = (response: string): AnalyzedDocument => {
  let parsedRaw: unknown;

  try {
    // 1. Try parsing directly (fast path)
    parsedRaw = JSON.parse(response);
  } catch (e) {
    // 2. Extract JSON from Markdown code blocks or simple curly braces
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const cleanJson = jsonMatch[0];
        parsedRaw = JSON.parse(cleanJson);
      } catch (innerError) {
        console.warn("JSON found but failed to parse.", innerError);
      }
    }
  }

  // 3. Fallback to RAW if no JSON found or parsing failed
  if (!parsedRaw) {
      return {
          type: 'raw',
          rawText: response
      };
  }

  // 4. Normalize type (lowercase) before validation
  if (typeof parsedRaw === 'object' && parsedRaw !== null && 'type' in parsedRaw) {
      // @ts-ignore
      parsedRaw.type = String(parsedRaw.type).toLowerCase();
  }

  // 5. VALIDATE with Zod
  const validationResult = DocumentSchema.safeParse(parsedRaw);

  if (!validationResult.success) {
      console.error("Zod Validation Errors:", validationResult.error.format());
      
      // If validation fails, we map it to a specific error type rather than crashing
      // However, to keep the UI useful, we might fallback to rawText containing the invalid JSON
      // so the user can at least copy-paste data manually.
      throw new AppError(
          'PARSING_ERROR', 
          'Структура данных от AI некорректна. Проверьте консоль.', 
          validationResult.error
      );
  }

  return validationResult.data as AnalyzedDocument;
};
