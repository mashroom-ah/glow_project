'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      -- PRODUCT GROUPS
      INSERT INTO product_group (group_id, group_name)
      SELECT gen_random_uuid(), name
      FROM (VALUES ('cleansing'), ('hydration'), ('peeling'), ('anti_acne'), ('calming')) AS v(name)
      WHERE NOT EXISTS (SELECT 1 FROM product_group WHERE group_name = v.name);

      -- ACTIVE COMPONENTS
      INSERT INTO active_component (component_id, component_name)
      SELECT gen_random_uuid(), name
      FROM (VALUES ('niacinamide'), ('retinol'), ('aha'), ('bha'), ('hyaluronic_acid'),
                   ('centella_asiatica'), ('azelaic_acid'), ('panthenol')) AS v(name)
      WHERE NOT EXISTS (SELECT 1 FROM active_component WHERE component_name = v.name);

      -- GROUP COMPONENTS
      INSERT INTO group_component (group_component_id, group_id, component_id)
      SELECT gen_random_uuid(), pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'cleansing' AND ac.component_name IN ('niacinamide', 'bha')
        AND NOT EXISTS (SELECT 1 FROM group_component gc WHERE gc.group_id = pg.group_id AND gc.component_id = ac.component_id);

      INSERT INTO group_component (group_component_id, group_id, component_id)
      SELECT gen_random_uuid(), pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'hydration' AND ac.component_name IN ('hyaluronic_acid', 'panthenol', 'niacinamide', 'centella_asiatica')
        AND NOT EXISTS (SELECT 1 FROM group_component gc WHERE gc.group_id = pg.group_id AND gc.component_id = ac.component_id);

      INSERT INTO group_component (group_component_id, group_id, component_id)
      SELECT gen_random_uuid(), pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'peeling' AND ac.component_name IN ('aha', 'bha')
        AND NOT EXISTS (SELECT 1 FROM group_component gc WHERE gc.group_id = pg.group_id AND gc.component_id = ac.component_id);

      INSERT INTO group_component (group_component_id, group_id, component_id)
      SELECT gen_random_uuid(), pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'anti_acne' AND ac.component_name IN ('retinol', 'azelaic_acid', 'niacinamide')
        AND NOT EXISTS (SELECT 1 FROM group_component gc WHERE gc.group_id = pg.group_id AND gc.component_id = ac.component_id);

      INSERT INTO group_component (group_component_id, group_id, component_id)
      SELECT gen_random_uuid(), pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'calming' AND ac.component_name IN ('panthenol', 'centella_asiatica')
        AND NOT EXISTS (SELECT 1 FROM group_component gc WHERE gc.group_id = pg.group_id AND gc.component_id = ac.component_id);

      -- PRODUCTS
      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Foam Cleanser', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'cleansing' AND ac.component_name = 'niacinamide'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Foam Cleanser' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Gel Cleanser', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'cleansing' AND ac.component_name = 'bha'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Gel Cleanser' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Moisturizing Cream', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'hydration' AND ac.component_name = 'hyaluronic_acid'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Moisturizing Cream' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Hydrating Toner', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'hydration' AND ac.component_name = 'panthenol'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Hydrating Toner' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Barrier Serum', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'hydration' AND ac.component_name = 'centella_asiatica'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Barrier Serum' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Acid Toner', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'peeling' AND ac.component_name = 'aha'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Acid Toner' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'BHA Pads', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'peeling' AND ac.component_name = 'bha'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'BHA Pads' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Retinol Serum', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'anti_acne' AND ac.component_name = 'retinol'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Retinol Serum' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Azelaic Acid Serum', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'anti_acne' AND ac.component_name = 'azelaic_acid'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Azelaic Acid Serum' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Calming Mask', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'calming' AND ac.component_name = 'centella_asiatica'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Calming Mask' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Recovery Cream', pg.group_id, ac.component_id
      FROM product_group pg, active_component ac
      WHERE pg.group_name = 'calming' AND ac.component_name = 'panthenol'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Recovery Cream' AND p.group_id = pg.group_id AND (p.component_id = ac.component_id OR (p.component_id IS NULL AND ac.component_id IS NULL)));

      -- продукты без активного компонента
      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Basic SPF Cream', pg.group_id, NULL
      FROM product_group pg
      WHERE pg.group_name = 'hydration'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Basic SPF Cream' AND p.group_id = pg.group_id AND p.component_id IS NULL);

      INSERT INTO product (product_id, product_name, group_id, component_id)
      SELECT gen_random_uuid(), 'Basic Cleanser', pg.group_id, NULL
      FROM product_group pg
      WHERE pg.group_name = 'cleansing'
        AND NOT EXISTS (SELECT 1 FROM product p WHERE p.product_name = 'Basic Cleanser' AND p.group_id = pg.group_id AND p.component_id IS NULL);

      -- REACTION GROUPS
      INSERT INTO reaction_group (reaction_group_id, reaction_group_name)
      SELECT gen_random_uuid(), name
      FROM (VALUES ('hydration'), ('irritation'), ('acne'), ('sensitivity'), ('texture')) AS v(name)
      WHERE NOT EXISTS (SELECT 1 FROM reaction_group WHERE reaction_group_name = v.name);

      -- REACTIONS
      INSERT INTO reaction (reaction_id, reaction_group_id, reaction_name)
      SELECT gen_random_uuid(), rg.reaction_group_id, data.reaction_name
      FROM (
        VALUES
          ('hydration', 'dryness'),
          ('hydration', 'dehydration'),
          ('hydration', 'tightness'),
          ('irritation', 'redness'),
          ('irritation', 'burning'),
          ('irritation', 'itching'),
          ('acne', 'breakouts'),
          ('acne', 'clogged_pores'),
          ('acne', 'inflammation'),
          ('sensitivity', 'stinging'),
          ('sensitivity', 'reactivity'),
          ('sensitivity', 'peeling'),
          ('texture', 'rough_texture'),
          ('texture', 'oiliness'),
          ('texture', 'uneven_texture')
      ) AS data(reaction_group_name, reaction_name)
      JOIN reaction_group rg ON rg.reaction_group_name = data.reaction_group_name
      WHERE NOT EXISTS (
        SELECT 1 FROM reaction r WHERE r.reaction_name = data.reaction_name AND r.reaction_group_id = rg.reaction_group_id
      );
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DELETE FROM reaction;
      DELETE FROM reaction_group;
      DELETE FROM product;
      DELETE FROM group_component;
      DELETE FROM active_component;
      DELETE FROM product_group;
    `);
  }
};