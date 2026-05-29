const cron = require('node-cron');

const {
  AppUser,
} = require('../database/models');

const waterDailyService = require(
  '../services/waterDaily.service'
);

cron.schedule('0 1 * * *', async () => {
  console.log(
    'Running water cron job...'
  );

  try {
    const users =
      await AppUser.findAll();

    for (const user of users) {
      await waterDailyService.createTodayData(
        user
      );
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
});