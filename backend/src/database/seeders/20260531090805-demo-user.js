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
    
    // Создаём даты для последних 30 дней
    const dates = [];
    for (let i = 29; i >= 0; i--) {
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

    // Вспомогательная функция для получения ID
    const getDailyEnvId = async (date) => {
      const [env] = await sequelize.query(
        `SELECT daily_environment_id FROM daily_environment WHERE user_id = :userId AND date = :date LIMIT 1;`,
        { replacements: { userId, date }, type: Sequelize.QueryTypes.SELECT }
      );
      return env?.daily_environment_id;
    };

    const getProductId = async (productName) => {
      const [prod] = await sequelize.query(
        `SELECT product_id FROM product WHERE product_name = :name LIMIT 1;`,
        { replacements: { name: productName }, type: Sequelize.QueryTypes.SELECT }
      );
      return prod?.product_id;
    };

    // ==================== 1. СОЗДАЁМ DAILY_ENVIRONMENT ДЛЯ КАЖДОГО ДНЯ ====================
    console.log('Создание daily_environment для 30 дней...');
    
    for (const date of dates) {
      // Разные погодные условия для разнообразия
      const weatherVariants = [
        { temp: 25.5, humidity: 45, uv: 7, spf: 50 },
        { temp: 22.0, humidity: 55, uv: 5, spf: 30 },
        { temp: 18.5, humidity: 65, uv: 3, spf: 15 },
        { temp: 28.0, humidity: 40, uv: 8, spf: 50 },
        { temp: 20.0, humidity: 60, uv: 4, spf: 30 },
        { temp: 15.0, humidity: 70, uv: 2, spf: 10 },
      ];
      const weather = weatherVariants[Math.floor(Math.random() * weatherVariants.length)];
      
      await sequelize.query(
        `
        INSERT INTO daily_environment (daily_environment_id, user_id, date,
                                       temperature_avg, humidity_avg, uv_index, recommended_spf)
        SELECT gen_random_uuid(), :userId, :date, :temp, :humidity, :uv, :spf
        WHERE NOT EXISTS (
          SELECT 1 FROM daily_environment WHERE user_id = :userId AND date = :date
        );
        `,
        { replacements: { userId, date, temp: weather.temp, humidity: weather.humidity, uv: weather.uv, spf: weather.spf } }
      );
    }

    // ==================== 2. СОЗДАЁМ WATER_LOG ДЛЯ КАЖДОГО ДНЯ ====================
    console.log('Создание water_log для 30 дней...');
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dailyEnvId = await getDailyEnvId(date);
      
      if (!dailyEnvId) continue;
      
      // Создаём вариативные данные по воде
      // target_amount может меняться (норма воды)
      let targetAmount = 2000;
      let achievedAmount = 0;
      
      // Для разнообразия данных
      if (i < 7) {
        // Первая неделя - стабильное потребление
        achievedAmount = 1800 + Math.floor(Math.random() * 400);
      } else if (i < 14) {
        // Вторая неделя - высокое потребление
        achievedAmount = 2100 + Math.floor(Math.random() * 500);
        targetAmount = 2000;
      } else if (i < 21) {
        // Третья неделя - низкое потребление
        achievedAmount = 1200 + Math.floor(Math.random() * 600);
        targetAmount = 2100;
      } else {
        // Четвёртая неделя - нормальное потребление
        achievedAmount = 1800 + Math.floor(Math.random() * 700);
        targetAmount = 2000;
      }
      
      // Несколько дней с превышением нормы
      if (i === 5 || i === 12 || i === 19) {
        achievedAmount = targetAmount + Math.floor(Math.random() * 500);
      }
      
      // Несколько дней с нулевым потреблением
      if (i === 8 || i === 22) {
        achievedAmount = 0;
      }
      
      // Несколько дней с высоким потреблением
      if (i === 3 || i === 15 || i === 27) {
        achievedAmount = targetAmount + 800;
      }
      
      await sequelize.query(
        `
        INSERT INTO water_log (water_log_id, user_id, daily_environment_id, date, target_amount, achieved_amount)
        SELECT gen_random_uuid(), :userId, :dailyEnvId, :date, :target, :achieved
        WHERE NOT EXISTS (
          SELECT 1 FROM water_log WHERE user_id = :userId AND date = :date
        );
        `,
        { replacements: { userId, dailyEnvId, date, target: targetAmount, achieved: achievedAmount } }
      );
    }

    // ==================== 3. РУТИНЫ ====================
    console.log('Создание рутин...');
    
    // Продукты для рутин
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

    // Создаём утреннюю рутину
    const [morningRoutine] = await sequelize.query(
      `
      INSERT INTO routine (routine_id, user_id, routine_type, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), :userId, 'morning', true, NOW(), NOW())
      RETURNING routine_id;
      `,
      { replacements: { userId }, type: Sequelize.QueryTypes.INSERT }
    );
    const morningRoutineId = morningRoutine[0].routine_id;

    for (let i = 0; i < morningProducts.length; i++) {
      const productId = await getProductId(morningProducts[i]);
      if (!productId) throw new Error(`Product not found: ${morningProducts[i]}`);
      await sequelize.query(
        `
        INSERT INTO routine_step (routine_step_id, routine_id, product_id, step_order, frequency_type, frequency_value, created_at, updated_at)
        VALUES (gen_random_uuid(), :routineId, :productId, :stepOrder, 'daily', 0, NOW(), NOW());
        `,
        { replacements: { routineId: morningRoutineId, productId, stepOrder: i + 1 } }
      );
    }

    // Создаём вечернюю рутину
    const [eveningRoutine] = await sequelize.query(
      `
      INSERT INTO routine (routine_id, user_id, routine_type, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), :userId, 'evening', true, NOW(), NOW())
      RETURNING routine_id;
      `,
      { replacements: { userId }, type: Sequelize.QueryTypes.INSERT }
    );
    const eveningRoutineId = eveningRoutine[0].routine_id;

    for (let i = 0; i < eveningProducts.length; i++) {
      const productId = await getProductId(eveningProducts[i]);
      if (!productId) throw new Error(`Product not found: ${eveningProducts[i]}`);
      await sequelize.query(
        `
        INSERT INTO routine_step (routine_step_id, routine_id, product_id, step_order, frequency_type, frequency_value, created_at, updated_at)
        VALUES (gen_random_uuid(), :routineId, :productId, :stepOrder, 'daily', 0, NOW(), NOW());
        `,
        { replacements: { routineId: eveningRoutineId, productId, stepOrder: i + 1 } }
      );
    }

    // ==================== 4. LOGI ВЫПОЛНЕНИЯ РУТИН ====================
    console.log('Создание логов выполнения рутин...');
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const morningTime = `${date} 08:00:00+00`;
      const eveningTime = `${date} 20:00:00+00`;
      
      // Утренняя рутина - выполнена с вероятностью 80%
      const morningCompleted = Math.random() < 0.8;
      if (morningCompleted) {
        const [morningLog] = await sequelize.query(
          `
          INSERT INTO routine_log (routine_log_id, routine_id, user_id, completed_at)
          VALUES (gen_random_uuid(), :routineId, :userId, :completedAt)
          RETURNING routine_log_id;
          `,
          {
            replacements: { routineId: morningRoutineId, userId, completedAt: morningTime },
            type: Sequelize.QueryTypes.INSERT,
          }
        );
        const morningLogId = morningLog[0].routine_log_id;
        
        // Шаги утренней рутины (все выполнены с вероятностью 70%, иначе частично)
        const stepsCompleted = Math.random() < 0.7 ? [true, true, true] : [true, false, Math.random() < 0.5];
        await sequelize.query(
          `
          INSERT INTO routine_step_log (routine_step_log_id, routine_log_id, routine_step_id, completed)
          SELECT gen_random_uuid(), :logId, routine_step_id, 
            CASE WHEN step_order = 1 THEN :completed1
                 WHEN step_order = 2 THEN :completed2
                 ELSE :completed3 END
          FROM routine_step WHERE routine_id = :routineId ORDER BY step_order;
          `,
          { 
            replacements: { 
              logId: morningLogId, 
              routineId: morningRoutineId,
              completed1: stepsCompleted[0],
              completed2: stepsCompleted[1],
              completed3: stepsCompleted[2]
            } 
          }
        );
      }
      
      // Вечерняя рутина - выполнена с вероятностью 75%
      const eveningCompleted = Math.random() < 0.75;
      if (eveningCompleted) {
        const [eveningLog] = await sequelize.query(
          `
          INSERT INTO routine_log (routine_log_id, routine_id, user_id, completed_at)
          VALUES (gen_random_uuid(), :routineId, :userId, :completedAt)
          RETURNING routine_log_id;
          `,
          {
            replacements: { routineId: eveningRoutineId, userId, completedAt: eveningTime },
            type: Sequelize.QueryTypes.INSERT,
          }
        );
        const eveningLogId = eveningLog[0].routine_log_id;
        
        // Шаги вечерней рутины
        const stepsCompleted = Math.random() < 0.65 ? [true, true, true] : [true, false, Math.random() < 0.5];
        await sequelize.query(
          `
          INSERT INTO routine_step_log (routine_step_log_id, routine_log_id, routine_step_id, completed)
          SELECT gen_random_uuid(), :logId, routine_step_id,
            CASE WHEN step_order = 1 THEN :completed1
                 WHEN step_order = 2 THEN :completed2
                 ELSE :completed3 END
          FROM routine_step WHERE routine_id = :routineId ORDER BY step_order;
          `,
          { 
            replacements: { 
              logId: eveningLogId, 
              routineId: eveningRoutineId,
              completed1: stepsCompleted[0],
              completed2: stepsCompleted[1],
              completed3: stepsCompleted[2]
            } 
          }
        );
      }
    }

    // ==================== 5. ОЦЕНКИ КОЖИ И РЕАКЦИИ ====================
    console.log('Создание оценок кожи и реакций...');
    
    // Получаем ID реакций
    const reactions = await sequelize.query(
      `SELECT reaction_id, reaction_name, reaction_group_id FROM reaction;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const reactionGroups = await sequelize.query(
      `SELECT reaction_group_id, reaction_group_name FROM reaction_group;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    // Получаем все логи рутин
    const routineLogs = await sequelize.query(
      `SELECT routine_log_id, completed_at FROM routine_log WHERE user_id = :userId;`,
      { replacements: { userId }, type: Sequelize.QueryTypes.SELECT }
    );
    
    for (const log of routineLogs) {
      const date = log.completed_at.toISOString().slice(0, 10);
      const dayIndex = dates.indexOf(date);
      
      // Разные оценки в зависимости от дня
      let overallScore = 5 + Math.floor(Math.random() * 5); // 5-10
      
      // В середине месяца кожа хуже
      if (dayIndex > 10 && dayIndex < 20) {
        overallScore = 3 + Math.floor(Math.random() * 4); // 3-6
      }
      
      // В конце месяца кожа лучше
      if (dayIndex > 22) {
        overallScore = 7 + Math.floor(Math.random() * 4); // 7-10
      }
      
      // Общая оценка кожи
      await sequelize.query(
        `
        INSERT INTO overall_score (overall_score_id, routine_log_id, score)
        VALUES (gen_random_uuid(), :logId, :score);
        `,
        { replacements: { logId: log.routine_log_id, score: overallScore } }
      );
      
      // Реакции кожи (случайные)
      const numReactions = Math.floor(Math.random() * 4); // 0-3 реакции
      const shuffledReactions = [...reactions];
      for (let i = shuffledReactions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledReactions[i], shuffledReactions[j]] = [shuffledReactions[j], shuffledReactions[i]];
      }
      
      for (let r = 0; r < numReactions; r++) {
        const reaction = shuffledReactions[r];
        const score = 1 + Math.floor(Math.random() * 10); // 1-10
        
        await sequelize.query(
          `
          INSERT INTO skin_reaction (skin_reaction_id, routine_log_id, reaction_id, score)
          VALUES (gen_random_uuid(), :logId, :reactionId, :score);
          `,
          { replacements: { logId: log.routine_log_id, reactionId: reaction.reaction_id, score } }
        );
      }
      
      // Групповые оценки реакций
      for (const group of reactionGroups) {
        // Находим реакции этой группы в текущем логе
        const groupReactions = await sequelize.query(
          `
          SELECT sr.score FROM skin_reaction sr
          JOIN reaction r ON sr.reaction_id = r.reaction_id
          WHERE sr.routine_log_id = :logId AND r.reaction_group_id = :groupId;
          `,
          { replacements: { logId: log.routine_log_id, groupId: group.reaction_group_id }, type: Sequelize.QueryTypes.SELECT }
        );
        
        if (groupReactions.length > 0) {
          const avgScore = groupReactions.reduce((sum, r) => sum + r.score, 0) / groupReactions.length;
          
          await sequelize.query(
            `
            INSERT INTO reaction_group_score (reaction_group_score_id, routine_log_id, reaction_group_id, score)
            VALUES (gen_random_uuid(), :logId, :groupId, :score);
            `,
            { replacements: { logId: log.routine_log_id, groupId: group.reaction_group_id, score: avgScore } }
          );
        }
      }
    }

    // ==================== 6. НАСТРОЙКИ УВЕДОМЛЕНИЙ ====================
    console.log('Настройки уведомлений...');
    
    await sequelize.query(
      `
      INSERT INTO notification_setting (
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
        updated_at = NOW();
      `,
      { replacements: { userId } }
    );
    
    console.log('Seed завершён! Данные созданы для 30 дней.');
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