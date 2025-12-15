import { Type, Schema } from "@google/genai";

/**
 * Defines the strict output schema for Google GenAI.
 * This ensures the model returns a valid JSON object matching our internal types.
 * 
 * Strategy: Since the API prefers a single root object, we define a "Super Object"
 * containing all possible fields as optional. The 'type' field acts as the discriminator.
 */
export const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  description: "Structured data extracted from the document",
  properties: {
    // Discriminator
    type: {
      type: Type.STRING,
      enum: ["passport", "diploma", "qualification"],
      description: "The type of the document identified."
    },
    
    // --- Passport Fields ---
    seriesNumber: { type: Type.STRING, description: "Passport Series and Number (Серия и Номер). Format: XX XX XXXXXX", nullable: true },
    issuedBy: { type: Type.STRING, description: "Authority who issued the passport (Кем выдан)", nullable: true },
    departmentCode: { type: Type.STRING, description: "Department code (Код подразделения). Format: XXX-XXX", nullable: true },
    birthDate: { type: Type.STRING, description: "Date of birth (Дата рождения). Format: DD.MM.YYYY", nullable: true },
    birthPlace: { type: Type.STRING, description: "Place of birth (Место рождения)", nullable: true },
    registration: { type: Type.STRING, description: "Registration address (Место жительства/регистрации)", nullable: true },
    snils: { type: Type.STRING, description: "SNILS number (СНИЛС). Look for format XXX-XXX-XXX XX", nullable: true },

    // --- Diploma Fields ---
    series: { type: Type.STRING, description: "Diploma series (Серия)", nullable: true },
    number: { type: Type.STRING, description: "Diploma number (Номер)", nullable: true },
    regNumber: { type: Type.STRING, description: "Registration number (Регистрационный номер)", nullable: true },
    institution: { type: Type.STRING, description: "Name of the educational institution (Учебное заведение)", nullable: true },
    city: { type: Type.STRING, description: "City of the institution (Город)", nullable: true },
    specialty: { type: Type.STRING, description: "Specialty or Field of Study (Специальность)", nullable: true },
    qualification: { type: Type.STRING, description: "Qualification awarded (Квалификация)", nullable: true },

    // --- Qualification Fields ---
    registrationNumber: { type: Type.STRING, description: "Certificate registration number (Регистрационный номер свидетельства)", nullable: true },
    issueDate: { type: Type.STRING, description: "Date of issue (Дата выдачи) ONLY for Qualification/Certificate", nullable: true },
    expirationDate: { type: Type.STRING, description: "Valid until (Действителен до)", nullable: true },
    assessmentCenterName: { type: Type.STRING, description: "Name of the Assessment Center (Наименование ЦОК)", nullable: true },
    assessmentCenterRegNumber: { type: Type.STRING, description: "Registration number of the Assessment Center (Номер ЦОК)", nullable: true },

    // --- Common Fields ---
    lastName: { type: Type.STRING, description: "Last Name (Фамилия)", nullable: true },
    firstName: { type: Type.STRING, description: "First Name (Имя)", nullable: true },
    middleName: { type: Type.STRING, description: "Middle Name (Отчество)", nullable: true },
    dateIssued: { type: Type.STRING, description: "Date of issue (Дата выдачи) ONLY for Passport or Diploma", nullable: true },
  },
  required: ["type", "lastName", "firstName"],
};
