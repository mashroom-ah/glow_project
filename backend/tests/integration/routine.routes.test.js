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
  },
  RoutineLog: {
    findOne: jest.fn(),
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
  validateRoutine: jest.fn().mockReturnValue({ valid: true, warnings: [] }),
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
        { product_id: 'product-2', step_order: 2 },
      ],
    };

    test('создаёт новую рутину', async () => {
      Routine.create.mockResolvedValue({ routine_id: 'new-routine-id' });
      Product.findByPk.mockResolvedValue({ product_id: 'product-1', group_id: 'group-1', component_id: null });
      GroupComponent.findOne.mockResolvedValue(true);
      RoutineStep.create.mockResolvedValue({});

      const response = await request(app)
        .post('/routines')
        .send(newRoutine);

      expect(response.status).toBe(201);
    });

    test('возвращает 400 при ошибке', async () => {
      Routine.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/routines')
        .send(newRoutine);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /routines', () => {
    test('возвращает все рутины пользователя', async () => {
      Routine.findAll.mockResolvedValue([
        { routine_id: '1', routine_type: 'morning', RoutineSteps: [] },
        { routine_id: '2', routine_type: 'evening', RoutineSteps: [] },
      ]);

      const response = await request(app).get('/routines');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /routines/today', () => {
    test('возвращает рутины на сегодня', async () => {
      Routine.findAll.mockResolvedValue([
        {
          routine_id: '1',
          routine_type: 'morning',
          toJSON: () => ({
            routine_id: '1',
            routine_type: 'morning',
            RoutineSteps: [
              { routine_step_id: 's1', frequency_type: 'daily', step_order: 1, created_at: new Date() },
            ],
          }),
        },
      ]);
      RoutineLog.findOne.mockResolvedValue(null);

      const response = await request(app).get('/routines/today');

      expect(response.status).toBe(200);
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

    test('возвращает 404 если рутина не найдена', async () => {
      Routine.findOne.mockResolvedValue(null);

      const response = await request(app).get('/routines/not-found');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /routines/:id', () => {
    const updateData = {
      routine_type: 'evening',
      steps: [{ product_id: 'product-1', step_order: 1 }],
    };

    test('обновляет рутину', async () => {
      const oldRoutine = { update: jest.fn().mockResolvedValue(true) };
      Routine.findOne.mockResolvedValueOnce(oldRoutine);
      Routine.create.mockResolvedValue({ routine_id: 'new-id' });
      Product.findByPk.mockResolvedValue({ product_id: 'product-1' });
      Routine.findOne.mockResolvedValueOnce({ routine_id: 'new-id', RoutineSteps: [] });

      const response = await request(app)
        .put('/routines/routine-123')
        .send(updateData);

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /routines/:id', () => {
    test('архивирует рутину', async () => {
      const mockRoutine = { update: jest.fn().mockResolvedValue(true) };
      Routine.findOne.mockResolvedValue(mockRoutine);

      const response = await request(app).delete('/routines/routine-123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Routine archived successfully');
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

      expect(response.status).toBe(200);
      // Проверяем, что ответ содержит поле valid
      expect(response.body).toHaveProperty('valid');
    });
  });
});