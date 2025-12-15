import { AnalysisItem, UserProfile, PassportData, DiplomaData, QualificationData, SnilsData } from '../types';

/**
 * Helper to merge objects strictly.
 * Overwrites properties in 'target' with values from 'source' only if the source value is defined.
 */
const smartMerge = <T extends object>(target: T, source: T) => {
  const keys = Object.keys(source) as Array<keyof T>;
  
  keys.forEach(key => {
    const val = source[key];
    // If the new file has a value (and it's not strictly null/empty string), overwrite the old value.
    // This allows correcting mistakes by uploading a better scan.
    if (val !== null && val !== undefined && val !== '') {
      // We use a safe assignment here. In a strict FP world we would return a new object,
      // but for this specific merging utility, strict mutation of the target accumulator is efficient.
      (target as any)[key] = val;
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

      if (item.data.type === 'passport') {
        const incomingData = item.data as PassportData;
        
        if (!profile.passport.data) {
          // First passport found
          profile.passport.data = { ...incomingData };
          profile.passport.sourceFileId = item.fileId;
        } else {
          // Subsequent passport: Merge new data into existing
          smartMerge(profile.passport.data, incomingData);
          profile.passport.sourceFileId = item.fileId; 
        }

        // Update Full Name logic from Passport (Highest Priority)
        if (profile.passport.data.lastName) {
           profile.fullName = `${profile.passport.data.lastName} ${profile.passport.data.firstName} ${profile.passport.data.middleName || ''}`.trim();
        }

      } else if (item.data.type === 'diploma') {
        const data = item.data as DiplomaData;
        if (!profile.diploma.data) {
           profile.diploma.data = { ...data };
           profile.diploma.sourceFileId = item.fileId;
        } else {
           smartMerge(profile.diploma.data, data);
           profile.diploma.sourceFileId = item.fileId;
        }
        
        // Fallback for name if passport is missing
        if (profile.fullName === 'Неизвестный кандидат' && data.lastName) {
           profile.fullName = `${data.lastName} ${data.firstName} ${data.middleName || ''}`.trim();
        }

      } else if (item.data.type === 'qualification') {
        const data = item.data as QualificationData;
        if (!profile.qualification.data) {
            profile.qualification.data = { ...data };
            profile.qualification.sourceFileId = item.fileId;
        } else {
            smartMerge(profile.qualification.data, data);
            profile.qualification.sourceFileId = item.fileId;
        }

        if (profile.fullName === 'Неизвестный кандидат' && data.lastName) {
             profile.fullName = `${data.lastName} ${data.firstName} ${data.middleName || ''}`.trim();
        }
      } else if (item.data.type === 'snils') {
        // Handle Standalone SNILS
        const data = item.data as SnilsData;
        
        // Strategy: Inject SNILS number into Passport Data (Identity holder)
        if (!profile.passport.data) {
             // Create a partial passport record just to hold the name and SNILS if no passport exists yet
             profile.passport.data = {
                 type: 'passport',
                 lastName: data.lastName,
                 firstName: data.firstName,
                 middleName: data.middleName,
                 snils: data.snils,
                 // Empty fillers to satisfy type
                 seriesNumber: '', issuedBy: '', dateIssued: '', departmentCode: '',
                 birthDate: '', birthPlace: '', registrationCity: '', 
                 registrationStreet: '', registrationHouse: '', registrationFlat: '', registrationDate: ''
             };
        } else {
             // Merge SNILS into existing passport
             profile.passport.data.snils = data.snils;
             
             // Optionally update name if passport was empty (unlikely but safe fallback)
             if (!profile.passport.data.lastName && data.lastName) {
                 profile.passport.data.lastName = data.lastName;
                 profile.passport.data.firstName = data.firstName;
                 profile.passport.data.middleName = data.middleName;
             }
        }
        
        // Update global full name if needed
        if (profile.fullName === 'Неизвестный кандидат' && data.lastName) {
             profile.fullName = `${data.lastName} ${data.firstName} ${data.middleName || ''}`.trim();
        }
      }
    });

    return profile;
};