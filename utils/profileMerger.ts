import { AnalysisItem, UserProfile, PassportData, DiplomaData, QualificationData, SnilsData } from '../types';

/**
 * Helper to merge objects strictly using Generics.
 * Type Safety: Only allows merging objects of the same type T.
 * Logic: Overwrites properties in 'target' with values from 'source' only if 
 * the source value is truthy (not null/undefined/empty).
 */
const smartMerge = <T extends Record<string, any>>(target: T, source: T): void => {
  (Object.keys(source) as Array<keyof T>).forEach(key => {
    const val = source[key];
    
    // Special handling for 'isHandwritten': Sticky TRUE.
    // If target is already true, keep it true. If source is true, set true.
    if (key === 'isHandwritten') {
        if (source[key] === true) {
            target[key] = true as any;
        }
        return;
    }

    // Standard merge for other fields
    // Если новое значение валидно (не null, не undefined, не пустая строка) -> перезаписываем
    if (val !== null && val !== undefined && val !== '') {
      target[key] = val;
    }
  });
};

/**
 * Pure function to aggregate analysis results into a single User Profile.
 * This contains the core business logic for document precedence and identity resolution.
 * 
 * @param results Array of analyzed documents
 * @returns Aggregated UserProfile
 */
export const mergeProfiles = (results: AnalysisItem[]): UserProfile => {
    // Default Empty Profile
    const profile: UserProfile = {
      fullName: 'Неизвестный кандидат',
      passport: { data: null, sourceFileId: null },
      diploma: { data: null, sourceFileId: null },
      qualification: { data: null, sourceFileId: null }
    };

    results.forEach(item => {
      // Skip failed analyses
      if (!item.data || item.error) return;

      const { data, fileId } = item;

      if (data.type === 'passport') {
        const incomingData = data as PassportData;
        
        if (!profile.passport.data) {
          // First passport found
          profile.passport.data = { ...incomingData };
          profile.passport.sourceFileId = fileId;
        } else {
          // Subsequent passport: Merge new data into existing
          smartMerge(profile.passport.data, incomingData);
          profile.passport.sourceFileId = fileId; 
        }

        // Update Full Name logic from Passport (Highest Priority)
        if (profile.passport.data.lastName) {
           profile.fullName = `${profile.passport.data.lastName} ${profile.passport.data.firstName} ${profile.passport.data.middleName || ''}`.trim();
        }

      } else if (data.type === 'diploma') {
        const incomingData = data as DiplomaData;
        if (!profile.diploma.data) {
           profile.diploma.data = { ...incomingData };
           profile.diploma.sourceFileId = fileId;
        } else {
           smartMerge(profile.diploma.data, incomingData);
           profile.diploma.sourceFileId = fileId;
        }
        
        // Fallback for name if passport is missing
        if (profile.fullName === 'Неизвестный кандидат' && incomingData.lastName) {
           profile.fullName = `${incomingData.lastName} ${incomingData.firstName} ${incomingData.middleName || ''}`.trim();
        }

      } else if (data.type === 'qualification') {
        const incomingData = data as QualificationData;
        if (!profile.qualification.data) {
            profile.qualification.data = { ...incomingData };
            profile.qualification.sourceFileId = fileId;
        } else {
            smartMerge(profile.qualification.data, incomingData);
            profile.qualification.sourceFileId = fileId;
        }

        if (profile.fullName === 'Неизвестный кандидат' && incomingData.lastName) {
             profile.fullName = `${incomingData.lastName} ${incomingData.firstName} ${incomingData.middleName || ''}`.trim();
        }
      } else if (data.type === 'snils') {
        // Handle Standalone SNILS
        const incomingData = data as SnilsData;
        
        // Strategy: Inject SNILS number into Passport Data (Identity holder)
        if (!profile.passport.data) {
             // Create a partial passport record just to hold the name and SNILS if no passport exists yet
             profile.passport.data = {
                 type: 'passport',
                 lastName: incomingData.lastName,
                 firstName: incomingData.firstName,
                 middleName: incomingData.middleName,
                 snils: incomingData.snils,
                 // Empty fillers to satisfy type
                 seriesNumber: '', issuedBy: '', dateIssued: '', departmentCode: '',
                 birthDate: '', birthPlace: '', registrationCity: '', 
                 registrationStreet: '', registrationHouse: '', registrationFlat: '', registrationDate: '',
                 isHandwritten: incomingData.isHandwritten // Carry over flag
             };
        } else {
             // Merge SNILS into existing passport manually
             if (incomingData.snils) profile.passport.data.snils = incomingData.snils;
             
             // Sticky Handwritten flag for SNILS merging
             if (incomingData.isHandwritten) {
                 profile.passport.data.isHandwritten = true;
             }
             
             // Optionally update name if passport was empty (unlikely but safe fallback)
             if (!profile.passport.data.lastName && incomingData.lastName) {
                 profile.passport.data.lastName = incomingData.lastName;
                 profile.passport.data.firstName = incomingData.firstName;
                 profile.passport.data.middleName = incomingData.middleName;
             }
        }
        
        // Update global full name if needed
        if (profile.fullName === 'Неизвестный кандидат' && incomingData.lastName) {
             profile.fullName = `${incomingData.lastName} ${incomingData.firstName} ${incomingData.middleName || ''}`.trim();
        }
      }
    });

    return profile;
};