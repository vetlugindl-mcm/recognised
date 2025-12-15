export interface VariableGroup {
  category: string;
  fields: { label: string; variable: string }[];
}

export const VARIABLES_DATA: VariableGroup[] = [
  {
    category: 'Паспорт РФ',
    fields: [
      { label: 'Фамилия', variable: '{passport_last_name}' },
      { label: 'Имя', variable: '{passport_first_name}' },
      { label: 'Отчество', variable: '{passport_middle_name}' },
      { label: 'Серия и Номер', variable: '{passport_series_number}' },
      { label: 'Дата выдачи', variable: '{passport_date_issued}' },
      { label: 'Код подразделения', variable: '{passport_department_code}' },
      { label: 'Кем выдан', variable: '{passport_issued_by}' },
      { label: 'Дата рождения', variable: '{passport_birth_date}' },
      { label: 'Место рождения', variable: '{passport_birth_place}' },
      { label: 'Адрес регистрации (Полный)', variable: '{passport_registration}' },
      { label: 'Город регистрации', variable: '{passport_reg_city}' },
      { label: 'Улица, дом, кв', variable: '{passport_reg_address}' },
      { label: 'Дата регистрации', variable: '{passport_reg_date}' },
      { label: 'СНИЛС', variable: '{snils}' },
    ]
  },
  {
    category: 'Диплом об образовании',
    fields: [
      { label: 'Фамилия', variable: '{diploma_last_name}' },
      { label: 'Имя', variable: '{diploma_first_name}' },
      { label: 'Отчество', variable: '{diploma_middle_name}' },
      { label: 'Серия', variable: '{diploma_series}' },
      { label: 'Номер', variable: '{diploma_number}' },
      { label: 'Регистрационный номер', variable: '{diploma_reg_number}' },
      { label: 'Учебное заведение', variable: '{diploma_institution}' },
      { label: 'Город', variable: '{diploma_city}' },
      { label: 'Специальность', variable: '{diploma_specialty}' },
      { label: 'Квалификация', variable: '{diploma_qualification}' },
      { label: 'Дата выдачи', variable: '{diploma_date_issued}' },
    ]
  },
  {
    category: 'Свидетельство о квалификации',
    fields: [
      { label: 'Фамилия', variable: '{qualification_last_name}' },
      { label: 'Имя', variable: '{qualification_first_name}' },
      { label: 'Отчество', variable: '{qualification_middle_name}' },
      { label: 'Регистрационный номер', variable: '{qualification_reg_number}' },
      { label: 'Дата выдачи', variable: '{qualification_issue_date}' },
      { label: 'Действителен до', variable: '{qualification_expiration_date}' },
      { label: 'Наименование ЦОК', variable: '{qualification_center_name}' },
      { label: 'Рег. номер ЦОК', variable: '{qualification_center_reg_number}' },
    ]
  },
   {
    category: 'Общее',
    fields: [
      { label: 'Полное ФИО', variable: '{full_name}' },
    ]
  }
];