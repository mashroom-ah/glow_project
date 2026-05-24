const cron = require('node-cron');

const weatherService = require(
  '../services/weather.service'
);

const {
  AppUser,
  DailyEnvironment,
  WaterLog,
} = require('../database/models');

cron.schedule(
  '0 1 * * *',
  async () => {
    console.log(
      'Running water cron job...'
    );

    try {
      const users =
        await AppUser.findAll();

      const today = new Date()
        .toLocaleDateString('en-CA');

      for (const user of users) {
        const existing =
          await WaterLog.findOne({
            where: {
              user_id: user.user_id,
              date: today,
            },
          });

        if (existing) {
          continue;
        }

        const location =
          user.city || 'Moscow';

        const environment =
          await weatherService.getDailyEnvironment(
            location,
            today
          );

        const dailyEnvironment =
          await DailyEnvironment.create({
            user_id: user.user_id,

            date: today,

            temperature_avg:
              environment.temperature_avg,

            humidity_avg:
              environment.humidity_avg,

            uv_index:
              environment.uv_index,

            recommended_spf:
              environment.recommended_spf,
          });

        const targetAmount =
          weatherService.calculateTargetAmount(
            user.water_avg,
            environment
          );

        await WaterLog.create({
          user_id: user.user_id,

          daily_environment_id:
            dailyEnvironment.daily_environment_id,

          date: today,

          target_amount:
            targetAmount,

          achieved_amount: 0,
        });
      }

      console.log(
        'Water cron completed successfully'
      );
    } catch (error) {
      console.error(
        'Water cron error:',
        error
      );
    }
  }
);