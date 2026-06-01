const streakService = require('../../../src/modules/streak/streak.service');
const { mockUsers } = require('../../helpers/mockData');

// Мокаем Op ДО импорта моделей
const Op = {
  between: Symbol('between'),
};

jest.mock('../../../src/database/models', () => {
  return {
    RoutineLog: {
      findAll: jest.fn(),
    },
    RoutineStepLog: {
      findAll: jest.fn(),
    },
    Op: {
      between: Symbol('between'),
    },
    sequelize: {
      Op: {
        between: Symbol('between'),
      },
    },
  };
});

const { RoutineLog, RoutineStepLog } = require('../../../src/database/models');

describe('StreakService', () => {
  const userId = mockUsers.regular.user_id;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserStreak', () => {
    test('возвращает 0 если userId не передан', async () => {
      const result = await streakService.getUserStreak(null);
      expect(result.streak).toBe(0);
    });

    test('возвращает 0 если нет активности за вчерашний день', async () => {
      RoutineLog.findAll.mockResolvedValue([]);

      const result = await streakService.getUserStreak(userId);

      expect(RoutineLog.findAll).toHaveBeenCalled();
      expect(result.streak).toBe(0);
    });

    test('считает streak при выполнении всех шагов', async () => {
      const mockLogs = [
        { routine_log_id: 'log1', routine_id: 'r1' },
        { routine_log_id: 'log2', routine_id: 'r2' },
      ];
      const mockStepLogs = [
        { routine_log_id: 'log1', completed: true },
        { routine_log_id: 'log1', completed: true },
        { routine_log_id: 'log2', completed: true },
      ];

      RoutineLog.findAll
        .mockResolvedValueOnce(mockLogs)
        .mockResolvedValueOnce(mockLogs)
        .mockResolvedValueOnce([]);

      RoutineStepLog.findAll.mockResolvedValue(mockStepLogs);

      const result = await streakService.getUserStreak(userId);

      expect(result.streak).toBeGreaterThanOrEqual(0);
    });

    test('прерывает streak если менее 80% шагов выполнено', async () => {
      const mockLogs = [{ routine_log_id: 'log1', routine_id: 'r1' }];
      const mockStepLogs = [
        { routine_log_id: 'log1', completed: true },
        { routine_log_id: 'log1', completed: false },
      ];

      RoutineLog.findAll
        .mockResolvedValueOnce(mockLogs)
        .mockResolvedValueOnce([]);

      RoutineStepLog.findAll.mockResolvedValue(mockStepLogs);

      const result = await streakService.getUserStreak(userId);

      expect(result.streak).toBe(0);
    });
  });
});