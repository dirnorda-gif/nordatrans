// src/utils/calculator/validation.ts
// Функции валидации для калькулятора

console.log('📦 [Validation] Загрузка модуля валидации');

/**
 * Валидация полей маршрута
 */
export const validateRouteFields = (
  fromCity: string,
  toCity: string,
  fromCoordinates?: [number, number],
  toCoordinates?: [number, number]
): { isValid: boolean; errors: { from?: string; to?: string } } => {
  console.log('🔍 [validateRouteFields] Валидация маршрута');
  console.log('  Откуда:', fromCity, fromCoordinates ? '✅' : '❌');
  console.log('  Куда:', toCity, toCoordinates ? '✅' : '❌');

  const errors: { from?: string; to?: string } = {};

  if (!fromCity || !fromCity.trim()) {
    console.log('❌ [validateRouteFields] Поле "Откуда" пустое');
    errors.from = "Укажите город отправления";
  } else if (!fromCoordinates) {
    console.log('❌ [validateRouteFields] Не выбран город из подсказок (откуда)');
    errors.from = "Выберите город из списка подсказок";
  }

  if (!toCity || !toCity.trim()) {
    console.log('❌ [validateRouteFields] Поле "Куда" пустое');
    errors.to = "Укажите город назначения";
  } else if (!toCoordinates) {
    console.log('❌ [validateRouteFields] Не выбран город из подсказок (куда)');
    errors.to = "Выберите город из списка подсказок";
  }

  const isValid = Object.keys(errors).length === 0;
  console.log(isValid ? '✅ [validateRouteFields] Валидация пройдена' : '❌ [validateRouteFields] Валидация не пройдена');

  return { isValid, errors };
};

/**
 * Валидация типа перевозки
 */
export const validateTransportType = (
  transportType: string
): { isValid: boolean; error?: string } => {
  console.log('🔍 [validateTransportType] Валидация типа перевозки:', transportType);

  if (!transportType || transportType.trim() === "") {
    console.log('❌ [validateTransportType] Тип перевозки не выбран');
    return { isValid: false, error: "Выберите тип перевозки" };
  }

  console.log('✅ [validateTransportType] Валидация пройдена');
  return { isValid: true };
};

/**
 * Валидация параметров домашнего переезда
 */
export const validateMovingParams = (data: {
  movingItems: { boxes: boolean; furniture: boolean; appliances: boolean };
  volumeIndex: number;
  weightIndex: number;
}): { isValid: boolean; errors: { items?: string; volume?: string; weight?: string } } => {
  console.log('🔍 [validateMovingParams] Валидация параметров домашнего переезда');
  console.log('  Выбранные предметы:', data.movingItems);
  console.log('  Индекс объёма:', data.volumeIndex);
  console.log('  Индекс веса:', data.weightIndex);

  const errors: { items?: string; volume?: string; weight?: string } = {};

  // Проверяем, выбран ли хотя бы один предмет
  const hasSelectedItems =
    data.movingItems.boxes ||
    data.movingItems.furniture ||
    data.movingItems.appliances;

  if (!hasSelectedItems) {
    console.log('❌ [validateMovingParams] Не выбрано ни одного предмета');
    errors.items = "Выберите хотя бы один тип предметов";
  }

  // Проверяем объём (должен быть > 0)
  if (data.volumeIndex === 0) {
    console.log('❌ [validateMovingParams] Объём равен 0');
    errors.volume = "Укажите объём груза";
  }

  const isValid = Object.keys(errors).length === 0;
  console.log(isValid ? '✅ [validateMovingParams] Валидация пройдена' : '❌ [validateMovingParams] Валидация не пройдена');

  return { isValid, errors };
};

/**
 * Валидация параметров промышленных товаров
 */
