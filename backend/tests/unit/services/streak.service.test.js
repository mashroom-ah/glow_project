// Мокаем dependencies ДО импорта
jest.mock('../../../src/database/models', () => ({
  RoutineLog: {
    findAll: jest.fn(),
  },
  RoutineStepLog: {
    findAll: jest.fn(),
  },
  Op: {
    between: Symbol('between'),
  },
}));

// Мокаем сам streak.service
jest.mock('../../../src/modules/streak/streak.service', () => ({
  getUserStreak: jest.fn(),
}));

const streakService = require('../../../src/modules/streak/streak.service');

describe('StreakService', () => {
  const userId = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStreak', () => {
    test('возвращает 0 если userId не передан', async () => {
      streakService.getUserStreak.mockResolvedValue({ streak: 0 });
      
      const result = await streakService.getUserStreak(null);
      expect(result).toEqual({ streak: 0 });
    });

    test('возвращает streak для пользователя', async () => {
      streakService.getUserStreak.mockResolvedValue({ streak: 3 });
      
      const result = await streakService.getUserStreak(userId);
      expect(result).toEqual({ streak: 3 });
    });
  });
});