const { ProductGroup } = require('../../database/models');

class ProductGroupService {
  async getAll() {
    return ProductGroup.findAll({
      order: [['group_name', 'ASC']],
    });
  }
}

module.exports = new ProductGroupService();