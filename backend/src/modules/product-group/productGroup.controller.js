const productGroupService = require('./productGroup.service');

class ProductGroupController {
  async getAll(req, res) {
    try {
      const result =
        await productGroupService.getAll();

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}

module.exports =
  new ProductGroupController();