'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      -- =========================================
      -- PRODUCT GROUPS
      -- =========================================
      INSERT INTO product_group (
        group_id,
        group_name
      )
      VALUES
      (
        gen_random_uuid(),
        'cleansing'
      ),
      (
        gen_random_uuid(),
        'hydration'
      ),
      (
        gen_random_uuid(),
        'peeling'
      ),
      (
        gen_random_uuid(),
        'anti_acne'
      ),
      (
        gen_random_uuid(),
        'calming'
      );

      -- =========================================
      -- ACTIVE COMPONENTS
      -- =========================================
      INSERT INTO active_component (
        component_id,
        component_name
      )
      VALUES
      (
        gen_random_uuid(),
        'niacinamide'
      ),
      (
        gen_random_uuid(),
        'retinol'
      ),
      (
        gen_random_uuid(),
        'aha'
      ),
      (
        gen_random_uuid(),
        'bha'
      ),
      (
        gen_random_uuid(),
        'hyaluronic_acid'
      ),
      (
        gen_random_uuid(),
        'centella_asiatica'
      ),
      (
        gen_random_uuid(),
        'azelaic_acid'
      ),
      (
        gen_random_uuid(),
        'panthenol'
      );

      -- =========================================
      -- GROUP COMPONENTS
      -- =========================================
      -- cleansing
      INSERT INTO group_component (
        group_component_id,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'cleansing'
      AND ac.component_name IN (
        'niacinamide',
        'bha'
      );

      -- hydration
      INSERT INTO group_component (
        group_component_id,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'hydration'
      AND ac.component_name IN (
        'hyaluronic_acid',
        'panthenol',
        'niacinamide',
        'centella_asiatica'
      );

      -- peeling
      INSERT INTO group_component (
        group_component_id,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'peeling'
      AND ac.component_name IN (
        'aha',
        'bha'
      );

      -- anti acne
      INSERT INTO group_component (
        group_component_id,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'anti_acne'
      AND ac.component_name IN (
        'retinol',
        'azelaic_acid',
        'niacinamide'
      );

      -- calming
      INSERT INTO group_component (
        group_component_id,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'calming'
      AND ac.component_name IN (
        'panthenol',
        'centella_asiatica'
      );

      -- =========================================
      -- PRODUCTS
      -- =========================================
      -- cleansing
      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Foam Cleanser',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'cleansing'
      AND ac.component_name = 'niacinamide';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Gel Cleanser',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'cleansing'
      AND ac.component_name = 'bha';

      -- hydration
      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Moisturizing Cream',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'hydration'
      AND ac.component_name = 'hyaluronic_acid';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Hydrating Toner',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'hydration'
      AND ac.component_name = 'panthenol';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Barrier Serum',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'hydration'
      AND ac.component_name = 'centella_asiatica';

      -- peeling
      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Acid Toner',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'peeling'
      AND ac.component_name = 'aha';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'BHA Pads',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'peeling'
      AND ac.component_name = 'bha';

      -- anti acne
      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Retinol Serum',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'anti_acne'
      AND ac.component_name = 'retinol';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Azelaic Acid Serum',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'anti_acne'
      AND ac.component_name = 'azelaic_acid';

      -- calming
      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Calming Mask',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'calming'
      AND ac.component_name = 'centella_asiatica';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Recovery Cream',
        pg.group_id,
        ac.component_id
      FROM product_group pg,
           active_component ac
      WHERE pg.group_name = 'calming'
      AND ac.component_name = 'panthenol';

      -- products without active component
      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Basic SPF Cream',
        pg.group_id,
        NULL
      FROM product_group pg
      WHERE pg.group_name = 'hydration';

      INSERT INTO product (
        product_id,
        product_name,
        group_id,
        component_id
      )
      SELECT
        gen_random_uuid(),
        'Basic Cleanser',
        pg.group_id,
        NULL
      FROM product_group pg
      WHERE pg.group_name = 'cleansing';

      -- =========================================
      -- REACTION GROUPS
      -- =========================================
      INSERT INTO reaction_group (
          reaction_group_id,
          reaction_group_name
      )
      VALUES
      (
          gen_random_uuid(),
          'hydration'
      ),
      (
          gen_random_uuid(),
          'irritation'
      ),
      (
          gen_random_uuid(),
          'acne'
      ),
      (
          gen_random_uuid(),
          'sensitivity'
      ),
      (
          gen_random_uuid(),
          'texture'
      );

      -- =========================================
      -- REACTIONS
      -- =========================================
      INSERT INTO reaction (
          reaction_id,
          reaction_group_id,
          reaction_name
      )
      SELECT
          gen_random_uuid(),
          rg.reaction_group_id,
          data.reaction_name
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
      JOIN reaction_group rg
      ON rg.reaction_group_name = data.reaction_group_name;
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