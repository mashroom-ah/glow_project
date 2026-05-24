const analyticsService =
    require('./analytics.service');

class AnalyticsController {
    async getRoutineAnalytics(
        req,
        res
    ) {
        try {
            const result =
                await analyticsService.getRoutineAnalytics(
                    req.user.user_id,
                    req.query.type,
                    req.query.end_date
                );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async getOverallScoreAnalytics(
        req,
        res
    ) {
        try {
            const result =
                await analyticsService.getOverallScoreAnalytics(
                    req.user.user_id,
                    req.query.period,
                    req.query.end_date
                );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message:
                    error.message,
            });
        }
    }

    async getReactionGroupAnalytics(
        req,
        res
    ) {
        try {
            const result =
                await analyticsService.getReactionGroupAnalytics(
                    req.user.user_id,
                    req.query.period,
                    req.query.end_date
                );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message:
                    error.message,
            });
        }
    }
}

module.exports =
    new AnalyticsController();