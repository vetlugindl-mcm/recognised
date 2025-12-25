import { AnalysisItem } from '../types';

/**
 * Определяет приоритет отображения документа.
 * Меньшее число = выше в списке.
 */
export const getDocumentPriority = (type: string | undefined): number => {
  switch (type) {
    case 'passport': return 0;
    case 'snils': return 1;
    case 'qualification': return 2;
    case 'diploma': return 3;
    default: return 99;
  }
};

/**
 * Сортирует массив результатов анализа согласно бизнес-логике приоритетов.
 * Создает новый массив, не мутируя исходный.
 */
export const sortAnalysisResults = (items: AnalysisItem[]): AnalysisItem[] => {
  return [...items].sort((a, b) => {
    const priorityA = getDocumentPriority(a.data?.type);
    const priorityB = getDocumentPriority(b.data?.type);
    return priorityA - priorityB;
  });
};
