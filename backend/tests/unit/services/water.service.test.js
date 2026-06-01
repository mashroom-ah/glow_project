const waterService = require('../../../src/modules/water/water.service');
const { WaterLog } = require('../../../src/database/models');

jest.mock('../../../src/database/models', () => ({
  WaterLog: {
    findOne: jest.fn(),
  },
}));

describe('WaterService', () => {
  const userId = 'user-123';
  const today = new Date().toISOString().split('T')[0];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getToday', () => {
    test('возвращает водный лог за сегодня', async () => {
      const mockWaterLog = {
        date: today,
        achieved_amount: 500,
        target_amount: 2000,
      };
      WaterLog.findOne.mockResolvedValue(mockWaterLog);

      const result = await waterService.getToday(userId);

      expect(WaterLog.findOne).toHaveBeenCalledWith({
        where: { user_id: userId, date: today },
      });
      expect(result).toEqual({
        date: today,
        achieved_amount: 500,
        target_amount: 2000,
      });
    });

    test('ошибка если лог не найден', async () => {
      WaterLog.findOne.mockResolvedValue(null);

      await expect(waterService.getToday(userId)).rejects.toThrow(
        'Water log not found'
      );
    });
  });

  describe('addWater', () => {
    test('добавляет воду к достигнутому количеству', async () => {
      const mockWaterLog = {
        achieved_amount: 500,
        save: jest.fn().mockResolvedValue(true),
      };
      WaterLog.findOne.mockResolvedValue(mockWaterLog);

      const result = await waterService.addWater(userId, 300);

      expect(mockWaterLog.achieved_amount).toBe(800);
      expect(mockWaterLog.save).toHaveBeenCalled();
      expect(result.achieved_amount).toBe(800);
    });
  });

  describe('removeWater', () => {
    test('удаляет воду, не опускаясь ниже нуля', async () => {
      const mockWaterLog = {
        achieved_amount: 500,
        save: jest.fn().mockResolvedValue(true),
      };
      WaterLog.findOne.mockResolvedValue(mockWaterLog);

      const result = await waterService.removeWater(userId, 700);

      expect(mockWaterLog.achieved_amount).toBe(0);
      expect(result.achieved_amount).toBe(0);
    });
  });
});