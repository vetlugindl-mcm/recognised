import { GoogleGenAI } from "@google/genai";
import { AnalyzedDocument } from "../types";
import { cleanAndParseJson } from "../utils/responseParser";
import { AppError } from "../utils/errors";
import { MockService } from "./mockService";
import { getSystemPrompt } from "./promptService";
import { GEMINI_RESPONSE_SCHEMA } from "../configs/aiSchema";

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(new AppError('UNKNOWN_ERROR', 'Ошибка чтения файла', error));
  });
};

/**
 * Retry utility for AI calls.
 * Retries up to 'retries' times with exponential backoff.
 */
async function retryWithBackoff<T>(
    operation: () => Promise<T>, 
    retries: number = 3, 
    delay: number = 1000
): Promise<T> {
    try {
        return await operation();
    } catch (error: any) {
        if (retries <= 0) throw error;
        
        // Detect retryable errors
        const msg = String(error?.message || '').toLowerCase();
        const isRetryable = msg.includes('429') || msg.includes('503') || msg.includes('overloaded');

        if (!isRetryable) throw error;

        console.warn(`Gemini API busy. Retrying in ${delay}ms... (${retries} left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return retryWithBackoff(operation, retries - 1, delay * 2);
    }
}

export const analyzeFile = async (file: File): Promise<AnalyzedDocument> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("No API_KEY found. Using MockService.");
    return MockService.getMockData(file.name);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await getBase64(file);
    const systemPrompt = getSystemPrompt();

    // Wrap the core API call in the retry logic
    const response = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: file.type,
                    },
                },
                {
                    text: systemPrompt,
                },
                ],
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: GEMINI_RESPONSE_SCHEMA,
            }
        });
    });

    const textResponse = response.text || "{}";
    return cleanAndParseJson(textResponse);

  } catch (error: unknown) {
    console.error("Gemini API Error:", error);
    
    let msg = "";
    if (error instanceof Error) {
        msg = error.message.toLowerCase();
    } else {
        msg = String(error).toLowerCase();
    }

    if (error instanceof AppError) {
        throw error;
    }

    if (msg.includes('400') || msg.includes('invalid argument')) {
        throw new AppError('VALIDATION_ERROR', "Некорректный запрос. Проверьте формат файла.", error);
    }
    if (msg.includes('401') || msg.includes('api key')) {
        throw new AppError('API_KEY_MISSING', "Ошибка авторизации. Проверьте API ключ.", error);
    }
    if (msg.includes('404')) {
        throw new AppError('NETWORK_ERROR', "Модель не найдена.", error);
    }
    if (msg.includes('429')) {
        throw new AppError('NETWORK_ERROR', "Сервер перегружен. Пожалуйста, подождите минуту.", error);
    }
    if (msg.includes('500')) {
        throw new AppError('NETWORK_ERROR', "Ошибка сервиса Gemini.", error);
    }
    if (msg.includes('safety')) {
        throw new AppError('AI_SAFETY_BLOCK', "Документ заблокирован фильтром безопасности AI.", error);
    }

    throw new AppError('UNKNOWN_ERROR', "Не удалось обработать документ.", error);
  }
};