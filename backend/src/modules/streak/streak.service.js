const { Op } = require('sequelize');
const { RoutineLog, RoutineStepLog } = require('../../database/models');

class StreakService {
  async getUserStreak(userId) {
    // Защита от undefined
    if (!userId) return { streak: 0 };

    let streak = 0;
    // Начинаем со вчерашнего дня
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);
    currentDate.setHours(0, 0, 0, 0);

    while (true) {
      // Границы текущего дня (currentDate)
      const startOfDay = new Date(currentDate);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // 1. Находим все логи рутин за этот день
      const routineLogs = await RoutineLog.findAll({
        where: {
          user_id: userId,
          completed_at: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        raw: true,
        attributes: ['routine_log_id', 'routine_id'],
      });

      if (routineLogs.length === 0) break; // нет активностей – серия прервана

      const routineLogIds = routineLogs.map(log => log.routine_log_id);

      // 2. Получаем все шаги для этих логов
      const stepLogs = await RoutineStepLog.findAll({
        where: {
          routine_log_id: routineLogIds,
        },
        raw: true,
        attributes: ['routine_log_id', 'completed'],
      });

      // Группируем по routine_log_id: считаем total и completed
      const statsByLog = {};
      for (const step of stepLogs) {
        if (!statsByLog[step.routine_log_id]) {
          statsByLog[step.routine_log_id] = { total: 0, completed: 0 };
        }
        statsByLog[step.routine_log_id].total++;
        if (step.completed) statsByLog[step.routine_log_id].completed++;
      }

      let allRoutinesCompleted = true;
      for (const log of routineLogs) {
        const stats = statsByLog[log.routine_log_id] || { total: 0, completed: 0 };
        const ratio = stats.total === 0 ? 0 : stats.completed / stats.total;
        if (ratio < 0.8) {
          allRoutinesCompleted = false;
          break;
        }
      }

      if (!allRoutinesCompleted) break;

      streak++;
      // Переход к предыдущему дню
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return { streak };
  }
}

module.exports = new StreakService();