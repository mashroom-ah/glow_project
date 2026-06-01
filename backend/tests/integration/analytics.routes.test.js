const request = require('supertest');
const express = require('express');

jest.mock('../../src/database/models', () => ({
  RoutineLog: {
    findAll: jest.fn(),
  },
  Routine: {},
  RoutineStepLog: {},
  OverallScore: {
    findAll: jest.fn(),
  },
  SkinReaction: {
    findAll: jest.fn(),
  },
  Reaction: {},
  ReactionGroup: {},
  sequelize: {
    fn: jest.fn(),
    col: jest.fn(),
  },
}));

jest.mock('../../src/middlewares/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { user_id: 'test-user-id' };
    next();
  };
});

const { RoutineLog, OverallScore, SkinReaction } = require('../../src/database/models');

const app = express();
app.use(express.json());
app.use('/analytics', require('../../src/modules/analytics/analytics.routes'));

describe('Analytics Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /analytics/routine', () => {
    test('возвращает аналитику по рутинам', async () => {
      RoutineLog.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/analytics/routine')
        .query({ type: 'morning', period: 'week', end_date: '2024-06-15' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type', 'morning');
      expect(response.body).toHaveProperty('period', 'week');
      expect(response.body).toHaveProperty('data');
    });

    test('возвращает 400 при отсутствии обязательных параметров', async () => {
      const response = await request(app)
        .get('/analytics/routine')
        .query({ type: 'morning' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('period is required');
    });
  });

  describe('GET /analytics/skin', () => {
    test('возвращает аналитику по оценкам кожи', async () => {
      OverallScore.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/analytics/skin')
        .query({ period: 'week', end_date: '2024-06-15' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('period', 'week');
    });
  });

  describe('GET /analytics/reaction-groups', () => {
    test('возвращает аналитику по группам реакций', async () => {
      SkinReaction.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/analytics/reaction-groups')
        .query({ period: 'month', end_date: '2024-06-15' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('period', 'month');
    });
  });
});