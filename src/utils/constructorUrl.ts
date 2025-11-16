// Утилита для генерации ссылки на конструктор переезда

import type { SelectedItem } from "@/components/MovingConstructor";

/**
 * Генерирует URL для конструктора переезда с выбранными предметами
 * @param selectedItems - массив выбранных предметов с количеством
 * @returns URL для открытия конструктора с сохранёнными данными
 */
export function generateConstructorUrl(selectedItems: SelectedItem[]): string {
  // Кодируем данные в base64 для компактности
  const data = selectedItems.map(si => ({
    id: si.item.id,
    q: si.quantity // сокращаем quantity до q для компактности URL
  }));
  
  const jsonString = JSON.stringify(data);
  const base64 = btoa(encodeURIComponent(jsonString));
  
  // Возвращаем полный URL (в продакшене это будет реальный домен)
  const baseUrl = window.location.origin;
  return `${baseUrl}/constructor?data=${base64}`;
}

/**
 * Форматирует список предметов для отправки в Bitrix24
 * @param selectedItems - массив выбранных предметов с количеством
 * @returns отформатированная строка со списком предметов
 */
export function formatConstructorItemsForBitrix(selectedItems: SelectedItem[]): string {
  if (!selectedItems || selectedItems.length === 0) {
    return "Предметы не указаны";
  }
  
  let result = "\n\n📦 СПИСОК ПРЕДМЕТОВ ИЗ КОНСТРУКТОРА:\n";
  result += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  
  selectedItems.forEach((si, index) => {
    const { item, quantity } = si;
    result += `${index + 1}. ${item.name}\n`;
    result += `   Количество: ${quantity} шт.\n`;
    result += `   Габариты: ${item.length}×${item.width}×${item.height} см\n`;
    result += `   Объём единицы: ${item.volume.toFixed(3)} м³\n`;
    result += `   Общий объём: ${(item.volume * quantity).toFixed(3)} м³\n\n`;
  });
  
  const totalVolume = selectedItems.reduce((sum, si) => sum + si.item.volume * si.quantity, 0);
  result += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  result += `ИТОГО: ${totalVolume.toFixed(3)} м³ (без учёта коэффициента упаковки)\n`;
  
  return result;
}

