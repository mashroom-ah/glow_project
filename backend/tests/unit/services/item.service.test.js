const itemService = require('../../../src/modules/item/item.service');
const { Item } = require('../../../src/database/models');

jest.mock('../../../src/database/models', () => ({
  Item: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../../src/utils/expirationDate', () => ({
  calculateExpirationDate: jest.fn().mockReturnValue(new Date('2024-12-31')),
}));

jest.mock('../../../src/utils/itemStatus', () => ({
  calculateItemStatus: jest.fn().mockReturnValue('valid'),
}));

describe('ItemService', () => {
  const userId = 'user-123';
  const itemId = 'item-456';

  beforeEach(() => {
    jest.clearAllMocks();
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

      // Проверяем, что create был вызван
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
});