const {
    DailyEnvironment,
} = require('../../database/models');

class SpfService {
    async getSPF(userId) {
        const today = new Date()
            .toISOString()
            .split('T')[0];

        // Переименуем переменную, чтобы не конфликтовать с моделью
        const dailyEnvRecord = await DailyEnvironment.findOne({
            where: {
                user_id: userId,
                date: today,
            },
        });

        if (!dailyEnvRecord) {
            // Если нет записи на сегодня, пробуем создать через waterDailyService
            // или просто возвращаем 0
            return { recommended_spf: 0 };
        }

        return {
            recommended_spf: dailyEnvRecord.recommended_spf,
        };
    }
}

module.exports = new SpfService();