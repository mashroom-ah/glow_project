const request = require('supertest');
const express = require('express');

// Мокаем ВСЕ зависимости до импорта роутов
jest.mock('../../src/database/models', () => ({
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
}));

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

// Мокаем config, чтобы избежать ошибки
jest.mock('../../src/config/config', () => ({
  development: {
    username: 'test',
    password: 'test',
    database: 'test_db',
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
  },
  test: {
    username: 'test',
    password: 'test',
    database: 'test_db',
    host: 'localhost',
    dialect: 'postgres',
    port: 5432,
  },
}));

// Мокаем authMiddleware
jest.mock('../../src/middlewares/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { user_id: 'test-user-id' };
    next();
  };
});

// Мокаем auth.service напрямую, чтобы не загружать зависимости
jest.mock('../../src/modules/auth/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
}));

const authService = require('../../src/modules/auth/auth.service');

// Создаём приложение и подключаем роуты
const app = express();
app.use(express.json());

// Подключаем роуты (теперь зависимости замоканы)
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
      const mockResponse = {
        user: { email: validUser.email, name: validUser.name, user_id: 'new-id' },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
      authService.register.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/register')
        .send(validUser);

      expect(response.status).toBe(201);
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
    test('успешный вход', async () => {
      const mockResponse = {
        user: { email: 'test@example.com', user_id: 'test-id' },
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      };
      authService.login.mockResolvedValue(mockResponse);

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
    });

    test('ошибка при неверных данных', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      const response = await request(app)
        .post('/auth/login')
        .send({ email: 'wrong@example.com', password: 'wrong' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /auth/me', () => {
    test('возвращает данные пользователя', async () => {
      const response = await request(app).get('/auth/me');

      expect(response.status).toBe(200);
    });
  });
});