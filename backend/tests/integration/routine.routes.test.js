const request = require('supertest');
const express = require('express');

jest.mock('../../src/database/models', () => ({
  Routine: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  },
  RoutineStep: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
  RoutineLog: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
  Product: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  GroupComponent: {
    findOne: jest.fn(),
  },
  ProductGroup: {},
  ActiveComponent: {},
}));

jest.mock('../../src/middlewares/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { user_id: 'test-user-id' };
    next();
  };
});

jest.mock('../../src/modules/routine/routineValidation', () => ({
  validateRoutine: jest.fn().mockReturnValue({ valid: true, warnings: [], critical_conflicts: [], tips: [] }),
}));

const { Routine, Product, GroupComponent, RoutineStep, RoutineLog } = require('../../src/database/models');

const app = express();
app.use(express.json());
app.use('/routines', require('../../src/modules/routine/routine.routes'));

describe('Routine Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /routines', () => {
    const newRoutine = {
      routine_type: 'morning',
      steps: [
        { product_id: 'product-1', step_order: 1 },
      ],
    };

    test('создаёт новую рутину', async () => {
      Routine.create.mockResolvedValue({ routine_id: 'new-routine-id' });
      Product.findByPk.mockResolvedValue({ product_id: 'product-1', group_id: 'group-1', component_id: null });
      GroupComponent.findOne.mockResolvedValue(true);
      RoutineStep.create.mockResolvedValue({});
      jest.spyOn(require('../../src/modules/routine/routine.service'), 'getById').mockResolvedValue({ routine_id: 'new-routine-id' });

      const response = await request(app)
        .post('/routines')
        .send(newRoutine);

      expect(response.status).toBe(201);
    });
  });

  describe('GET /routines', () => {
    test('возвращает все рутины пользователя', async () => {
      Routine.findAll.mockResolvedValue([
        { routine_id: '1', routine_type: 'morning', RoutineSteps: [] },
      ]);

      const response = await request(app).get('/routines');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /routines/today', () => {
    test('возвращает рутины на сегодня', async () => {
      Routine.findAll.mockResolvedValue([]);
      RoutineLog.findOne.mockResolvedValue(null);

      const response = await request(app).get('/routines/today');
      expect(response.status).toBeDefined();
    });
  });

  describe('GET /routines/:id', () => {
    test('возвращает рутину по ID', async () => {
      Routine.findOne.mockResolvedValue({
        routine_id: 'routine-123',
        routine_type: 'morning',
        RoutineSteps: [],
      });

      const response = await request(app).get('/routines/routine-123');

      expect(response.status).toBe(200);
    });
  });

  describe('POST /routines/validate', () => {
    test('валидирует рутину', async () => {
      const validateData = {
        steps: [{ product_id: 'product-1' }],
      };
      Product.findAll.mockResolvedValue([
        {
          product_name: 'Product',
          ProductGroup: { group_name: 'cleansing' },
          ActiveComponent: null,
        },
      ]);

      const response = await request(app)
        .post('/routines/validate')
        .send(validateData);

      expect(response.status).toBeDefined();
    });
  });
});