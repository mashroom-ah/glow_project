const { calculateBaseWater } = require('../../../src/utils/water.utils');

describe('calculateBaseWater', () => {
  test('рассчитывает базовую норму воды: 30 мл/кг', () => {
    const result = calculateBaseWater({ weight: 70, activity_level: 'low' });
    expect(result).toBe(2100);
  });

  test('добавляет 300 мл при средней активности', () => {
    const result = calculateBaseWater({ weight: 70, activity_level: 'medium' });
    // 70 * 30 = 2100 + 300 = 2400
    expect(result).toBe(2400);
  });

  test('добавляет 600 мл при высокой активности', () => {
    const result = calculateBaseWater({ weight: 70, activity_level: 'high' });
    // 70 * 30 = 2100 + 600 = 2700
    expect(result).toBe(2700);
  });

  test('округляет результат', () => {
    const result = calculateBaseWater({ weight: 70.5, activity_level: 'low' });
    expect(result).toBe(Math.round(70.5 * 30));
  });
});