export const validateCargoParams = (data: {
  packaging: string;
  palletCount?: string;
  palletWeightPerKg?: string;
  nature: string;
  volumeIndex: number;
  weightIndex: number;
}): { isValid: boolean; errors: Record<string, string> } => {
  console.log('🔍 [validateCargoParams] Валидация параметров промышленных товаров');
  console.log('  Упаковка:', data.packaging);
  console.log('  Количество палет:', data.palletCount);
  console.log('  Характер груза:', data.nature);

  const errors: Record<string, string> = {};

  if (!data.packaging) {
    console.log('❌ [validateCargoParams] Упаковка не выбрана');
    errors.packaging = "Выберите тип упаковки";
  }

  if (data.packaging === "pallets") {
    if (!data.palletCount || parseInt(data.palletCount) <= 0) {
      console.log('❌ [validateCargoParams] Некорректное количество палет');
      errors.palletCount = "Укажите количество палет";
    }
    if (!data.palletWeightPerKg || parseFloat(data.palletWeightPerKg) <= 0) {
      console.log('❌ [validateCargoParams] Некорректный вес палеты');
      errors.palletWeight = "Укажите вес одной палеты";
    }
  }

  if (!data.nature || data.nature.trim() === "") {
    console.log('❌ [validateCargoParams] Характер груза не указан');
    errors.nature = "Укажите характер груза";
  }

  if (data.volumeIndex === 0) {
    console.log('❌ [validateCargoParams] Объём равен 0');
    errors.volume = "Укажите объём груза";
  }

  const isValid = Object.keys(errors).length === 0;
  console.log(isValid ? '✅ [validateCargoParams] Валидация пройдена' : '❌ [validateCargoParams] Валидация не пройдена');

  return { isValid, errors };
};

/**
 * Валидация параметров продуктов питания
 */
export const validateFoodParams = (data: {
  truckType: string;
  temperatureMode: string;
  packaging: string;
  palletCount?: string;
  palletWeightPerKg?: string;
  volumeIndex: number;
  weightIndex: number;
}): { isValid: boolean; errors: Record<string, string> } => {
  console.log('🔍 [validateFoodParams] Валидация параметров продуктов питания');
  console.log('  Тип машины:', data.truckType);
  console.log('  Температурный режим:', data.temperatureMode);
  console.log('  Упаковка:', data.packaging);

  const errors: Record<string, string> = {};

  if (!data.truckType) {
    console.log('❌ [validateFoodParams] Тип машины не выбран');
    errors.truckType = "Выберите тип машины";
  }

  if (!data.temperatureMode) {
    console.log('❌ [validateFoodParams] Температурный режим не выбран');
    errors.temperatureMode = "Выберите температурный режим";
  }

  if (!data.packaging) {
    console.log('❌ [validateFoodParams] Упаковка не выбрана');
    errors.packaging = "Выберите тип упаковки";
  }

  if (data.packaging === "pallets") {
    if (!data.palletCount || parseInt(data.palletCount) <= 0) {
      console.log('❌ [validateFoodParams] Некорректное количество палет');
      errors.palletCount = "Укажите количество палет";
    }
    if (!data.palletWeightPerKg || parseFloat(data.palletWeightPerKg) <= 0) {
      console.log('❌ [validateFoodParams] Некорректный вес палеты');
      errors.palletWeight = "Укажите вес одной палеты";
    }
  }

  if (data.volumeIndex === 0) {
    console.log('❌ [validateFoodParams] Объём равен 0');
    errors.volume = "Укажите объём груза";
  }

  const isValid = Object.keys(errors).length === 0;
  console.log(isValid ? '✅ [validateFoodParams] Валидация пройдена' : '❌ [validateFoodParams] Валидация не пройдена');

  return { isValid, errors };
};

/**
 * Валидация параметров "Другое"
 */
export const validateOtherParams = (data: {
  packaging: string;
  palletCount?: string;
  palletWeightPerKg?: string;
  nature: string;
  volumeIndex: number;
  weightIndex: number;
}): { isValid: boolean; errors: Record<string, string> } => {
  console.log('🔍 [validateOtherParams] Валидация параметров "Другое"');
  
  // Используем ту же логику, что и для промышленных товаров
  return validateCargoParams(data);
};

/**
 * Валидация контактных данных
 */
export const validateContact = (
  contact: string,
  method: "phone" | "whatsapp"
): { isValid: boolean; error?: string } => {
  console.log('🔍 [validateContact] Валидация контакта');
  console.log('  Метод:', method);
  console.log('  Контакт:', contact);

  if (!contact || contact.trim() === "") {
    console.log('❌ [validateContact] Контакт пустой');
    return {
      isValid: false,
      error: method === "phone" ? "Укажите номер телефона" : "Укажите номер WhatsApp",
    };
  }

  // Простая проверка на наличие цифр
  const hasDigits = /\d/.test(contact);
  if (!hasDigits) {
    console.log('❌ [validateContact] Контакт не содержит цифр');
    return {
      isValid: false,
      error: "Укажите корректный номер",
    };
  }

  console.log('✅ [validateContact] Валидация пройдена');
  return { isValid: true };
};

console.log('✅ [Validation] Модуль валидации загружен');

