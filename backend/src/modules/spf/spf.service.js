const {
    DailyEnvironment,
} = require('../../database/models');

class SpfService {
    async getSPF(userId) {
        const DailyEnvironment =
            await WaterLog.findOne({
                where: {
                    user_id: userId,
                },
            });

        if (!DailyEnvironment) {
            throw new Error(
                'DailyEnvironment log not found'
            );
        }

        return {
            recommended_spf: DailyEnvironment.recommended_spf,
        };
    }
}

module.exports = new SpfService();