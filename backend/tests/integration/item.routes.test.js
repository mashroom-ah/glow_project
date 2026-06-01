const request = require('supertest');
const express = require('express');

jest.mock('../../src/database/models', () => ({
  Item: {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../src/middlewares/auth.middleware', () => {
  return (req, res, next) => {
    req.user = { user_id: 'test-user-id' };
    next();
  };
});

jest.mock('../../src/utils/expirationDate', () => ({
  calculateExpirationDate: jest.fn().mockReturnValue(new Date('2024-12-31')),
}));

jest.mock('../../src/utils/itemStatus', () => ({
  calculateItemStatus: jest.fn().mockReturnValue('valid'),
}));

const { Item } = require('../../src/database/models');

const app = express();
app.use(express.json());
app.use('/items', require('../../src/modules/item/item.routes'));

describe('Item Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /items', () => {
    const newItem = {
      name: 'Test Product',
      production_date: '2024-01-01',
      shelf_life_closed: 365,
    };

    test('создаёт новый продукт', async () => {
      const mockCreated = { item_id: 'item-123', ...newItem };
      Item.create.mockResolvedValue(mockCreated);

      const response = await request(app).post('/items').send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('item_id');
    });
  });

  describe('GET /items', () => {
    test('возвращает все продукты пользователя', async () => {
      const mockItems = [{ item_id: '1', name: 'Product 1' }];
      Item.findAll.mockResolvedValue(mockItems);

      const response = await request(app).get('/items');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('DELETE /items/:id', () => {
    test('удаляет продукт', async () => {
      const mockItem = { destroy: jest.fn() };
      Item.findOne.mockResolvedValue(mockItem);

      const response = await request(app).delete('/items/item-123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Item deleted successfully');
    });
  });
});