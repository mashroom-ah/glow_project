'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;

    const demoEmail = 'demo@example.com';
    const demoPassword = 'Demo123!';
    const passwordHash = await bcrypt.hash(demoPassword, 10);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Генерируем даты на последние 7 дней (для серии)
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().slice(0, 10));
    }

    // 1. Создаём пользователя, если его нет
    const [existingUser] = await sequelize.query(
      `SELECT user_id FROM app_user WHERE email = :email LIMIT 1;`,
      { replacements: { email: demoEmail }, type: Sequelize.QueryTypes.SELECT }
    );

    let userId;
    if (!existingUser) {
      const insertUserQuery = `
        INSERT INTO app_user (
          user_id, email, password_hash, name, city,
          height, weight, birth_date, activity_level,
          water_avg, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), :email, :passwordHash, :name, :city,
          :height, :weight, :birthDate, :activityLevel,
          :waterAvg, NOW(), NOW()
        )
        RETURNING user_id;
      `;
      const [user] = await sequelize.query(insertUserQuery, {
        replacements: {
          email: demoEmail,
          passwordHash,
          name: 'Demo User',
          city: 'Moscow',
          height: 170,
          weight: 65,
          birthDate: '1990-01-01',
          activityLevel: 'medium',
          waterAvg: 2000,
        },
        type: Sequelize.QueryTypes.INSERT,
      });
      userId = user[0].user_id;
    } else {
      userId = existingUser.user_id;
    }

    // Вспомогательные функции
    const getProductId = async (productName) => {
      const [prod] = await sequelize.query(
        `SELECT product_id FROM product WHERE product_name = :name LIMIT 1;`,
        { replacements: { name: productName }, type: Sequelize.QueryTypes.SELECT }
      );
      return prod?.product_id;
    };

    // 2. Создаём daily_environment и water_log на каждый из 7 дней
    for (const date of dates) {
      // DailyEnvironment
      await sequelize.query(
        `
        INSERT INTO daily_environment (daily_environment_id, user_id, date,
                                       temperature_avg, humidity_avg, uv_index, recommended_spf)
        SELECT gen_random_uuid(), :userId, :date, 22.5, 55, 5, 30
        WHERE NOT EXISTS (
          SELECT 1 FROM daily_environment WHERE user_id = :userId AND date = :date
        );
        `,
        { replacements: { userId, date } }
      );

      // WaterLog (целевая норма 2000, выпито случайно от 1500 до 2500)
      const achieved = 1500 + Math.floor(Math.random() * 1000);
      await sequelize.query(
        `
        INSERT INTO water_log (water_log_id, user_id, daily_environment_id, date, target_amount, achieved_amount)
        SELECT gen_random_uuid(), :userId, daily_environment_id, :date, 2000, :achieved
        FROM daily_environment
        WHERE user_id = :userId AND date = :date
        ON CONFLICT DO NOTHING;
        `,
        { replacements: { userId, date, achieved } }
      );
    }

    // 3. Создаём рутины (утро и вечер)
    const morningProducts = ['Foam Cleanser', 'Moisturizing Cream', 'Basic SPF Cream'];
    const eveningProducts = ['Gel Cleanser', 'Retinol Serum', 'Calming Mask'];

    // Удаляем старые данные
    await sequelize.query(
      `DELETE FROM routine_step_log WHERE routine_log_id IN
       (SELECT routine_log_id FROM routine_log WHERE user_id = :userId);`,
      { replacements: { userId } }
    );
    await sequelize.query(`DELETE FROM routine_log WHERE user_id = :userId;`, { replacements: { userId } });
    await sequelize.query(
      `DELETE FROM routine_step WHERE routine_id IN
       (SELECT routine_id FROM routine WHERE user_id = :userId);`,
      { replacements: { userId } }
    );
    await sequelize.query(`DELETE FROM routine WHERE user_id = :userId;`, { replacements: { userId } });

    // Утренняя рутина
    const [morningRoutine] = await sequelize.query(
      `INSERT INTO routine (routine_id, user_id, routine_type, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), :userId, 'morning', true, NOW(), NOW())
       RETURNING routine_id;`,
      { replacements: { userId }, type: Sequelize.QueryTypes.INSERT }
    );
    const morningRoutineId = morningRoutine[0].routine_id;

    for (let i = 0; i < morningProducts.length; i++) {
      const productId = await getProductId(morningProducts[i]);
      if (!productId) throw new Error(`Product not found: ${morningProducts[i]}`);
      await sequelize.query(
        `INSERT INTO routine_step (routine_step_id, routine_id, product_id, step_order, frequency_type, frequency_value, created_at, updated_at)
         VALUES (gen_random_uuid(), :routineId, :productId, :stepOrder, 'daily', 0, NOW(), NOW());`,
        { replacements: { routineId: morningRoutineId, productId, stepOrder: i + 1 } }
      );
    }

    // Вечерняя рутина
    const [eveningRoutine] = await sequelize.query(
      `INSERT INTO routine (routine_id, user_id, routine_type, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), :userId, 'evening', true, NOW(), NOW())
       RETURNING routine_id;`,
      { replacements: { userId }, type: Sequelize.QueryTypes.INSERT }
    );
    const eveningRoutineId = eveningRoutine[0].routine_id;

    for (let i = 0; i < eveningProducts.length; i++) {
      const productId = await getProductId(eveningProducts[i]);
      if (!productId) throw new Error(`Product not found: ${eveningProducts[i]}`);
      await sequelize.query(
        `INSERT INTO routine_step (routine_step_id, routine_id, product_id, step_order, frequency_type, frequency_value, created_at, updated_at)
         VALUES (gen_random_uuid(), :routineId, :productId, :stepOrder, 'daily', 0, NOW(), NOW());`,
        { replacements: { routineId: eveningRoutineId, productId, stepOrder: i + 1 } }
      );
    }

    // 4. Создаём логи выполнения рутин за каждый из 7 дней (все выполнены на 100%)
    for (const date of dates) {
      const morningTime = `${date} 08:00:00+00`;
      const eveningTime = `${date} 20:00:00+00`;

      // Утро
      const [morningLog] = await sequelize.query(
        `INSERT INTO routine_log (routine_log_id, routine_id, user_id, completed_at)
         VALUES (gen_random_uuid(), :routineId, :userId, :completedAt)
         RETURNING routine_log_id;`,
        {
          replacements: { routineId: morningRoutineId, userId, completedAt: morningTime },
          type: Sequelize.QueryTypes.INSERT,
        }
      );
      const morningLogId = morningLog[0].routine_log_id;
      await sequelize.query(
        `INSERT INTO routine_step_log (routine_step_log_id, routine_log_id, routine_step_id, completed)
         SELECT gen_random_uuid(), :logId, routine_step_id, true
         FROM routine_step WHERE routine_id = :routineId ORDER BY step_order;`,
        { replacements: { logId: morningLogId, routineId: morningRoutineId } }
      );

      // Вечер
      const [eveningLog] = await sequelize.query(
        `INSERT INTO routine_log (routine_log_id, routine_id, user_id, completed_at)
         VALUES (gen_random_uuid(), :routineId, :userId, :completedAt)
         RETURNING routine_log_id;`,
        {
          replacements: { routineId: eveningRoutineId, userId, completedAt: eveningTime },
          type: Sequelize.QueryTypes.INSERT,
        }
      );
      const eveningLogId = eveningLog[0].routine_log_id;
      await sequelize.query(
        `INSERT INTO routine_step_log (routine_step_log_id, routine_log_id, routine_step_id, completed)
         SELECT gen_random_uuid(), :logId, routine_step_id, true
         FROM routine_step WHERE routine_id = :routineId ORDER BY step_order;`,
        { replacements: { logId: eveningLogId, routineId: eveningRoutineId } }
      );
    }

    // 5. Настройки уведомлений
    await sequelize.query(
      `INSERT INTO notification_setting (
        notification_setting_id, user_id, push_enabled,
        morning_enabled, morning_time, evening_enabled, evening_time,
        timezone, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), :userId, true,
        true, '08:00:00', true, '20:00:00',
        'Europe/Moscow', NOW(), NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        push_enabled = EXCLUDED.push_enabled,
        morning_enabled = EXCLUDED.morning_enabled,
        morning_time = EXCLUDED.morning_time,
        evening_enabled = EXCLUDED.evening_enabled,
        evening_time = EXCLUDED.evening_time,
        timezone = EXCLUDED.timezone,
        updated_at = NOW();`,
      { replacements: { userId } }
    );
  },

  async down(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;
    const demoEmail = 'demo@example.com';

    await sequelize.query(
      `DELETE FROM routine_step_log WHERE routine_log_id IN
       (SELECT routine_log_id FROM routine_log WHERE user_id =
        (SELECT user_id FROM app_user WHERE email = :email));`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM routine_log WHERE user_id =
       (SELECT user_id FROM app_user WHERE email = :email);`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM routine_step WHERE routine_id IN
       (SELECT routine_id FROM routine WHERE user_id =
        (SELECT user_id FROM app_user WHERE email = :email));`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM routine WHERE user_id =
       (SELECT user_id FROM app_user WHERE email = :email);`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM daily_environment WHERE user_id =
       (SELECT user_id FROM app_user WHERE email = :email);`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM water_log WHERE user_id =
       (SELECT user_id FROM app_user WHERE email = :email);`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM notification_setting WHERE user_id =
       (SELECT user_id FROM app_user WHERE email = :email);`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(`DELETE FROM app_user WHERE email = :email;`, {
      replacements: { email: demoEmail },
    });
  },
};