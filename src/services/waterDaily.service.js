const {
    DailyEnvironment,
    WaterLog,
} = require('../database/models');

const weatherService = require(
    './weather.service'
);

class WaterDailyService {
    async createTodayData(user) {
        const today = new Date()
            .toISOString()
            .split('T')[0];

        // если уже существует — ничего не делаем

        const existing =
            await WaterLog.findOne({
                where: {
                    user_id: user.user_id,
                    date: today,
                },
            });

        if (existing) {
            return existing;
        }

        const weather =
            await weatherService.getDailyEnvironment(
                user.city,
                today
            );

        const dailyEnvironment =
            await DailyEnvironment.create({
                user_id: user.user_id,

                date: today,

                temperature_avg:
                    weather.temperature_avg,

                humidity_avg:
                    weather.humidity_avg,

                uv_index: weather.uv_index,

                recommended_spf:
                    weather.recommended_spf,
            });

        const targetAmount =
            weatherService.calculateTargetWater(
                user.water_avg,
                weather.hydration_multiplier
            );

        return WaterLog.create({
            user_id: user.user_id,

            daily_environment_id:
                dailyEnvironment.daily_environment_id,

            date: today,

            target_amount: targetAmount,

            achieved_amount: 0,
        });
    }

    async refreshTodayData(user) {
        const today = new Date()
            .toISOString()
            .split('T')[0];

        const weather =
            await weatherService.getDailyEnvironment(
                user.city,
                today
            );

        const environment =
            await DailyEnvironment.findOne({
                where: {
                    user_id: user.user_id,
                    date: today,
                },
            });

        if (environment) {
            await environment.update({
                temperature_avg:
                    weather.temperature_avg,

                humidity_avg:
                    weather.humidity_avg,

                uv_index: weather.uv_index,

                recommended_spf:
                    weather.recommended_spf,
            });
        }

        const waterLog =
            await WaterLog.findOne({
                where: {
                    user_id: user.user_id,
                    date: today,
                },
            });

        if (waterLog) {
            waterLog.target_amount =
                weatherService.calculateTargetWater(
                    user.water_avg,
                    weather.hydration_multiplier
                );

            await waterLog.save();
        }
    }
}

module.exports =
    new WaterDailyService();