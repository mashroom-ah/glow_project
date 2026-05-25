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

const {
    formatRoutineLog,
} = require('./routineLog.formatter');

const { Op } = require('sequelize');

class RoutineLogService {
    async create(userId, data) {
        const {
            routine_id,
            completed_at,
            steps,
            reactions,
            overall_score,
        } = data;

        const existingLog =
            await RoutineLog.findOne({
                where: {
                    user_id: userId,
                    routine_id,

                    completed_at: {
                        [Op.between]: [
                            new Date(
                                `${completed_at}T00:00:00`
                            ),

                            new Date(
                                `${completed_at}T23:59:59`
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
            const routine =
                await Routine.findOne({
                    where: {
                        routine_id,
                        user_id: userId,
                        is_active: true,
                    },

                    include: [
                        {
                            model: RoutineStep,
                        },
                    ],

                    transaction,
                });

            if (!routine) {
                throw new Error(
                    'Routine not found or is not active'
                );
            }

            const targetDate =
                new Date(completed_at);

            targetDate.setHours(
                0,
                0,
                0,
                0
            );

            const dayOfWeek =
                targetDate.getDay();

            const requiredSteps =
                routine.RoutineSteps.filter(
                    (step) => {
                        if (
                            step.frequency_type ===
                            'daily'
                        ) {
                            return true;
                        }

                        if (
                            step.frequency_type ===
                            'weekly'
                        ) {
                            return (
                                step.frequency_value ===
                                dayOfWeek
                            );
                        }

                        if (
                            step.frequency_type ===
                            'every_n_days'
                        ) {
                            if (
                                step.frequency_value <=
                                0
                            ) {
                                return false;
                            }

                            const createdAt =
                                new Date(
                                    step.created_at
                                );

                            createdAt.setHours(
                                0,
                                0,
                                0,
                                0
                            );

                            const diffDays =
                                Math.floor(
                                    (targetDate -
                                        createdAt) /
                                        (1000 *
                                            60 *
                                            60 *
                                            24)
                                );

                            return (
                                diffDays >= 0 &&
                                diffDays %
                                    step.frequency_value ===
                                    0
                            );
                        }

                        return false;
                    }
                );

            const requiredStepIds =
                new Set(
                    requiredSteps.map(
                        (s) =>
                            s.routine_step_id
                    )
                );

            const stepsMap = new Map();

            if (steps?.length) {
                for (const step of steps) {
                    if (
                        !requiredStepIds.has(
                            step.routine_step_id
                        )
                    ) {
                        throw new Error(
                            `Step ${step.routine_step_id} is not required for this date`
                        );
                    }

                    if (
                        stepsMap.has(
                            step.routine_step_id
                        )
                    ) {
                        throw new Error(
                            `Duplicate step ${step.routine_step_id}`
                        );
                    }

                    stepsMap.set(
                        step.routine_step_id,
                        step.completed
                    );
                }
            }

            const routineLog =
                await RoutineLog.create(
                    {
                        routine_id,
                        user_id: userId,
                        completed_at,
                    },
                    { transaction }
                );

            for (const step of requiredSteps) {
                await RoutineStepLog.create(
                    {
                        routine_log_id:
                            routineLog.routine_log_id,

                        routine_step_id:
                            step.routine_step_id,

                        completed:
                            stepsMap.has(
                                step.routine_step_id
                            )
                                ? stepsMap.get(
                                      step.routine_step_id
                                  )
                                : false,
                    },
                    { transaction }
                );
            }

            if (reactions?.length) {
                for (const reaction of reactions) {
                    await SkinReaction.create(
                        {
                            routine_log_id:
                                routineLog.routine_log_id,

                            reaction_id:
                                reaction.reaction_id,

                            score:
                                reaction.score,
                        },
                        { transaction }
                    );
                }

                const skinReactions =
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

                for (const item of skinReactions) {
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
                            (acc, val) =>
                                acc + val,
                            0
                        ) / scores.length;

                    await ReactionGroupScore.create(
                        {
                            routine_log_id:
                                routineLog.routine_log_id,

                            reaction_group_id:
                                groupId,

                            score: Number(
                                average.toFixed(
                                    1
                                )
                            ),
                        },
                        { transaction }
                    );
                }
            }

            if (
                overall_score !== undefined
            ) {
                await OverallScore.create(
                    {
                        routine_log_id:
                            routineLog.routine_log_id,

                        score: overall_score,
                    },
                    { transaction }
                );
            }

            await transaction.commit();

            // ВАЖНО:
            // после commit заново получаем данные
            // через отдельный запрос getById

            return this.getById(
                userId,
                routineLog.routine_log_id
            );
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }

    async getById(userId, routineLogId) {
        const log =
            await RoutineLog.findOne({
                where: {
                    routine_log_id:
                        routineLogId,

                    user_id: userId,
                },

                include: [
                    {
                        model: Routine,

                        attributes: [
                            'routine_id',
                            'routine_type',
                        ],
                    },

                    {
                        model: RoutineStepLog,

                        include: [
                            {
                                model: RoutineStep,

                                include: [
                                    'Product',
                                ],
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
                        model:
                            ReactionGroupScore,

                        include: [
                            ReactionGroup,
                        ],
                    },

                    {
                        model: OverallScore,
                    },
                ],

                order: [
                    [
                        RoutineStepLog,
                        RoutineStep,
                        'step_order',
                        'ASC',
                    ],
                ],
            });

        if (!log) {
            throw new Error(
                'Routine log not found'
            );
        }

        return formatRoutineLog(log);
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

                        attributes: [
                            'routine_id',
                            'routine_type',
                        ],
                    },

                    {
                        model: RoutineStepLog,

                        include: [
                            {
                                model: RoutineStep,

                                include: [
                                    'Product',
                                ],
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
                        model:
                            ReactionGroupScore,

                        include: [
                            ReactionGroup,
                        ],
                    },

                    {
                        model: OverallScore,
                    },
                ],

                order: [
                    [
                        RoutineStepLog,
                        RoutineStep,
                        'step_order',
                        'ASC',
                    ],
                ],
            });

        return logs.map(
            formatRoutineLog
        );
    }

    async update(
        userId,
        routineLogId,
        data
    ) {
        const {
            steps,
            reactions,
            overall_score,
        } = data;

        const transaction =
            await sequelize.transaction();

        try {
            const routineLog =
                await RoutineLog.findOne({
                    where: {
                        routine_log_id:
                            routineLogId,

                        user_id: userId,
                    },

                    include: [
                        {
                            model: Routine,

                            include: [
                                {
                                    model:
                                        RoutineStep,
                                },
                            ],
                        },
                    ],

                    transaction,
                });

            if (!routineLog) {
                throw new Error(
                    'Routine log not found'
                );
            }

            const routine =
                routineLog.Routine;

            const targetDate =
                new Date(
                    routineLog.completed_at
                );

            targetDate.setHours(
                0,
                0,
                0,
                0
            );

            const dayOfWeek =
                targetDate.getDay();

            const requiredSteps =
                routine.RoutineSteps.filter(
                    (step) => {
                        if (
                            step.frequency_type ===
                            'daily'
                        ) {
                            return true;
                        }

                        if (
                            step.frequency_type ===
                            'weekly'
                        ) {
                            return (
                                step.frequency_value ===
                                dayOfWeek
                            );
                        }

                        if (
                            step.frequency_type ===
                            'every_n_days'
                        ) {
                            if (
                                step.frequency_value <=
                                0
                            ) {
                                return false;
                            }

                            const createdAt =
                                new Date(
                                    step.created_at
                                );

                            createdAt.setHours(
                                0,
                                0,
                                0,
                                0
                            );

                            const diffDays =
                                Math.floor(
                                    (targetDate -
                                        createdAt) /
                                        (1000 *
                                            60 *
                                            60 *
                                            24)
                                );

                            return (
                                diffDays >= 0 &&
                                diffDays %
                                    step.frequency_value ===
                                    0
                            );
                        }

                        return false;
                    }
                );

            const requiredStepIds =
                new Set(
                    requiredSteps.map(
                        (s) =>
                            s.routine_step_id
                    )
                );

            if (steps?.length) {
                const stepsMap =
                    new Map();

                for (const step of steps) {
                    if (
                        !requiredStepIds.has(
                            step.routine_step_id
                        )
                    ) {
                        throw new Error(
                            `Step ${step.routine_step_id} is not required for this date`
                        );
                    }

                    stepsMap.set(
                        step.routine_step_id,
                        step.completed
                    );
                }

                const existingStepLogs =
                    await RoutineStepLog.findAll(
                        {
                            where: {
                                routine_log_id:
                                    routineLogId,
                            },

                            transaction,
                        }
                    );

                for (const stepLog of existingStepLogs) {
                    if (
                        stepsMap.has(
                            stepLog.routine_step_id
                        )
                    ) {
                        stepLog.completed =
                            stepsMap.get(
                                stepLog.routine_step_id
                            );

                        await stepLog.save(
                            {
                                transaction,
                            }
                        );
                    }
                }
            }

            if (
                reactions !== undefined
            ) {
                await SkinReaction.destroy(
                    {
                        where: {
                            routine_log_id:
                                routineLogId,
                        },

                        transaction,
                    }
                );

                await ReactionGroupScore.destroy(
                    {
                        where: {
                            routine_log_id:
                                routineLogId,
                        },

                        transaction,
                    }
                );

                if (reactions?.length) {
                    for (const reaction of reactions) {
                        await SkinReaction.create(
                            {
                                routine_log_id:
                                    routineLogId,

                                reaction_id:
                                    reaction.reaction_id,

                                score:
                                    reaction.score,
                            },
                            { transaction }
                        );
                    }

                    const skinReactions =
                        await SkinReaction.findAll(
                            {
                                where: {
                                    routine_log_id:
                                        routineLogId,
                                },

                                include: [
                                    {
                                        model:
                                            Reaction,
                                    },
                                ],

                                transaction,
                            }
                        );

                    const grouped = {};

                    for (const item of skinReactions) {
                        const groupId =
                            item.Reaction
                                .reaction_group_id;

                        if (
                            !grouped[groupId]
                        ) {
                            grouped[groupId] =
                                [];
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
                                (
                                    acc,
                                    val
                                ) =>
                                    acc + val,
                                0
                            ) / scores.length;

                        await ReactionGroupScore.create(
                            {
                                routine_log_id:
                                    routineLogId,

                                reaction_group_id:
                                    groupId,

                                score:
                                    Number(
                                        average.toFixed(
                                            1
                                        )
                                    ),
                            },
                            {
                                transaction,
                            }
                        );
                    }
                }
            }

            if (
                overall_score !== undefined
            ) {
                const existingOverall =
                    await OverallScore.findOne(
                        {
                            where: {
                                routine_log_id:
                                    routineLogId,
                            },

                            transaction,
                        }
                    );

                if (existingOverall) {
                    existingOverall.score =
                        overall_score;

                    await existingOverall.save(
                        {
                            transaction,
                        }
                    );
                } else {
                    await OverallScore.create(
                        {
                            routine_log_id:
                                routineLogId,

                            score:
                                overall_score,
                        },
                        { transaction }
                    );
                }
            }

            await transaction.commit();

            return this.getById(
                userId,
                routineLogId
            );
        } catch (error) {
            await transaction.rollback();

            throw error;
        }
    }
}

module.exports =
    new RoutineLogService();