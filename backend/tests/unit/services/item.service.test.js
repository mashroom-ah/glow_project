const itemService = require('../../../src/modules/item/item.service');
const { Item } = require('../../../src/database/models');

// Мокаем утилиты ДО импорта сервиса
jest.mock('../../../src/utils/expirationDate', () => ({
  calculateExpirationDate: jest.fn(),
}));

jest.mock('../../../src/utils/itemStatus', () => ({
  calculateItemStatus: jest.fn(),
}));

const { calculateExpirationDate } = require('../../../src/utils/expirationDate');
const { calculateItemStatus } = require('../../../src/utils/itemStatus');

jest.mock('../../../src/database/models', () => ({
  Item: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
}));

describe('ItemService', () => {
  const userId = 'user-123';
  const itemId = 'item-456';

  beforeEach(() => {
    jest.clearAllMocks();
    calculateExpirationDate.mockReturnValue(new Date('2024-12-31'));
    calculateItemStatus.mockReturnValue('valid');
  });

  describe('create', () => {
    const itemData = {
      name: 'Moisturizer',
      production_date: '2024-01-01',
      shelf_life_closed: 365,
    };

    test('создаёт продукт с рассчитанным сроком и статусом', async () => {
      const mockCreatedItem = { item_id: itemId, ...itemData, user_id: userId };
      Item.create.mockResolvedValue(mockCreatedItem);

      const result = await itemService.create(userId, itemData);

      expect(Item.create).toHaveBeenCalled();
      const callArgs = Item.create.mock.calls[0][0];
      
      expect(callArgs.name).toBe(itemData.name);
      expect(callArgs.user_id).toBe(userId);
      expect(callArgs.is_active).toBe(true);
      expect(callArgs.expiration_date).toBeDefined();
      expect(callArgs.status).toBeDefined();
      expect(result).toEqual(mockCreatedItem);
    });
  });

  describe('getAll', () => {
    test('возвращает все продукты пользователя', async () => {
      const mockItems = [{ item_id: itemId, name: 'Product 1' }];
      Item.findAll.mockResolvedValue(mockItems);

      const result = await itemService.getAll(userId);

      expect(Item.findAll).toHaveBeenCalledWith({
        where: { user_id: userId },
        order: [['is_active', 'DESC'], ['expiration_date', 'ASC']],
      });
      expect(result).toEqual(mockItems);
    });
  });

  describe('getById', () => {
    test('возвращает продукт по ID', async () => {
      const mockItem = { item_id: itemId, name: 'Product 1' };
      Item.findOne.mockResolvedValue(mockItem);

      const result = await itemService.getById(userId, itemId);

      expect(Item.findOne).toHaveBeenCalledWith({
        where: { item_id: itemId, user_id: userId },
      });
      expect(result).toEqual(mockItem);
    });

    test('выбрасывает ошибку если продукт не найден', async () => {
      Item.findOne.mockResolvedValue(null);

      await expect(itemService.getById(userId, itemId)).rejects.toThrow('Item not found');
    });
  });

  describe('update', () => {
    test('обновляет продукт', async () => {
      const mockItem = { 
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(itemService, 'getById').mockResolvedValue(mockItem);

      const result = await itemService.update(userId, itemId, { name: 'New Name' });

      expect(calculateExpirationDate).toHaveBeenCalled();
      expect(calculateItemStatus).toHaveBeenCalled();
      expect(mockItem.update).toHaveBeenCalled();
      expect(result).toEqual(mockItem);
    });
  });

  describe('delete', () => {
    test('удаляет продукт', async () => {
      const mockItem = { destroy: jest.fn().mockResolvedValue(true) };
      jest.spyOn(itemService, 'getById').mockResolvedValue(mockItem);

      const result = await itemService.delete(userId, itemId);

      expect(mockItem.destroy).toHaveBeenCalled();
      expect(result.message).toBe('Item deleted successfully');
    });
  });

  describe('archive', () => {
    test('архивирует продукт', async () => {
      const mockItem = { save: jest.fn().mockResolvedValue(true), is_active: true };
      jest.spyOn(itemService, 'getById').mockResolvedValue(mockItem);

      const result = await itemService.archive(userId, itemId);

      expect(mockItem.is_active).toBe(false);
      expect(mockItem.save).toHaveBeenCalled();
      expect(result.message).toBe('Item archived successfully');
    });
  });

  describe('restore', () => {
    test('восстанавливает продукт из архива', async () => {
      const mockItem = { save: jest.fn().mockResolvedValue(true), is_active: false };
      jest.spyOn(itemService, 'getById').mockResolvedValue(mockItem);

      const result = await itemService.restore(userId, itemId);

      expect(mockItem.is_active).toBe(true);
      expect(mockItem.save).toHaveBeenCalled();
      expect(result.message).toBe('Item restored successfully');
    });
  });
});