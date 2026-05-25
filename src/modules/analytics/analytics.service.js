const {
    RoutineLog,
    Routine,
    RoutineStepLog,
    SkinReaction,
    Reaction,
    ReactionGroup,
    OverallScore
} = require('../../database/models');

const { Op } = require('sequelize');

class AnalyticsService {
    async getRoutineAnalytics(
        userId,
        type,
        endDate
    ) {
        if (!type) {
            throw new Error(
                'type is required'
            );
        }

        if (!endDate) {
            throw new Error(
                'end_date is required'
            );
        }

        const end =
            new Date(endDate);

        end.setHours(
            23,
            59,
            59,
            999
        );

        const start =
            new Date(end);

        start.setDate(
            start.getDate() - 6
        );

        start.setHours(
            0,
            0,
            0,
            0
        );

        const logs =
            await RoutineLog.findAll({
                where: {
                    user_id: userId,

                    completed_at: {
                        [Op.between]: [
                            start,
                            end,
                        ],
                    },
                },

                include: [
                    {
                        model: Routine,

                        where: {
                            routine_type: type,
                        },
                    },

                    {
                        model:
                            RoutineStepLog,
                    },
                ],
            });

        const data = [];

        for (
            let i = 0;
            i < 7;
            i++
        ) {
            const currentDate =
                new Date(start);

            currentDate.setDate(
                start.getDate() + i
            );

            const dateString =
                currentDate
                    .toISOString()
                    .split('T')[0];

            const dayLogs =
                logs.filter((log) => {
                    const logDate =
                        log.completed_at
                            .toISOString()
                            .split('T')[0];

                    return (
                        logDate ===
                        dateString
                    );
                });

            let completed = 0;
            let total = 0;

            for (const log of dayLogs) {
                total +=
                    log
                        .RoutineStepLogs
                        .length;

                completed +=
                    log.RoutineStepLogs.filter(
                        (step) =>
                            step.completed
                    ).length;
            }

            const completion_percent =
                total === 0
                    ? 0
                    : Math.round(
                        (completed /
                            total) *
                        100
                    );

            data.push({
                date: dateString,
                completion_percent,
            });
        }

        return {
            type,

            start_date:
                start
                    .toISOString()
                    .split('T')[0],

            end_date:
                end
                    .toISOString()
                    .split('T')[0],

            data,
        };
    }

    async getOverallScoreAnalytics(
        userId,
        period,
        endDate
    ) {
        if (!period) {
            throw new Error(
                'period is required'
            );
        }

        if (!endDate) {
            throw new Error(
                'end_date is required'
            );
        }

        const end =
            new Date(endDate);

        end.setHours(
            23,
            59,
            59,
            999
        );

        const start =
            new Date(end);

        if (period === 'week') {
            start.setDate(
                start.getDate() - 6
            );
        } else if (
            period === 'month'
        ) {
            start.setDate(
                start.getDate() - 29
            );
        } else {
            throw new Error(
                'Invalid period'
            );
        }

        start.setHours(
            0,
            0,
            0,
            0
        );

        const scores =
            await OverallScore.findAll({
                include: [
                    {
                        model: RoutineLog,

                        where: {
                            user_id: userId,

                            completed_at: {
                                [Op.between]: [
                                    start,
                                    end,
                                ],
                            },
                        },
                    },
                ],
            });

        const grouped = {};

        for (const score of scores) {
            const date =
                score.RoutineLog.completed_at
                    .toISOString()
                    .split('T')[0];

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(
                score.score
            );
        }

        const totalDays =
            period === 'week'
                ? 7
                : 30;

        const data = [];

        for (
            let i = 0;
            i < totalDays;
            i++
        ) {
            const currentDate =
                new Date(start);

            currentDate.setDate(
                start.getDate() + i
            );

            const dateString =
                currentDate
                    .toISOString()
                    .split('T')[0];

            const values =
                grouped[dateString] ||
                [];

            const score =
                values.length === 0
                    ? 0
                    : Number(
                        (
                            values.reduce(
                                (
                                    acc,
                                    val
                                ) =>
                                    acc + val,
                                0
                            ) / values.length
                        ).toFixed(1)
                    );

            data.push({
                date: dateString,
                score,
            });
        }

        return {
            period,

            start_date:
                start
                    .toISOString()
                    .split('T')[0],

            end_date:
                end
                    .toISOString()
                    .split('T')[0],

            data,
        };
    }
    
    async getReactionGroupAnalytics(
        userId,
        period,
        endDate
    ) {
        if (!period) {
            throw new Error(
                'period is required'
            );
        }

        if (!endDate) {
            throw new Error(
                'end_date is required'
            );
        }

        const end =
            new Date(endDate);

        end.setHours(
            23,
            59,
            59,
            999
        );

        const start =
            new Date(end);

        if (period === 'week') {
            start.setDate(
                start.getDate() - 6
            );
        } else if (
            period === 'month'
        ) {
            start.setDate(
                start.getDate() - 29
            );
        } else {
            throw new Error(
                'Invalid period'
            );
        }

        start.setHours(
            0,
            0,
            0,
            0
        );

        const reactions =
            await SkinReaction.findAll({
                include: [
                    {
                        model: Reaction,

                        include: [
                            ReactionGroup,
                        ],
                    },

                    {
                        model: RoutineLog,

                        where: {
                            user_id: userId,

                            completed_at: {
                                [Op.between]: [
                                    start,
                                    end,
                                ],
                            },
                        },
                    },
                ],
            });

        const grouped = {};

        for (const reaction of reactions) {
            const group =
                reaction.Reaction
                    .ReactionGroup;

            const groupId =
                group.reaction_group_id;

            if (!grouped[groupId]) {
                grouped[groupId] = {
                    reaction_group_id:
                        groupId,

                    reaction_group_name:
                        group.reaction_group_name,

                    scores: [],
                };
            }

            grouped[
                groupId
            ].scores.push(
                reaction.score
            );
        }

        const data =
            Object.values(grouped).map(
                (group) => ({
                    reaction_group_id:
                        group.reaction_group_id,

                    reaction_group_name:
                        group.reaction_group_name,

                    average_score:
                        Number(
                            (
                                group.scores.reduce(
                                    (
                                        acc,
                                        val
                                    ) =>
                                        acc + val,
                                    0
                                ) /
                                group.scores.length
                            ).toFixed(1)
                        ),
                })
            );

        return {
            period,

            start_date:
                start
                    .toISOString()
                    .split('T')[0],

            end_date:
                end
                    .toISOString()
                    .split('T')[0],

            data,
        };
    }
}

module.exports =
    new AnalyticsService();