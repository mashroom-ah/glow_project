const { calculateItemStatus } = require('../../../src/utils/itemStatus');

describe('calculateItemStatus', () => {
  const today = new Date();

  test('возвращает expired при просрочке', () => {
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 1);
    const status = calculateItemStatus(pastDate);
    expect(status).toBe('expired');
  });

  test('возвращает expiring при остатке менее 14 дней', () => {
    const closeDate = new Date(today);
    closeDate.setDate(today.getDate() + 7);
    const status = calculateItemStatus(closeDate);
    expect(status).toBe('expiring');
  });

  test('возвращает expiring_soon при остатке 14-30 дней', () => {
    const soonDate = new Date(today);
    soonDate.setDate(today.getDate() + 20);
    const status = calculateItemStatus(soonDate);
    expect(status).toBe('expiring_soon');
  });

  test('возвращает valid при остатке более 30 дней', () => {
    const farDate = new Date(today);
    farDate.setDate(today.getDate() + 60);
    const status = calculateItemStatus(farDate);
    expect(status).toBe('valid');
  });
});