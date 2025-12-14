import { GoogleGenAI } from "@google/genai";
import { AnalyzedDocument } from "../types";
import { cleanAndParseJson } from "../utils/responseParser";
import { AppError } from "../utils/errors";
import { MockService } from "./mockService";
import { getSystemPrompt } from "./promptService";

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(new AppError('UNKNOWN_ERROR', 'Ошибка чтения файла', error));
  });
};

export const analyzeFile = async (file: File): Promise<AnalyzedDocument> => {
  const apiKey = process.env.API_KEY;
  
  // Strategy: Mock Mode
  if (!apiKey) {
    console.warn("No API_KEY found. Using MockService.");
    return MockService.getMockData(file.name);
  }

  // Strategy: Live Mode
  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await getBase64(file);
    
    // Dynamically build the prompt
    const systemPrompt = getSystemPrompt();

    const response = await ai.models.generateContent({
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
      }
    });

    const textResponse = response.text || "{}";
    
    // Parse AND Validate
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

    // Map errors to AppError
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
        throw new AppError('NETWORK_ERROR', "Превышен лимит запросов.", error);
    }
    if (msg.includes('500')) {
        throw new AppError('NETWORK_ERROR', "Ошибка сервиса Gemini.", error);
    }
    if (msg.includes('safety')) {
        throw new AppError('AI_SAFETY_BLOCK', "Документ заблокирован фильтром безопасности AI.", error);
    }

    // Fallback
    throw new AppError('UNKNOWN_ERROR', "Не удалось обработать документ.", error);
  }
};
