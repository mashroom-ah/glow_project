const { calculateExpirationDate } = require('../../../src/utils/expirationDate');

describe('calculateExpirationDate', () => {
  const productionDate = '2024-01-01';
  const shelfLifeClosed = 365;

  test('рассчитывает срок годности от даты производства', () => {
    const result = calculateExpirationDate({
      production_date: productionDate,
      shelf_life_closed: shelfLifeClosed,
    });

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString().split('T')[0]).toBe('2024-12-31');
  });

  test('использует переданную expiration_date', () => {
    const expirationDate = '2024-06-01';
    const result = calculateExpirationDate({
      production_date: productionDate,
      shelf_life_closed: shelfLifeClosed,
      expiration_date: expirationDate,
    });

    // result может быть строкой или Date
    const resultDate = result instanceof Date ? result : new Date(result);
    expect(resultDate.toISOString().split('T')[0]).toBe('2024-06-01');
  });

  test('при открытом продукте берёт ближайшую дату', () => {
    const openedAt = '2024-03-01';
    const shelfLifeOpen = 90;

    const result = calculateExpirationDate({
      production_date: productionDate,
      shelf_life_closed: shelfLifeClosed,
      opened_at: openedAt,
      shelf_life_open: shelfLifeOpen,
    });

    const resultDate = result instanceof Date ? result : new Date(result);
    expect(resultDate.toISOString().split('T')[0]).toBe('2024-05-30');
  });

  test('использует данные из currentItem при отсутствии в data', () => {
    const currentItem = {
      production_date: productionDate,
      shelf_life_closed: shelfLifeClosed,
    };

    const result = calculateExpirationDate({}, currentItem);
    const resultDate = result instanceof Date ? result : new Date(result);
    expect(resultDate.toISOString().split('T')[0]).toBe('2024-12-31');
  });
});