const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

jest.mock('../../src/database/models', () => {
  const mockUser = {
    user_id: 'test-user-id',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    name: 'Test User',
    city: 'Moscow',
    height: 175,
    weight: 70,
    birth_date: '1990-01-01',
    activity_level: 'medium',
    water_avg: 2100,
  };

  return {
    AppUser: {
      findOne: jest.fn(),
      create: jest.fn(),
      findByPk: jest.fn(),
    },
    RefreshToken: {
      create: jest.fn(),
      findOne: jest.fn(),
    },
    sequelize: {
      transaction: jest.fn(() => ({
        commit: jest.fn(),
        rollback: jest.fn(),
      })),
    },
  };
});

jest.mock('../../src/services/waterDaily.service', () => ({
  createTodayData: jest.fn().mockResolvedValue({}),
}));

jest.mock('../../src/utils/water.utils', () => ({
  calculateBaseWater: jest.fn().mockReturnValue(2100),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ user_id: 'test-user-id' }),
}));

const { AppUser, RefreshToken } = require('../../src/database/models');

const app = express();
app.use(express.json());
app.use('/auth', require('../../src/modules/auth/auth.routes'));

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    const validUser = {
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      city: 'Moscow',
      height: 175,
      weight: 70,
      birth_date: '1990-01-01',
      activity_level: 'medium',
    };

    test('успешная регистрация', async () => {
      AppUser.findOne.mockResolvedValue(null);
      AppUser.create.mockResolvedValue({ user_id: 'new-id', ...validUser });
      RefreshToken.create.mockResolvedValue({});

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
      // В ответе есть access_token от мока
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    test('ошибка валидации при некорректных данных', async () => {
      const invalidUser = { ...validUser, email: 'not-an-email' };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('POST /auth/login', () => {
    const mockUser = {
      user_id: 'test-id',
      email: 'test@example.com',
      password_hash: 'hashed',
    };

    test('успешный вход', async () => {
      AppUser.findOne.mockResolvedValue(mockUser);
      bcrypt.compare = jest.fn().mockResolvedValue(true);
      RefreshToken.create.mockResolvedValue({});

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
    });

    test('ошибка при неверных данных', async () => {
      AppUser.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' });

      expect(response.status).toBe(401);
    });
  });
});