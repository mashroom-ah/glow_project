const {
  Product,
  ProductGroup,
  ActiveComponent,
} = require('../../database/models');

class ProductService {
  async getAll(filters) {
    const where = {};

    if (filters.group_id) {
      where.group_id = filters.group_id;
    }

    if (filters.component_id) {
      where.component_id =
        filters.component_id;
    }

    return Product.findAll({
      where,

      include: [
        {
          model: ProductGroup,
          attributes: [
            'group_id',
            'group_name',
          ],
        },

        {
          model: ActiveComponent,
          attributes: [
            'component_id',
            'component_name',
          ],
        },
      ],

      order: [['product_name', 'ASC']],
    });
  }

  async getById(productId) {
    const product = await Product.findByPk(
      productId,
      {
        include: [
          {
            model: ProductGroup,
            attributes: [
              'group_id',
              'group_name',
            ],
          },

          {
            model: ActiveComponent,
            attributes: [
              'component_id',
              'component_name',
            ],
          },
        ],
      }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }
}

module.exports = new ProductService();