const {
    Routine,
    RoutineStep,
    RoutineLog,
    RoutineStepLog,
    SkinReaction,
    Reaction,
    ReactionGroup,
    ReactionGroupScore,
    OverallScore,
    sequelize,
} = require('../../database/models');

const { Op } = require('sequelize');

class RoutineLogService {
    async create(userId, data) {
        const existingLog =
            await RoutineLog.findOne({
                where: {
                    user_id: userId,

                    routine_id: data.routine_id,

                    completed_at: {
                        [Op.between]: [
                            new Date(
                                `${data.completed_at}T00:00:00`
                            ),

                            new Date(
                                `${data.completed_at}T23:59:59`
                            ),
                        ],
                    },
                },
            });

        if (existingLog) {
            throw new Error(
                'Routine log already exists for this date'
            );
        }

        const transaction =
            await sequelize.transaction();

        try {
            const routineLog =
                await RoutineLog.create(
                    {
                        routine_id: data.routine_id,

                        user_id: userId,

                        completed_at:
                            data.completed_at,
                    },

                    { transaction }
                );

            // STEP LOGS

            if (data.steps?.length) {
                for (const step of data.steps) {
                    await RoutineStepLog.create(
                        {
                            routine_log_id:
                                routineLog.routine_log_id,

                            routine_step_id:
                                step.routine_step_id,

                            completed:
                                step.completed,
                        },

                        { transaction }
                    );
                }
            }

            // SKIN REACTIONS

            if (data.reactions?.length) {
                for (const reaction of data.reactions) {
                    await SkinReaction.create(
                        {
                            routine_log_id:
                                routineLog.routine_log_id,

                            reaction_id:
                                reaction.reaction_id,

                            score: reaction.score,
                        },

                        { transaction }
                    );
                }

                // GROUP SCORES

                const reactions =
                    await SkinReaction.findAll({
                        where: {
                            routine_log_id:
                                routineLog.routine_log_id,
                        },

                        include: [
                            {
                                model: Reaction,
                            },
                        ],

                        transaction,
                    });

                const grouped = {};

                for (const item of reactions) {
                    const groupId =
                        item.Reaction
                            .reaction_group_id;

                    if (!grouped[groupId]) {
                        grouped[groupId] = [];
                    }

                    grouped[groupId].push(
                        item.score
                    );
                }

                for (const groupId of Object.keys(
                    grouped
                )) {
                    const scores =
                        grouped[groupId];

                    const average =
                        scores.reduce(
                            (acc, val) => acc + val,
                            0
                        ) / scores.length;

                    await ReactionGroupScore.create(
                        {
                            routine_log_id:
                                routineLog.routine_log_id,

                            reaction_group_id:
                                groupId,

                            score: average,
                        },

                        { transaction }
                    );
                }
            }

            // OVERALL SCORE

            if (
                data.overall_score !== undefined
            ) {
                await OverallScore.create(
                    {
                        routine_log_id:
                            routineLog.routine_log_id,

                        score:
                            data.overall_score,
                    },

                    { transaction }
                );
            }

            await transaction.commit();

            return this.getByDate(
                userId,
                data.completed_at
            );
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }

    async getByDate(userId, date) {
        const startOfDay = new Date(
            `${date}T00:00:00`
        );

        const endOfDay = new Date(
            `${date}T23:59:59`
        );

        const logs =
            await RoutineLog.findAll({
                where: {
                    user_id: userId,

                    completed_at: {
                        [Op.between]: [
                            startOfDay,
                            endOfDay,
                        ],
                    },
                },

                include: [
                    {
                        model: Routine,

                        include: [
                            {
                                model: RoutineStep,

                                include: ['Product'],
                            },
                        ],
                    },

                    {
                        model: RoutineStepLog,

                        include: [
                            {
                                model: RoutineStep,

                                include: ['Product'],
                            },
                        ],
                    },

                    {
                        model: SkinReaction,

                        include: [
                            {
                                model: Reaction,

                                include: [
                                    ReactionGroup,
                                ],
                            },
                        ],
                    },

                    {
                        model: ReactionGroupScore,

                        include: [
                            ReactionGroup,
                        ],
                    },

                    {
                        model: OverallScore,
                    },
                ],
            });

        return logs;
    }
}

module.exports =
    new RoutineLogService();