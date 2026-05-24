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
        const { routine_id, completed_at, steps, reactions, overall_score } = data;

        // 1. Проверка на уже существующий лог за эту дату
        const existingLog = await RoutineLog.findOne({
            where: {
                user_id: userId,
                routine_id,
                completed_at: {
                    [Op.between]: [
                        new Date(`${completed_at}T00:00:00`),
                        new Date(`${completed_at}T23:59:59`),
                    ],
                },
            },
        });

        if (existingLog) {
            throw new Error('Routine log already exists for this date');
        }

        const transaction = await sequelize.transaction();

        try {
            // 2. Получаем рутину с шагами
            const routine = await Routine.findOne({
                where: {
                    routine_id,
                    user_id: userId,
                    is_active: true,
                },
                include: [{ model: RoutineStep }],
            });

            if (!routine) {
                throw new Error('Routine not found or is not active');
            }

            // 3. Определяем, какие шаги должны быть выполнены в указанную дату
            const targetDate = new Date(completed_at);
            targetDate.setHours(0, 0, 0, 0);
            const dayOfWeek = targetDate.getDay();

            const requiredSteps = routine.RoutineSteps.filter((step) => {
                if (step.frequency_type === 'daily') return true;
                if (step.frequency_type === 'weekly') {
                    return step.frequency_value === dayOfWeek;
                }
                if (step.frequency_type === 'every_n_days') {
                    if (step.frequency_value <= 0) return false;
                    const createdAt = new Date(step.created_at);
                    createdAt.setHours(0, 0, 0, 0);
                    const diffDays = Math.floor((targetDate - createdAt) / (1000 * 60 * 60 * 24));
                    return diffDays >= 0 && diffDays % step.frequency_value === 0;
                }
                return false;
            });

            const requiredStepIds = new Set(requiredSteps.map((s) => s.routine_step_id));

            // 4. Проверяем переданные steps на соответствие обязательным
            const stepsMap = new Map();
            if (steps && steps.length) {
                for (const step of steps) {
                    if (!requiredStepIds.has(step.routine_step_id)) {
                        throw new Error(
                            `Step ${step.routine_step_id} is not required for this date or does not belong to the routine`
                        );
                    }
                    if (stepsMap.has(step.routine_step_id)) {
                        throw new Error(`Duplicate step ${step.routine_step_id}`);
                    }
                    stepsMap.set(step.routine_step_id, step.completed);
                }
            }

            // 5. Создаём запись RoutineLog
            const routineLog = await RoutineLog.create(
                {
                    routine_id,
                    user_id: userId,
                    completed_at,
                },
                { transaction }
            );

            // 6. Создаём записи RoutineStepLog для всех обязательных шагов
            for (const step of requiredSteps) {
                const completed = stepsMap.has(step.routine_step_id)
                    ? stepsMap.get(step.routine_step_id)
                    : false;

                await RoutineStepLog.create(
                    {
                        routine_log_id: routineLog.routine_log_id,
                        routine_step_id: step.routine_step_id,
                        completed,
                    },
                    { transaction }
                );
            }

            // 7. Обработка реакций кожи (SkinReaction)
            if (reactions && reactions.length) {
                for (const reaction of reactions) {
                    await SkinReaction.create(
                        {
                            routine_log_id: routineLog.routine_log_id,
                            reaction_id: reaction.reaction_id,
                            score: reaction.score,
                        },
                        { transaction }
                    );
                }

                // 8. Расчёт среднего балла по группам реакций
                const skinReactions = await SkinReaction.findAll({
                    where: { routine_log_id: routineLog.routine_log_id },
                    include: [{ model: Reaction }],
                    transaction,
                });

                const grouped = {};
                for (const item of skinReactions) {
                    const groupId = item.Reaction.reaction_group_id;
                    if (!grouped[groupId]) grouped[groupId] = [];
                    grouped[groupId].push(item.score);
                }

                for (const groupId of Object.keys(grouped)) {
                    const scores = grouped[groupId];
                    const average = scores.reduce((acc, val) => acc + val, 0) / scores.length;
                    await ReactionGroupScore.create(
                        {
                            routine_log_id: routineLog.routine_log_id,
                            reaction_group_id: groupId,
                            score: average,
                        },
                        { transaction }
                    );
                }
            }

            // 9. Общая оценка (OverallScore)
            if (overall_score !== undefined) {
                await OverallScore.create(
                    {
                        routine_log_id: routineLog.routine_log_id,
                        score: overall_score,
                    },
                    { transaction }
                );
            }

            await transaction.commit();

            // 10. Возвращаем свежесозданные логи для этой даты (чтобы клиент получил полную картину)
            return this.getByDate(userId, completed_at);
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getByDate(userId, date) {
        const startOfDay = new Date(`${date}T00:00:00`);
        const endOfDay = new Date(`${date}T23:59:59`);

        const logs = await RoutineLog.findAll({
            where: {
                user_id: userId,
                completed_at: { [Op.between]: [startOfDay, endOfDay] },
            },
            include: [
                {
                    model: RoutineStepLog,
                    include: [{ model: RoutineStep, include: ['Product'] }],
                    // Убираем order отсюда – он не сработает как нужно
                },
                {
                    model: SkinReaction,
                    include: [{ model: Reaction, include: [ReactionGroup] }],
                },
                {
                    model: ReactionGroupScore,
                    include: [ReactionGroup],
                },
                {
                    model: OverallScore,
                },
            ],
        });

        // Сортируем RoutineStepLogs внутри каждого лога
        logs.forEach(log => {
            log.RoutineStepLogs.sort((a, b) =>
                a.RoutineStep.step_order - b.RoutineStep.step_order
            );
        });

        return logs;
    }
}

module.exports = new RoutineLogService();