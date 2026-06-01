const { mockUsers, mockRoutines } = require('../../helpers/mockData');

const mockTransaction = {
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../../../src/database/models', () => ({
  RoutineLog: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  RoutineStepLog: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  Routine: {
    findOne: jest.fn(),
  },
  RoutineStep: {
    findAll: jest.fn(),
  },
  SkinReaction: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  ReactionGroupScore: {
    create: jest.fn(),
    destroy: jest.fn(),
  },
  OverallScore: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
  },
}));

const routineLogService = require('../../../src/modules/routine-log/routineLog.service');
const { RoutineLog, Routine, sequelize } = require('../../../src/database/models');

describe('RoutineLogService', () => {
  const userId = mockUsers.regular.user_id;
  const routineId = mockRoutines.morning.routine_id;

  beforeEach(() => {
    jest.clearAllMocks();
    sequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('create', () => {
    test('создаёт лог выполнения рутины', async () => {
      // Мокаем проверку на существующий лог
      RoutineLog.findOne.mockResolvedValue(null);
      
      // Мокаем рутину с шагами
      const mockRoutine = {
        routine_id: routineId,
        RoutineSteps: [
          { routine_step_id: 'step1', frequency_type: 'daily', created_at: new Date() },
        ],
      };
      Routine.findOne.mockResolvedValue(mockRoutine);
      
      // Мокаем создание лога
      const mockCreatedLog = { routine_log_id: 'log1' };
      RoutineLog.create.mockResolvedValue(mockCreatedLog);
      
      // Мокаем getById для возврата созданного лога
      jest.spyOn(routineLogService, 'getById').mockResolvedValue(mockCreatedLog);

      const result = await routineLogService.create(userId, {
        routine_id: routineId,
        completed_at: new Date().toISOString(),
        steps: [{ routine_step_id: 'step1', completed: true }],
      });

      expect(result).toBeDefined();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('getByDate', () => {
    test('возвращает логи за указанную дату', async () => {
      RoutineLog.findAll.mockResolvedValue([]);

      const result = await routineLogService.getByDate(userId, '2024-06-15');

      expect(RoutineLog.findAll).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});