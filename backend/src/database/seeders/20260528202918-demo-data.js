'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ==================== 1. ГРУППЫ ПРОДУКТОВ ====================
    await queryInterface.sequelize.query(`
      INSERT INTO product_group (group_id, group_name)
      SELECT gen_random_uuid(), name
      FROM (VALUES 
        ('cleansing'), 
        ('hydration'), 
        ('peeling'), 
        ('anti_acne'), 
        ('anti_age'),
        ('calming')
      ) AS v(name)
      WHERE NOT EXISTS (SELECT 1 FROM product_group WHERE group_name = v.name);
    `);

    // ==================== 2. АКТИВНЫЕ КОМПОНЕНТЫ ====================
    await queryInterface.sequelize.query(`
      INSERT INTO active_component (component_id, component_name)
      SELECT gen_random_uuid(), name
      FROM (VALUES 
        -- очищение
        ('niacinamide'), ('aha'), ('bha'), ('pha'), ('azelaic_acid'), ('zinc'), ('vitamin_c'), ('retinol'),
        -- увлажнение
        ('hyaluronic_acid'), ('ceramides'), ('panthenol'), ('snail_mucin'), ('centella_asiatica'), ('squalane'), ('oils'), ('aloe_vera'), ('urea'),
        -- отшелушивание (peeling)
        ('glycolic_acid'), ('lactic_acid'), ('mandelic_acid'), ('salicylic_acid'), ('gluconolactone'), ('lactobionic_acid'), ('scrub_particles'),
        -- борьба с акне
        ('benzoyl_peroxide'), ('sulfur'),
        -- антивозрастной
        ('retinal'), ('peptides'),
        -- успокаивающий
        ('colloidal_oatmeal')
      ) AS v(name)
      WHERE NOT EXISTS (SELECT 1 FROM active_component WHERE component_name = v.name);
    `);

    // ==================== 3. СВЯЗИ ГРУПП С КОМПОНЕНТАМИ ====================
    const groupComponents = {
      cleansing: ['niacinamide', 'aha', 'bha', 'pha', 'azelaic_acid', 'zinc', 'vitamin_c', 'retinol'],
      hydration: ['hyaluronic_acid', 'ceramides', 'niacinamide', 'panthenol', 'snail_mucin', 'centella_asiatica', 'squalane', 'oils', 'aloe_vera', 'urea'],
      peeling: ['glycolic_acid', 'lactic_acid', 'mandelic_acid', 'salicylic_acid', 'gluconolactone', 'lactobionic_acid', 'scrub_particles'],
      anti_acne: ['niacinamide', 'azelaic_acid', 'benzoyl_peroxide', 'sulfur', 'salicylic_acid'],
      anti_age: ['retinol', 'retinal', 'peptides', 'vitamin_c', 'hyaluronic_acid'],
      calming: ['aloe_vera', 'centella_asiatica', 'colloidal_oatmeal', 'panthenol']
    };

    for (const [groupName, components] of Object.entries(groupComponents)) {
      for (const compName of components) {
        await queryInterface.sequelize.query(`
          INSERT INTO group_component (group_component_id, group_id, component_id)
          SELECT gen_random_uuid(), pg.group_id, ac.component_id
          FROM product_group pg, active_component ac
          WHERE pg.group_name = '${groupName}' AND ac.component_name = '${compName}'
          AND NOT EXISTS (
            SELECT 1 FROM group_component gc
            WHERE gc.group_id = pg.group_id AND gc.component_id = ac.component_id
          );
        `);
      }
    }

    // ==================== 4. ПРОДУКТЫ ====================
    const baseProducts = {
      cleansing: [
        'Foam Cleanser', 'Gel Cleanser', 'Cream Gel Cleanser', 'Hydrophilic Oil', 'Micellar Water'
      ],
      hydration: [
        'Cream', 'Serum', 'Essence', 'Toner', 'Mask'
      ],
      peeling: [
        'Peeling Solution', 'Pads', 'Scrub', 'Enzyme Powder', 'Acid Toner'
      ],
      anti_acne: [
        'Serum', 'Spot Treatment', 'Toner', 'Cream', 'Pads'
      ],
      anti_age: [
        'Night Cream', 'Anti Age Serum', 'Eye Cream', 'Masks'
      ],
      calming: [
        'Cream', 'Mask', 'Serum', 'Toner'
      ]
    };

    // 4.1 Сначала создаём продукты без компонента (базовые)
    for (const [groupName, products] of Object.entries(baseProducts)) {
      for (const productName of products) {
        await queryInterface.sequelize.query(`
          INSERT INTO product (product_id, product_name, group_id, component_id)
          SELECT gen_random_uuid(), :name, pg.group_id, NULL
          FROM product_group pg
          WHERE pg.group_name = :groupName
          AND NOT EXISTS (
            SELECT 1 FROM product p 
            WHERE p.product_name = :name 
              AND p.group_id = pg.group_id 
              AND p.component_id IS NULL
          );
        `, { replacements: { name: productName, groupName } });
      }
    }

    // 4.2 Создаём продукты со всеми компонентами для каждой группы
    for (const [groupName, products] of Object.entries(baseProducts)) {
      const components = groupComponents[groupName];
      if (!components) continue;
      for (const productName of products) {
        for (const compName of components) {
          await queryInterface.sequelize.query(`
            INSERT INTO product (product_id, product_name, group_id, component_id)
            SELECT gen_random_uuid(), :fullName, pg.group_id, ac.component_id
            FROM product_group pg, active_component ac
            WHERE pg.group_name = :groupName 
              AND ac.component_name = :compName
              AND NOT EXISTS (
                SELECT 1 FROM product p
                WHERE p.product_name = :fullName
                  AND p.group_id = pg.group_id
                  AND p.component_id = ac.component_id
              );
          `, {
            replacements: {
              fullName: `${productName} (${compName})`,
              groupName,
              compName
            }
          });
        }
      }
    }

    // ==================== 5. РЕАКЦИИ ====================
    await queryInterface.sequelize.query(`
      INSERT INTO reaction_group (reaction_group_id, reaction_group_name)
      SELECT gen_random_uuid(), name
      FROM (VALUES ('hydration'), ('irritation'), ('acne'), ('sensitivity'), ('texture')) AS v(name)
      WHERE NOT EXISTS (SELECT 1 FROM reaction_group WHERE reaction_group_name = v.name);

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
      DELETE FROM product;
      DELETE FROM group_component;
      DELETE FROM active_component;
      DELETE FROM product_group;
      DELETE FROM reaction;
      DELETE FROM reaction_group;
    `);
  },
};