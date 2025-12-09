import { AnalyzedDocument } from '../types';

/**
 * Parses a potential JSON string from an LLM response.
 * Handles Markdown code blocks (```json ... ```) and raw text safely.
 */
export const cleanAndParseJson = (response: string): AnalyzedDocument => {
  try {
    // 1. Try parsing directly (fast path)
    return JSON.parse(response);
  } catch (e) {
    // 2. Extract JSON from Markdown code blocks or simple curly braces
    // This regex looks for the outermost { and } ensuring it grabs the full object.
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        const cleanJson = jsonMatch[0];
        const parsed = JSON.parse(cleanJson);
        
        // Normalize type to lowercase if present
        if (parsed.type && typeof parsed.type === 'string') {
          parsed.type = parsed.type.toLowerCase();
        }
        
        return parsed as AnalyzedDocument;
      } catch (innerError) {
        console.warn("JSON found but failed to parse. Structure might be invalid.", innerError);
      }
    }
  }

  // 3. Fallback: Return raw data wrapper if parsing fails completely
  return {
    type: 'raw',
    rawText: response
  };
};