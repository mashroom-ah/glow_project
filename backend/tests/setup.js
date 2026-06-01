/**
 * Глобальная настройка тестового окружения
 * Запускается перед всеми тестами
 */

// Мок для uuid ДО ВСЕГО ОСТАЛЬНОГО
jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123',
  validate: () => true,
  version: () => 4,
  NIL: '00000000-0000-0000-0000-000000000000',
}));

// Устанавливаем NODE_ENV в test
process.env.NODE_ENV = 'test';

// Загружаем переменные окружения для тестов
require('dotenv').config({ path: '.env.test' });

// Устанавливаем тестовые значения по умолчанию
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret_key_for_jwt';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_key_for_jwt';
process.env.PORT = process.env.PORT || '5001';
process.env.DB_NAME = process.env.DB_NAME || 'glow_test';
process.env.DB_USER = process.env.DB_USER || 'test_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'test_password';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'test_weather_api_key';

// Глобальные моки для всех тестов

// 1. Мок для weatherService
jest.mock('../src/services/weather.service', () => ({
  getDailyEnvironment: jest.fn().mockResolvedValue({
    temperature_avg: 22.5,
    humidity_avg: 55,
    uv_index: 5,
    recommended_spf: 30,
    hydration_multiplier: 1.1,
  }),
  calculateRecommendedSpf: jest.fn((uv) => {
    if (uv <= 2) return 15;
    if (uv <= 5) return 30;
    return 50;
  }),
  calculateHydrationMultiplier: jest.fn(() => 1.1),
  calculateTargetWater: jest.fn((waterAvg, hydrationMultiplier) => Math.round(waterAvg * hydrationMultiplier)),
}));

// 2. Мок для webpush
jest.mock('../src/config/webpush', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue(undefined),
}));

// 3. Мок для bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockImplementation((password, salt) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn().mockImplementation((password, hash) => Promise.resolve(password === hash?.replace('hashed_', ''))),
}));

// 4. Мок для jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid-token' || token === 'mock-refresh-token') {
      return { user_id: 'test-user-id' };
    }
    if (token === 'expired-token') {
      throw new Error('jwt expired');
    }
    throw new Error('invalid token');
  }),
}));

// 5. Мок для node-cron
jest.mock('node-cron', () => ({
  schedule: jest.fn((pattern, callback) => {
    return { stop: jest.fn() };
  }),
}));

// 6. Мок для axios
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    data: {
      forecast: {
        forecastday: [{
          day: {
            avgtemp_c: 22.5,
            avghumidity: 55,
            uv: 5,
          },
        }],
      },
    },
  }),
  post: jest.fn().mockResolvedValue({ data: {} }),
}));

// 7. Глобальные утилиты для тестов
global.generateMockUser = () => ({
  user_id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  city: 'Moscow',
  height: 175,
  weight: 70,
  activity_level: 'medium',
  water_avg: 2100,
});

global.generateMockItem = (overrides = {}) => ({
  item_id: 'test-item-id',
  name: 'Test Product',
  production_date: '2024-01-01',
  shelf_life_closed: 365,
  expiration_date: '2024-12-31',
  status: 'valid',
  is_active: true,
  ...overrides,
});

global.generateMockRoutine = (overrides = {}) => ({
  routine_id: 'test-routine-id',
  routine_type: 'morning',
  is_active: true,
  steps: [],
  ...overrides,
});

// 8. Очистка всех моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});

// 9. Таймаут для тестов
jest.setTimeout(10000);