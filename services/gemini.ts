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

// Mock data generator for development without API Key
const getMockData = (filename: string) => {
  const name = filename.toLowerCase();
  
  if (name.includes('diploma') || name.includes('диплом')) {
    return JSON.stringify({
      type: 'diploma',
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      series: "1024",
      number: "567890",
      regNumber: "123-45",
      institution: "Московский Государственный Технический Университет",
      city: "Москва",
      specialty: "Информационные системы и технологии",
      qualification: "Инженер",
      dateIssued: "25.06.2018"
    });
  }

  if (name.includes('qual') || name.includes('свидетельство') || name.includes('цок')) {
    return JSON.stringify({
      type: 'qualification',
      lastName: "Музыкин",
      firstName: "Владислав",
      middleName: "Артурович",
      registrationNumber: "16.02500.09.00093713.28",
      issueDate: "21.11.2025",
      expirationDate: "21.11.2028",
      assessmentCenterName: "ООО «ЦЕАТ»",
      assessmentCenterRegNumber: "78.041 / 78.041.78.13"
    });
  }

  // Default to Passport
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
    registration: "г. Москва, ул. Арбат, д. 1, кв. 1",
    snils: "123-456-789 00"
  });
};

export const analyzeFile = async (file: File): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("No API_KEY found in environment. Using smart mock data based on filename.");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return getMockData(file.name);
    }

    const ai = new GoogleGenAI({ apiKey });
    const base64Data = await getBase64(file);

    const prompt = `
      Ты - эксперт по OCR и извлечению данных из официальных документов РФ.
      Проанализируй изображение документа. Твоя задача - точно извлечь все видимые поля.
      
      ШАГ 1: Определи тип документа.
      - Если это Паспорт РФ (разворот с фото или пропиской) или СНИЛС, тип документа: "passport".
      - Если это Диплом об образовании (титул или приложение), тип документа: "diploma".
      - Если это Свидетельство о квалификации (независимая оценка квалификации), тип документа: "qualification".
      
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
        "registration": "Адрес регистрации (если есть на фото, иначе пустая строка)",
        "snils": "СНИЛС (если найден на изображении, формат XXX-XXX-XXX XX, иначе null)"
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

      ВАРИАНТ 3: Если это СВИДЕТЕЛЬСТВО О КВАЛИФИКАЦИИ ("type": "qualification"), используй структуру:
      {
        "type": "qualification",
        "lastName": "Фамилия соискателя",
        "firstName": "Имя соискателя",
        "middleName": "Отчество соискателя",
        "registrationNumber": "Регистрационный номер свидетельства",
        "issueDate": "Дата выдачи свидетельства (ДД.ММ.ГГГГ)",
        "expirationDate": "Действителен до (ДД.ММ.ГГГГ)",
        "assessmentCenterName": "Наименование Центра оценки квалификации (Пункт 4.5 в бланке)",
        "assessmentCenterRegNumber": "Регистрационный номер ЦОК (Пункт 4.6 в бланке)"
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
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "Не удалось обработать документ. Попробуйте еще раз.";
    const msg = (error.message || error.toString()).toLowerCase();

    // Обработка конкретных кодов ошибок и сообщений
    if (msg.includes('400') || msg.includes('invalid argument')) {
      errorMessage = "Некорректный запрос. Проверьте формат файла (JPG/PDF).";
    } else if (msg.includes('401') || msg.includes('api key')) {
      errorMessage = "Ошибка авторизации. Проверьте API ключ.";
    } else if (msg.includes('403') || msg.includes('permission denied')) {
      errorMessage = "Доступ запрещен. Проверьте права API ключа или лимиты проекта.";
    } else if (msg.includes('404')) {
      errorMessage = "Модель или ресурс не найдены.";
    } else if (msg.includes('429') || msg.includes('quota') || msg.includes('too many requests')) {
      errorMessage = "Превышен лимит запросов. Пожалуйста, подождите немного.";
    } else if (msg.includes('500') || msg.includes('internal')) {
      errorMessage = "Внутренняя ошибка сервиса Gemini. Попробуйте позже.";
    } else if (msg.includes('503') || msg.includes('overloaded')) {
      errorMessage = "Сервис перегружен. Повторите попытку через минуту.";
    } else if (msg.includes('safety') || msg.includes('blocked')) {
      errorMessage = "Запрос заблокирован настройками безопасности. Документ может содержать недопустимый контент.";
    } else if (msg.includes('type') || msg.includes('mime')) {
      errorMessage = "Тип файла не поддерживается. Пожалуйста, используйте JPG или PDF.";
    } else if (msg.includes('network') || msg.includes('fetch')) {
      errorMessage = "Ошибка сети. Проверьте подключение к интернету.";
    }

    throw new Error(errorMessage);
  }
};