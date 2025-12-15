import { UserProfile } from '../types';
import { ComplianceReport, ValidationRuleResult, ComplianceStatus } from '../types';

/**
 * Helper to parse DD.MM.YYYY string to Date object
 */
const parseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
};

/**
 * Normalizes strings for comparison (lowercase, trim)
 */
const normalize = (str: string | null | undefined): string => {
  return (str || '').trim().toLowerCase();
};

export const calculateCompliance = (profile: UserProfile): ComplianceReport => {
  const checks: ValidationRuleResult[] = [];
  let passedWeights = 0;
  let totalWeights = 0;

  // Helper to add check
  const addCheck = (id: string, label: string, status: ComplianceStatus, message: string, weight: number = 1) => {
    checks.push({ id, label, status, message });
    totalWeights += weight;
    if (status === 'success') passedWeights += weight;
    // Warnings count as half points? Let's say warnings don't count towards 100% strictly, 
    // or we can treat them as non-blocking. For now, strict: success only.
  };

  // 1. PASSPORT PRESENCE (Critical)
  if (profile.passport.data) {
    addCheck('passport_exist', 'Наличие паспорта', 'success', 'Паспорт загружен', 2);
    
    // 1.1 SNILS
    if (profile.passport.data.snils) {
       addCheck('snils_exist', 'Наличие СНИЛС', 'success', `СНИЛС: ${profile.passport.data.snils}`, 1);
    } else {
       addCheck('snils_exist', 'Наличие СНИЛС', 'warning', 'СНИЛС не найден в данных паспорта', 1);
    }

  } else {
    addCheck('passport_exist', 'Наличие паспорта', 'error', 'Паспорт отсутствует', 2);
  }

  // 2. DIPLOMA PRESENCE (Critical)
  if (profile.diploma.data) {
    addCheck('diploma_exist', 'Наличие диплома', 'success', 'Диплом о В/О загружен', 2);
    
    // 2.1 Name Match (Passport vs Diploma)
    if (profile.passport.data) {
        const pLast = normalize(profile.passport.data.lastName);
        const dLast = normalize(profile.diploma.data.lastName);
        
        if (pLast && dLast && pLast !== dLast) {
            addCheck('name_match', 'Совпадение ФИО', 'error', `Фамилия в паспорте (${profile.passport.data.lastName}) не совпадает с дипломом (${profile.diploma.data.lastName})`, 2);
        } else {
            addCheck('name_match', 'Совпадение ФИО', 'success', 'ФИО в документах совпадают', 2);
        }
    }

  } else {
    addCheck('diploma_exist', 'Наличие диплома', 'error', 'Диплом не загружен', 2);
  }

  // 3. QUALIFICATION (NOK) VALIDITY
  if (profile.qualification.data) {
    addCheck('nok_exist', 'Свидетельство НОК', 'success', 'Свидетельство о квалификации загружено', 2);

    const expDate = parseDate(profile.qualification.data.expirationDate);
    const today = new Date();

    if (expDate) {
        if (expDate < today) {
            addCheck('nok_valid', 'Срок действия НОК', 'error', `Свидетельство истекло ${profile.qualification.data.expirationDate}`, 3);
        } else {
            // Check if expiring soon (within 30 days)
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            if (expDate.getTime() - today.getTime() < thirtyDays) {
                addCheck('nok_valid', 'Срок действия НОК', 'warning', `Истекает менее чем через месяц (${profile.qualification.data.expirationDate})`, 3);
            } else {
                addCheck('nok_valid', 'Срок действия НОК', 'success', `Действителен до ${profile.qualification.data.expirationDate}`, 3);
            }
        }
    } else {
         addCheck('nok_valid', 'Срок действия НОК', 'warning', 'Не удалось определить дату окончания действия', 3);
    }

  } else {
    // NOK is often mandatory for NOSTROY/NOPRIZ
    addCheck('nok_exist', 'Свидетельство НОК', 'error', 'Свидетельство не загружено', 2);
  }

  // Calculate Score
  const score = totalWeights > 0 ? Math.round((passedWeights / totalWeights) * 100) : 0;

  // Determine Overall Status
  let globalStatus: ComplianceStatus = 'success';
  if (checks.some(c => c.status === 'error')) globalStatus = 'error';
  else if (checks.some(c => c.status === 'warning') && score < 100) globalStatus = 'warning';

  // Summary Text
  let summary = "Пакет документов готов к отправке.";
  if (globalStatus === 'error') summary = "Обнаружены критические ошибки. Внесение в реестр невозможно.";
  if (globalStatus === 'warning') summary = "Пакет документов требует внимания, но может быть принят.";
  if (score === 0) summary = "Загрузите документы для проверки.";

  return {
    score,
    status: globalStatus,
    checks,
    summary
  };
};
