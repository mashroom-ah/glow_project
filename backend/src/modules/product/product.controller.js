const productService =
  require('./product.service');

class ProductController {
  async getAll(req, res) {
    try {
      const result =
        await productService.getAll(
          req.query
        );

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const result =
        await productService.getById(
          req.params.id
        );

      return res.json(result);
    } catch (error) {
      return res.status(404).json({
        message: error.message,
      });
    }
  }
}

module.exports =
  new ProductController();