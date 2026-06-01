const waterDailyService = require('../../../src/services/waterDaily.service');
const { DailyEnvironment, WaterLog } = require('../../../src/database/models');
const weatherService = require('../../../src/services/weather.service');
const { mockUsers } = require('../../helpers/mockData');

jest.mock('../../../src/database/models', () => ({
  DailyEnvironment: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  WaterLog: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../../src/services/weather.service', () => ({
  getDailyEnvironment: jest.fn(),
  calculateTargetWater: jest.fn(),
}));

describe('WaterDailyService', () => {
  const userId = mockUsers.regular.user_id;
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTodayData', () => {
    const mockWeather = {
      temperature_avg: 22.5,
      humidity_avg: 55,
      uv_index: 5,
      recommended_spf: 30,
      hydration_multiplier: 1.1,
    };

    test('создаёт данные для сегодняшнего дня, если их нет', async () => {
      WaterLog.findOne.mockResolvedValue(null);
      weatherService.getDailyEnvironment.mockResolvedValue(mockWeather);
      weatherService.calculateTargetWater.mockReturnValue(2310);
      DailyEnvironment.create.mockResolvedValue({
        daily_environment_id: 'env-123',
      });
      WaterLog.create.mockResolvedValue({
        water_log_id: 'test-water-log-1',
      });

      const result = await waterDailyService.createTodayData(mockUsers.regular);

      expect(WaterLog.findOne).toHaveBeenCalled();
      expect(weatherService.getDailyEnvironment).toHaveBeenCalled();
      expect(DailyEnvironment.create).toHaveBeenCalled();
      expect(WaterLog.create).toHaveBeenCalled();
      expect(result).toHaveProperty('water_log_id');
    });

    test('возвращает существующий лог, если он уже есть', async () => {
      const existingLog = { water_log_id: 'existing-log' };
      WaterLog.findOne.mockResolvedValue(existingLog);

      const result = await waterDailyService.createTodayData(mockUsers.regular);

      expect(WaterLog.findOne).toHaveBeenCalled();
      expect(DailyEnvironment.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingLog);
    });
  });

  describe('refreshTodayData', () => {
    const mockWeather = {
      temperature_avg: 25.0,
      humidity_avg: 60,
      uv_index: 6,
      recommended_spf: 30,
      hydration_multiplier: 1.15,
    };

    test('обновляет существующие данные', async () => {
      const mockEnvironment = {
        update: jest.fn().mockResolvedValue(true),
      };
      const mockWater = {
        target_amount: 2000,
        save: jest.fn().mockResolvedValue(true),
      };

      DailyEnvironment.findOne.mockResolvedValue(mockEnvironment);
      WaterLog.findOne.mockResolvedValue(mockWater);
      weatherService.getDailyEnvironment.mockResolvedValue(mockWeather);
      weatherService.calculateTargetWater.mockReturnValue(2300);

      await waterDailyService.refreshTodayData(mockUsers.regular);

      expect(mockEnvironment.update).toHaveBeenCalled();
      expect(mockWater.target_amount).toBe(2300);
      expect(mockWater.save).toHaveBeenCalled();
    });

    test('не падает если environment не найден', async () => {
      DailyEnvironment.findOne.mockResolvedValue(null);
      WaterLog.findOne.mockResolvedValue(null);
      weatherService.getDailyEnvironment.mockResolvedValue(mockWeather);

      await expect(waterDailyService.refreshTodayData(mockUsers.regular)).resolves.not.toThrow();
    });
  });
});