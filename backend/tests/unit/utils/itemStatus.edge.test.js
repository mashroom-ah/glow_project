const { calculateItemStatus } = require('../../../src/utils/itemStatus');

describe('calculateItemStatus - Edge Cases', () => {
  test('граница: ровно 14 дней до истечения', () => {
    const today = new Date();
    const expiringDate = new Date(today);
    expiringDate.setDate(today.getDate() + 14);
    const status = calculateItemStatus(expiringDate);
    // 14 < 14 ? нет, 14 <= 30 ? да -> 'expiring_soon'
    expect(status).toBe('expiring_soon');
  });

  test('граница: ровно 30 дней до истечения', () => {
    const today = new Date();
    const soonDate = new Date(today);
    soonDate.setDate(today.getDate() + 30);
    const status = calculateItemStatus(soonDate);
    expect(status).toBe('expiring_soon');
  });

  test('обрабатывает дату в прошлом', () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 1);
    const status = calculateItemStatus(pastDate);
    expect(status).toBe('expired');
  });

  test('обрабатывает сегодняшнюю дату', () => {
    const today = new Date();
    const status = calculateItemStatus(today);
    // По логике: diffDays = 0, 0 < 14 -> 'expiring'
    expect(status).toBe('expiring');
  });
});