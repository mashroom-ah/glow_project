const {
  Product,
  ProductGroup,
  ActiveComponent,
} = require('../../database/models');

class ProductService {
  async getAll(filters) {
    const where = {};
    const groupWhere = {};

    if (filters.group_id) {
      where.group_id = filters.group_id;
    }

    if (filters.component_id) {
      where.component_id = filters.component_id;
    }

    if (filters.group_name) {
      groupWhere.group_name = filters.group_name;
    }

    const activeComponentInclude = {
      model: ActiveComponent,
      attributes: ['component_name'],
      required: !!filters.component_name,
    };

    if (filters.component_name) {
      activeComponentInclude.where = {
        component_name: filters.component_name,
      };
    }

    const products = await Product.findAll({
      where,
      include: [
        {
          model: ProductGroup,
          attributes: ['group_name'],
          where: groupWhere,
        },
        activeComponentInclude,
      ],
      order: [['product_name', 'ASC']],
    });

    return products.map((product) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      group_id: product.group_id,
      group_name: product.ProductGroup.group_name,
      component_id: product.component_id,
      component_name: product.ActiveComponent?.component_name || null,
    }));
  }

  async getById(productId) {
    const product = await Product.findByPk(productId, {
      include: [
        {
          model: ProductGroup,
          attributes: ['group_id', 'group_name'],
        },
        {
          model: ActiveComponent,
          attributes: ['component_id', 'component_name'],
        },
      ],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      product_id: product.product_id,
      product_name: product.product_name,
      group_id: product.group_id,
      group_name: product.ProductGroup.group_name,
      component_id: product.component_id,
      component_name: product.ActiveComponent?.component_name || null,
    };
  }
}

module.exports = new ProductService();