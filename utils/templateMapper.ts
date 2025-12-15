import { UserProfile } from '../types';

/**
 * Maps the structured UserProfile object to a flat dictionary for template injection.
 * Keys match the {{variables}} defined in TemplatesView documentation.
 */
export const mapProfileToTemplateVariables = (profile: UserProfile): Record<string, string> => {
  const vars: Record<string, string> = {};

  // Helper to safely add values
  const add = (key: string, value: string | null | undefined) => {
    vars[key] = value || ""; 
  };

  // 1. Passport Data
  if (profile.passport.data) {
    const p = profile.passport.data;
    add('passport_last_name', p.lastName);
    add('passport_first_name', p.firstName);
    add('passport_middle_name', p.middleName);
    add('passport_series_number', p.seriesNumber);
    add('passport_date_issued', p.dateIssued);
    add('passport_department_code', p.departmentCode);
    add('passport_issued_by', p.issuedBy);
    add('passport_birth_date', p.birthDate);
    add('passport_birth_place', p.birthPlace);
    
    // Detailed fields
    add('passport_reg_city', p.registrationCity);
    add('passport_reg_date', p.registrationDate);

    // Reconstruct full address for legacy/convenience variable
    // Format: "УЛ. ЛЕНИНА, Д. 5, КВ. 10"
    const addressParts = [
        p.registrationStreet, 
        p.registrationHouse, 
        p.registrationFlat
    ].filter(Boolean);
    
    add('passport_reg_address', addressParts.join(', '));
    
    // Also provide the city + address combined
    const fullReg = [p.registrationCity, ...addressParts].filter(Boolean).join(', ');
    add('passport_registration', fullReg);

    add('snils', p.snils);
  } else {
    // Fill with blanks if document is missing
    ['passport_last_name', 'passport_series_number', 'snils', 'passport_reg_city'].forEach(k => add(k, ''));
  }

  // 2. Diploma Data
  if (profile.diploma.data) {
    const d = profile.diploma.data;
    add('diploma_last_name', d.lastName);
    add('diploma_first_name', d.firstName);
    add('diploma_middle_name', d.middleName);
    add('diploma_series', d.series);
    add('diploma_number', d.number);
    add('diploma_reg_number', d.regNumber);
    add('diploma_institution', d.institution);
    add('diploma_city', d.city);
    add('diploma_specialty', d.specialty);
    add('diploma_qualification', d.qualification);
    add('diploma_date_issued', d.dateIssued);
  }

  // 3. Qualification Data
  if (profile.qualification.data) {
    const q = profile.qualification.data;
    add('qualification_last_name', q.lastName);
    add('qualification_first_name', q.firstName);
    add('qualification_middle_name', q.middleName);
    add('qualification_reg_number', q.registrationNumber);
    add('qualification_issue_date', q.issueDate);
    add('qualification_expiration_date', q.expirationDate);
    add('qualification_center_name', q.assessmentCenterName);
    add('qualification_center_reg_number', q.assessmentCenterRegNumber);
  }

  // 4. Computed Full Name
  add('full_name', profile.fullName);

  return vars;
};