import { Type, Schema } from "@google/genai";

/**
 * Defines the strict output schema for Google GenAI.
 * This ensures the model returns a valid JSON object matching our internal types.
 */
export const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  description: "Structured data extracted from the document",
  properties: {
    // Discriminator
    type: {
      type: Type.STRING,
      enum: ["passport", "diploma", "qualification", "snils"],
      description: "The type of the document identified."
    },
    
    // --- Passport Fields ---
    seriesNumber: { type: Type.STRING, description: "Passport Series and Number. Format: XX XX XXXXXX", nullable: true },
    issuedBy: { type: Type.STRING, description: "Authority who issued the passport", nullable: true },
    departmentCode: { type: Type.STRING, description: "Department code. Format: XXX-XXX", nullable: true },
    birthDate: { type: Type.STRING, description: "Date of birth. Format: DD.MM.YYYY", nullable: true },
    birthPlace: { type: Type.STRING, description: "Place of birth", nullable: true },
    
    // Detailed Registration Fields
    registrationCity: { type: Type.STRING, description: "City of registration", nullable: true },
    
    // SPLIT ADDRESS
    registrationStreet: { type: Type.STRING, description: "Street name ONLY. Do not include house number here.", nullable: true },
    registrationHouse: { type: Type.STRING, description: "House number. CRITICAL: Look at the line BELOW the street name. Look for 'д.', 'дом' followed by digits.", nullable: true },
    registrationFlat: { type: Type.STRING, description: "Apartment/Flat number. CRITICAL: Look at the line BELOW the street name. Look for 'кв.' followed by digits.", nullable: true },
    
    registrationDate: { type: Type.STRING, description: "Date of registration stamp. Format: DD.MM.YYYY", nullable: true },
    
    // Common SNILS field (used in Passport and standalone SNILS)
    snils: { type: Type.STRING, description: "SNILS number. Format XXX-XXX-XXX XX", nullable: true },

    // --- Diploma Fields ---
    series: { type: Type.STRING, description: "Diploma series", nullable: true },
    number: { type: Type.STRING, description: "Diploma number", nullable: true },
    regNumber: { type: Type.STRING, description: "Diploma Registration number", nullable: true },
    institution: { type: Type.STRING, description: "Name of the educational institution", nullable: true },
    city: { type: Type.STRING, description: "City of the institution", nullable: true },
    specialty: { type: Type.STRING, description: "Specialty or Field of Study", nullable: true },
    qualification: { type: Type.STRING, description: "Qualification awarded", nullable: true },
    dateIssued: { type: Type.STRING, description: "Date of issue (Passport, Diploma, or SNILS)", nullable: true },

    // --- Qualification Fields ---
    registrationNumber: { type: Type.STRING, description: "Certificate Registration number. Often at the very top of the page.", nullable: true },
    issueDate: { type: Type.STRING, description: "Date of issue for Certificate", nullable: true },
    expirationDate: { type: Type.STRING, description: "Valid until", nullable: true },
    assessmentCenterName: { type: Type.STRING, description: "Name of the Assessment Center", nullable: true },
    assessmentCenterRegNumber: { type: Type.STRING, description: "Registration number of the Assessment Center", nullable: true },

    // --- Common Fields ---
    lastName: { type: Type.STRING, description: "Last Name", nullable: true },
    firstName: { type: Type.STRING, description: "First Name", nullable: true },
    middleName: { type: Type.STRING, description: "Middle Name", nullable: true },
  },
  required: ["type", "lastName", "firstName"],
};