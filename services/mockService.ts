import { AnalyzedDocument } from "../types";

/**
 * Provides mock data for development or demonstration purposes
 * when an API key is not available.
 */
export class MockService {
  static async getMockData(filename: string): Promise<AnalyzedDocument> {
    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 1500));

    const name = filename.toLowerCase();
  
    if (name.includes('diploma') || name.includes('диплом')) {
      return {
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
      };
    }

    if (name.includes('qual') || name.includes('свидетельство') || name.includes('цок')) {
      return {
        type: 'qualification',
        lastName: "Музыкин",
        firstName: "Владислав",
        middleName: "Артурович",
        registrationNumber: "16.02500.09.00093713.28",
        issueDate: "21.11.2025",
        expirationDate: "21.11.2028",
        assessmentCenterName: "ООО «ЦЕАТ»",
        assessmentCenterRegNumber: "78.041 / 78.041.78.13"
      };
    }

    // Default to Passport
    return {
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
      
      registrationCity: "г. Москва",
      registrationStreet: "ул. Арбат",
      registrationHouse: "д. 1",
      registrationFlat: "кв. 1",
      registrationDate: "20.05.2015",
      
      snils: "123-456-789 00"
    };
  }
}