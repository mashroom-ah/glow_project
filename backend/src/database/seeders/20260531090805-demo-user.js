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

    // 1. Пользователь
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

    // Получаем реальные продукты (без компонента, чтобы избежать дублирования)
    const getBaseProductId = async (productName) => {
      const [prod] = await sequelize.query(
        `SELECT product_id FROM product WHERE product_name = :name AND component_id IS NULL LIMIT 1;`,
        { replacements: { name: productName }, type: Sequelize.QueryTypes.SELECT }
      );
      return prod?.product_id;
    };

    // Реакции
    const reactions = await sequelize.query(
      `SELECT reaction_id FROM reaction;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // 2. Daily environment и water_log на 30 дней
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().slice(0, 10));
    }

    for (const date of dates) {
      await sequelize.query(
        `INSERT INTO daily_environment (daily_environment_id, user_id, date,
                                        temperature_avg, humidity_avg, uv_index, recommended_spf)
         VALUES (gen_random_uuid(), :userId, :date, 22.5, 55, 5, 30)
         ON CONFLICT (user_id, date) DO NOTHING;`,
        { replacements: { userId, date } }
      );

      const achieved = 1500 + Math.floor(Math.random() * 1000);
      await sequelize.query(
        `INSERT INTO water_log (water_log_id, user_id, daily_environment_id, date, target_amount, achieved_amount)
         SELECT gen_random_uuid(), :userId, daily_environment_id, :date, 2000, :achieved
         FROM daily_environment
         WHERE user_id = :userId AND date = :date
         ON CONFLICT (user_id, date) DO NOTHING;`,
        { replacements: { userId, date, achieved } }
      );
    }

    // 3. Рутины (утро / вечер) — используем существующие продукты
    const morningProducts = ['Foam Cleanser', 'Cream', 'Serum'];
    const eveningProducts = ['Gel Cleanser', 'Anti Age Serum', 'Mask'];

    // Очистка старых данных пользователя (чтобы перезапуск сидера не дублировал)
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

    // Утро
    const [morningRoutine] = await sequelize.query(
      `INSERT INTO routine (routine_id, user_id, routine_type, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), :userId, 'morning', true, NOW(), NOW())
       RETURNING routine_id;`,
      { replacements: { userId }, type: Sequelize.QueryTypes.INSERT }
    );
    const morningRoutineId = morningRoutine[0].routine_id;

    for (let i = 0; i < morningProducts.length; i++) {
      const productId = await getBaseProductId(morningProducts[i]);
      if (!productId) throw new Error(`Product not found: ${morningProducts[i]}`);
      await sequelize.query(
        `INSERT INTO routine_step (routine_step_id, routine_id, product_id, step_order, frequency_type, frequency_value, created_at, updated_at)
         VALUES (gen_random_uuid(), :routineId, :productId, :stepOrder, 'daily', 0, NOW(), NOW());`,
        { replacements: { routineId: morningRoutineId, productId, stepOrder: i + 1 } }
      );
    }

    // Вечер
    const [eveningRoutine] = await sequelize.query(
      `INSERT INTO routine (routine_id, user_id, routine_type, is_active, created_at, updated_at)
       VALUES (gen_random_uuid(), :userId, 'evening', true, NOW(), NOW())
       RETURNING routine_id;`,
      { replacements: { userId }, type: Sequelize.QueryTypes.INSERT }
    );
    const eveningRoutineId = eveningRoutine[0].routine_id;

    for (let i = 0; i < eveningProducts.length; i++) {
      const productId = await getBaseProductId(eveningProducts[i]);
      if (!productId) throw new Error(`Product not found: ${eveningProducts[i]}`);
      await sequelize.query(
        `INSERT INTO routine_step (routine_step_id, routine_id, product_id, step_order, frequency_type, frequency_value, created_at, updated_at)
         VALUES (gen_random_uuid(), :routineId, :productId, :stepOrder, 'daily', 0, NOW(), NOW());`,
        { replacements: { routineId: eveningRoutineId, productId, stepOrder: i + 1 } }
      );
    }

    // 4. Логи за 30 дней
    for (let idx = 0; idx < dates.length; idx++) {
      const date = dates[idx];
      const isRecent = idx >= dates.length - 3; // последние 3 дня

      const morningTime = `${date} 08:00:00+00`;
      const eveningTime = `${date} 20:00:00+00`;

      // --- Утро ---
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

      // Шаги: для последних 3 дней все true, иначе случайно (но хотя бы один false)
      const stepsMorning = await sequelize.query(
        `SELECT routine_step_id FROM routine_step WHERE routine_id = :routineId ORDER BY step_order;`,
        { replacements: { routineId: morningRoutineId }, type: Sequelize.QueryTypes.SELECT }
      );

      for (const step of stepsMorning) {
        let completed;
        if (isRecent) {
          completed = true;
        } else {
          // 70% вероятность выполнения, чтобы не все дни были идеальными
          completed = Math.random() < 0.7;
        }
        await sequelize.query(
          `INSERT INTO routine_step_log (routine_step_log_id, routine_log_id, routine_step_id, completed)
           VALUES (gen_random_uuid(), :logId, :stepId, :completed);`,
          { replacements: { logId: morningLogId, stepId: step.routine_step_id, completed } }
        );
      }

      // Общая оценка кожи
      const overallScore = isRecent ? 8 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 7);
      await sequelize.query(
        `INSERT INTO overall_score (overall_score_id, routine_log_id, score)
         VALUES (gen_random_uuid(), :logId, :score);`,
        { replacements: { logId: morningLogId, score: overallScore } }
      );

      // Случайные реакции (0-2)
      const numReactions = Math.floor(Math.random() * 3);
      const shuffled = [...reactions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      const selected = shuffled.slice(0, numReactions);
      for (const reaction of selected) {
        const score = 1 + Math.floor(Math.random() * 10);
        await sequelize.query(
          `INSERT INTO skin_reaction (skin_reaction_id, routine_log_id, reaction_id, score)
           VALUES (gen_random_uuid(), :logId, :reactionId, :score);`,
          { replacements: { logId: morningLogId, reactionId: reaction.reaction_id, score } }
        );
      }

      // --- Вечер (аналогично утру) ---
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

      const stepsEvening = await sequelize.query(
        `SELECT routine_step_id FROM routine_step WHERE routine_id = :routineId ORDER BY step_order;`,
        { replacements: { routineId: eveningRoutineId }, type: Sequelize.QueryTypes.SELECT }
      );

      for (const step of stepsEvening) {
        let completed;
        if (isRecent) {
          completed = true;
        } else {
          completed = Math.random() < 0.7;
        }
        await sequelize.query(
          `INSERT INTO routine_step_log (routine_step_log_id, routine_log_id, routine_step_id, completed)
           VALUES (gen_random_uuid(), :logId, :stepId, :completed);`,
          { replacements: { logId: eveningLogId, stepId: step.routine_step_id, completed } }
        );
      }

      const eveningScore = isRecent ? 8 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 7);
      await sequelize.query(
        `INSERT INTO overall_score (overall_score_id, routine_log_id, score)
         VALUES (gen_random_uuid(), :logId, :score);`,
        { replacements: { logId: eveningLogId, score: eveningScore } }
      );

      const numReactionsEvening = Math.floor(Math.random() * 3);
      const shuffledEvening = [...reactions];
      for (let i = shuffledEvening.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledEvening[i], shuffledEvening[j]] = [shuffledEvening[j], shuffledEvening[i]];
      }
      const selectedEvening = shuffledEvening.slice(0, numReactionsEvening);
      for (const reaction of selectedEvening) {
        const score = 1 + Math.floor(Math.random() * 10);
        await sequelize.query(
          `INSERT INTO skin_reaction (skin_reaction_id, routine_log_id, reaction_id, score)
           VALUES (gen_random_uuid(), :logId, :reactionId, :score);`,
          { replacements: { logId: eveningLogId, reactionId: reaction.reaction_id, score } }
        );
      }
    }

    // 5. Пересчёт reaction_group_score для всех логов
    const logs = await sequelize.query(
      `SELECT routine_log_id FROM routine_log WHERE user_id = :userId;`,
      { replacements: { userId }, type: Sequelize.QueryTypes.SELECT }
    );

    for (const log of logs) {
      await sequelize.query(
        `
        INSERT INTO reaction_group_score (reaction_group_score_id, routine_log_id, reaction_group_id, score)
        SELECT gen_random_uuid(), :logId, r.reaction_group_id, AVG(sr.score)
        FROM skin_reaction sr
        JOIN reaction r ON sr.reaction_id = r.reaction_id
        WHERE sr.routine_log_id = :logId
        GROUP BY r.reaction_group_id
        ON CONFLICT DO NOTHING;
        `,
        { replacements: { logId: log.routine_log_id } }
      );
    }

    // 6. Настройки уведомлений
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
      `DELETE FROM reaction_group_score WHERE routine_log_id IN
       (SELECT routine_log_id FROM routine_log WHERE user_id =
        (SELECT user_id FROM app_user WHERE email = :email));`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM skin_reaction WHERE routine_log_id IN
       (SELECT routine_log_id FROM routine_log WHERE user_id =
        (SELECT user_id FROM app_user WHERE email = :email));`,
      { replacements: { email: demoEmail } }
    );
    await sequelize.query(
      `DELETE FROM overall_score WHERE routine_log_id IN
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