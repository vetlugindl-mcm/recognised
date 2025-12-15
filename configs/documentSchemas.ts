import { 
    IdentificationIcon, 
    AcademicCapIcon, 
    ClipboardDocumentCheckIcon,
    DocumentIcon,
    TagIcon // Used for SNILS
} from '../components/icons/index';

// We use loose typing for keys (string) in the config to avoid circular dependency hell,
// but the components consuming this will enforce strict typing against the actual Data objects.

export interface SchemaField {
    key: string;
    label: string;
    fullWidth?: boolean;
}

export interface SchemaSection {
    id: string;
    title: string;
    fields: SchemaField[];
}

export interface DocumentSchema {
    title: string;
    icon: any; // React Component
    sections: SchemaSection[];
    isDarkHeader?: boolean;
}

export type SupportedDocTypes = 'passport' | 'diploma' | 'qualification' | 'snils';

export const DOCUMENT_SCHEMAS: Record<SupportedDocTypes, DocumentSchema> = {
    passport: {
        title: "Паспорт РФ",
        icon: IdentificationIcon,
        isDarkHeader: true,
        sections: [
            {
                id: "personal",
                title: "01. Личные данные",
                fields: [
                    { key: "lastName", label: "Фамилия" },
                    { key: "firstName", label: "Имя" },
                    { key: "middleName", label: "Отчество", fullWidth: true },
                    { key: "birthDate", label: "Дата рождения" },
                    { key: "birthPlace", label: "Место рождения" },
                    { key: "snils", label: "СНИЛС" }
                ]
            },
            {
                id: "document",
                title: "02. Паспортные данные",
                fields: [
                    { key: "seriesNumber", label: "Серия / Номер" },
                    { key: "departmentCode", label: "Код подразделения" },
                    { key: "issuedBy", label: "Кем выдан", fullWidth: true },
                    { key: "dateIssued", label: "Дата выдачи" }
                ]
            },
            {
                id: "registration",
                title: "03. Прописка",
                fields: [
                    { key: "registrationCity", label: "Город" },
                    { key: "registrationDate", label: "Дата регистрации" },
                    { key: "registrationStreet", label: "Улица", fullWidth: true },
                    { key: "registrationHouse", label: "Дом / Корпус" },
                    { key: "registrationFlat", label: "Квартира" }
                ]
            }
        ]
    },
    diploma: {
        title: "Диплом",
        icon: AcademicCapIcon,
        sections: [
            {
                id: "graduate",
                title: "01. Выпускник",
                fields: [
                    { key: "lastName", label: "Фамилия" },
                    { key: "firstName", label: "Имя" },
                    { key: "middleName", label: "Отчество", fullWidth: true }
                ]
            },
            {
                id: "education",
                title: "02. Образование",
                fields: [
                    { key: "institution", label: "Учебное заведение", fullWidth: true },
                    { key: "city", label: "Город" },
                    { key: "dateIssued", label: "Дата окончания" }
                ]
            },
            {
                id: "details",
                title: "03. Квалификация",
                fields: [
                    { key: "specialty", label: "Специальность", fullWidth: true },
                    { key: "qualification", label: "Квалификация", fullWidth: true }
                ]
            },
            {
                id: "meta",
                title: "04. Реквизиты",
                fields: [
                    { key: "series", label: "Серия" },
                    { key: "number", label: "Номер" },
                    { key: "regNumber", label: "Рег. номер", fullWidth: true }
                ]
            }
        ]
    },
    qualification: {
        title: "Независимая оценка",
        icon: ClipboardDocumentCheckIcon,
        isDarkHeader: true,
        sections: [
            {
                id: "person",
                title: "01. Соискатель",
                fields: [
                    { key: "lastName", label: "Фамилия" },
                    { key: "firstName", label: "Имя" },
                    { key: "middleName", label: "Отчество", fullWidth: true }
                ]
            },
            {
                id: "cert",
                title: "02. Свидетельство",
                fields: [
                    { key: "registrationNumber", label: "Рег. номер", fullWidth: true },
                    { key: "issueDate", label: "Дата выдачи" },
                    { key: "expirationDate", label: "Действителен до" }
                ]
            },
            {
                id: "center",
                title: "03. Центр оценки (ЦОК)",
                fields: [
                    { key: "assessmentCenterName", label: "Наименование ЦОК", fullWidth: true },
                    { key: "assessmentCenterRegNumber", label: "Номер ЦОК", fullWidth: true }
                ]
            }
        ]
    },
    snils: {
        title: "СНИЛС",
        icon: TagIcon,
        sections: [
            {
                id: "info",
                title: "Страховое свидетельство",
                fields: [
                    { key: "snils", label: "Номер СНИЛС", fullWidth: true },
                    { key: "lastName", label: "Фамилия" },
                    { key: "firstName", label: "Имя" },
                    { key: "middleName", label: "Отчество", fullWidth: true },
                    { key: "dateIssued", label: "Дата регистрации" }
                ]
            }
        ]
    }
};

export const getDocumentSchema = (type: string): DocumentSchema | null => {
    if (type in DOCUMENT_SCHEMAS) {
        return DOCUMENT_SCHEMAS[type as SupportedDocTypes];
    }
    return null;
};