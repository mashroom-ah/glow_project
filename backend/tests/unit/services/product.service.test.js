const productService = require('../../../src/modules/product/product.service');
const { Product, ProductGroup, ActiveComponent } = require('../../../src/database/models');
const { mockProducts } = require('../../helpers/mockData');

jest.mock('../../../src/database/models', () => ({
  Product: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  ProductGroup: {},
  ActiveComponent: {},
}));

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('возвращает все продукты с фильтрацией', async () => {
      const mockProductsList = [
        {
          product_id: 'p1',
          product_name: 'Product 1',
          group_id: 'g1',
          component_id: null,
          ProductGroup: { group_name: 'cleansing' },
          ActiveComponent: null,
        },
      ];
      Product.findAll.mockResolvedValue(mockProductsList);

      const result = await productService.getAll({});

      expect(Product.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('group_name', 'cleansing');
    });

    test('фильтрует по group_id', async () => {
      Product.findAll.mockResolvedValue([]);

      await productService.getAll({ group_id: 'g1' });

      expect(Product.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { group_id: 'g1' },
        })
      );
    });

    test('фильтрует по component_name', async () => {
      Product.findAll.mockResolvedValue([]);

      await productService.getAll({ component_name: 'retinol' });

      expect(Product.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.arrayContaining([
            expect.objectContaining({
              where: { component_name: 'retinol' },
              required: true,
            }),
          ]),
        })
      );
    });
  });

  describe('getById', () => {
    test('возвращает продукт по ID', async () => {
      const mockProduct = {
        product_id: 'p1',
        product_name: 'Product 1',
        ProductGroup: { group_name: 'cleansing' },
        ActiveComponent: null,
      };
      Product.findByPk.mockResolvedValue(mockProduct);

      const result = await productService.getById('p1');

      expect(Product.findByPk).toHaveBeenCalledWith('p1', {
        include: expect.any(Array),
      });
      expect(result).toHaveProperty('product_id', 'p1');
    });

    test('выбрасывает ошибку если продукт не найден', async () => {
      Product.findByPk.mockResolvedValue(null);

      await expect(productService.getById('not-found')).rejects.toThrow('Product not found');
    });
  });
});