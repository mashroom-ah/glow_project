const routineController = require('../../../src/modules/routine/routine.controller');
const routineService = require('../../../src/modules/routine/routine.service');

jest.mock('../../../src/modules/routine/routine.service', () => ({
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  getByDate: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  validate: jest.fn(),
}));

describe('RoutineController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { user_id: 'user-123' },
      body: {},
      params: {},
      query: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('создаёт новую рутину', async () => {
      const mockRoutine = { routine_id: '1', routine_type: 'morning' };
      routineService.create.mockResolvedValue(mockRoutine);
      req.body = { routine_type: 'morning', steps: [] };

      await routineController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRoutine);
    });
  });

  describe('getAll', () => {
    test('возвращает все рутины', async () => {
      const mockRoutines = [{ routine_id: '1' }, { routine_id: '2' }];
      routineService.getAll.mockResolvedValue(mockRoutines);

      await routineController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRoutines);
    });
  });

  describe('getById', () => {
    test('возвращает рутину по ID', async () => {
      const mockRoutine = { routine_id: '1' };
      routineService.getById.mockResolvedValue(mockRoutine);
      req.params.id = '1';

      await routineController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockRoutine);
    });
  });

  describe('validate', () => {
    test('валидирует рутину', async () => {
      const mockResult = { valid: true, warnings: [] };
      routineService.validate.mockResolvedValue(mockResult);
      req.body = { steps: [] };

      await routineController.validate(req, res);

      expect(res.json).toHaveBeenCalledWith(mockResult);
    });
  });
});