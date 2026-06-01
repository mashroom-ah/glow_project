const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

jest.mock('../../src/database/models', () => ({
  WaterLog: {
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/middlewares/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { user_id: 'test-user-id' };
    next();
  };
});

const { WaterLog } = require('../../src/database/models');

const app = express();
app.use(express.json());
app.use('/water', require('../../src/modules/water/water.routes'));

describe('Water Routes', () => {
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /water/today', () => {
    test('возвращает водный лог за сегодня', async () => {
      const mockWaterLog = {
        date: today,
        achieved_amount: 750,
        target_amount: 2000,
      };
      WaterLog.findOne.mockResolvedValue(mockWaterLog);

      const response = await request(app).get('/water/today');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        date: today,
        achieved_amount: 750,
        target_amount: 2000,
      });
    });

    test('ошибка если лог не найден', async () => {
      WaterLog.findOne.mockResolvedValue(null);

      const response = await request(app).get('/water/today');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Water log not found');
    });
  });

  describe('POST /water/add', () => {
    test('добавляет воду', async () => {
      const mockWaterLog = {
        achieved_amount: 500,
        save: jest.fn().mockResolvedValue(true),
      };
      WaterLog.findOne.mockResolvedValue(mockWaterLog);

      const response = await request(app)
        .post('/water/add')
        .send({ amount_ml: 250 });

      expect(response.status).toBe(200);
      expect(response.body.achieved_amount).toBe(750);
    });
  });

  describe('POST /water/subtract', () => {
    test('удаляет воду', async () => {
      const mockWaterLog = {
        achieved_amount: 500,
        save: jest.fn().mockResolvedValue(true),
      };
      WaterLog.findOne.mockResolvedValue(mockWaterLog);

      const response = await request(app)
        .post('/water/subtract')
        .send({ amount_ml: 100 });

      expect(response.status).toBe(200);
      expect(response.body.achieved_amount).toBe(400);
    });
  });
});