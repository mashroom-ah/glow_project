const bcrypt = require('bcryptjs');
const authService = require('../../../src/modules/auth/auth.service');
const { AppUser, RefreshToken } = require('../../../src/database/models');
const waterDailyService = require('../../../src/services/waterDaily.service');

jest.mock('../../../src/database/models', () => ({
  AppUser: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  RefreshToken: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../../src/services/waterDaily.service', () => ({
  createTodayData: jest.fn().mockResolvedValue({}),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      city: 'Moscow',
      height: 175,
      weight: 70,
      birth_date: '1990-01-01',
      activity_level: 'medium',
    };

    test('успешная регистрация нового пользователя', async () => {
      AppUser.findOne.mockResolvedValue(null);
      AppUser.create.mockResolvedValue({ user_id: '123', ...validUserData });

      const result = await authService.register(validUserData);

      expect(AppUser.findOne).toHaveBeenCalledWith({
        where: { email: validUserData.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(validUserData.password, 10);
      expect(AppUser.create).toHaveBeenCalled();
      expect(waterDailyService.createTodayData).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    test('ошибка при регистрации существующего пользователя', async () => {
      AppUser.findOne.mockResolvedValue({ email: validUserData.email });

      await expect(authService.register(validUserData)).rejects.toThrow(
        'User already exists'
      );
      expect(AppUser.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const mockUser = {
      user_id: '123',
      email,
      password_hash: 'hashed_password',
    };

    test('успешный вход', async () => {
      AppUser.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login(email, password);

      expect(AppUser.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password_hash);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
    });

    test('ошибка при неверном пароле', async () => {
      AppUser.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });

    test('ошибка при несуществующем пользователе', async () => {
      AppUser.findOne.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });
});