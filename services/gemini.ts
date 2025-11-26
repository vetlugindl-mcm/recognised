import { GoogleGenAI } from "@google/genai";

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
    reader.onerror = (error) => reject(error);
  });
};

export const analyzeFile = async (file: File): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API_KEY found in environment. Returning mock data.");
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Mock for demo
      return JSON.stringify({
        type: 'passport',
        lastName: "Петров",
        firstName: "Петр",
        middleName: "Петрович",
        seriesNumber: "4510 123456",
        issuedBy: "ТП УФМС РОССИИ ПО ГОРОДУ МОСКВЕ В РАЙОНЕ АРБАТ",
        dateIssued: "14.05.2015",
        departmentCode: "770-001",
        birthDate: "01.01.1990",
        birthPlace: "гор. Москва",
        registration: "г. Москва, ул. Арбат, д. 1, кв. 1"
      });
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await getBase64(file);

    const prompt = `
      Ты - эксперт по OCR и извлечению данных из официальных документов.
      Проанализируй изображение документа. Твоя задача - точно извлечь все видимые поля.
      
      ШАГ 1: Определи тип документа.
      - Если это Паспорт РФ (разворот с фото или пропиской), тип документа: "passport".
      - Если это Диплом об образовании (титул или приложение), тип документа: "diploma".
      
      ШАГ 2: Извлеки данные и верни результат СТРОГО В ФОРМАТЕ JSON. Не добавляй никаких пояснений, только JSON.

      ВАРИАНТ 1: Если это ПАСПОРТ ("type": "passport"), используй структуру:
      {
        "type": "passport",
        "lastName": "Фамилия",
        "firstName": "Имя",
        "middleName": "Отчество (если есть, иначе null)",
        "seriesNumber": "Серия и Номер (формат XX XX XXXXXX)",
        "issuedBy": "Кем выдан (в точности как в документе, включая сокращения)",
        "dateIssued": "Дата выдачи (ДД.ММ.ГГГГ)",
        "departmentCode": "Код подразделения (XXX-XXX)",
        "birthDate": "Дата рождения (ДД.ММ.ГГГГ)",
        "birthPlace": "Место рождения",
        "registration": "Адрес регистрации (если есть на фото, иначе пустая строка)"
      }

      ВАРИАНТ 2: Если это ДИПЛОМ ("type": "diploma"), используй структуру:
      {
        "type": "diploma",
        "lastName": "Фамилия",
        "firstName": "Имя",
        "middleName": "Отчество",
        "series": "Серия диплома (если есть, иначе null)",
        "number": "Номер диплома",
        "regNumber": "Регистрационный номер",
        "institution": "Полное наименование учебного заведения",
        "city": "Город",
        "specialty": "Специальность / Направление",
        "qualification": "Квалификация",
        "dateIssued": "Дата выдачи (ДД.ММ.ГГГГ)"
      }

      Если поле не найдено или неразборчиво, верни null или пустую строку.
      Следи за регистром букв в значениях (ФИО обычно ЗАГЛАВНЫМИ).
    `;

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
            text: prompt,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
      }
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes('type')) {
        throw new Error("Тип файла не поддерживается. Пожалуйста, используйте JPG или PDF.");
    }
    throw error;
  }
};