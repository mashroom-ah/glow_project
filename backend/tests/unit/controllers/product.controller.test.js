const productController = require('../../../src/modules/product/product.controller');
const productService = require('../../../src/modules/product/product.service');

jest.mock('../../../src/modules/product/product.service', () => ({
  getAll: jest.fn(),
  getById: jest.fn(),
}));

describe('ProductController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      query: {},
      params: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    test('возвращает все продукты', async () => {
      const mockProducts = [{ product_id: '1', name: 'Product 1' }];
      productService.getAll.mockResolvedValue(mockProducts);

      await productController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith(mockProducts);
    });

    test('возвращает 500 при ошибке', async () => {
      productService.getAll.mockRejectedValue(new Error('Database error'));

      await productController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('getById', () => {
    test('возвращает продукт по ID', async () => {
      const mockProduct = { product_id: '1', name: 'Product 1' };
      productService.getById.mockResolvedValue(mockProduct);
      req.params.id = '1';

      await productController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith(mockProduct);
    });

    test('возвращает 404 если продукт не найден', async () => {
      productService.getById.mockRejectedValue(new Error('Product not found'));
      req.params.id = '999';

      await productController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});