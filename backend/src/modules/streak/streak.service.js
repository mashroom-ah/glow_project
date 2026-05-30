const {
  Routine,
  RoutineItem,
  RoutineLog,
} = require('../../database/models');

class StreakService {
  async getUserStreak(userId) {
    const routines = await Routine.findAll({
      where: { userId },
      include: [RoutineItem]
    });

    let streak = 0;

    let currentDate = dayjs().subtract(1, 'day');

    while (true) {
      let allCompleted = true;

      for (const routine of routines) {
        const totalSteps = routine.RoutineItems.length;

        const completedLogs =
          await RoutineLog.count({
            where: {
              routineId: routine.id,
              completed: true,
              createdAt: {
                [Op.between]: [
                  currentDate.startOf('day').toDate(),
                  currentDate.endOf('day').toDate()
                ]
              }
            }
          });

        const ratio =
          totalSteps === 0
            ? 0
            : completedLogs / totalSteps;

        if (ratio < 0.8) {
          allCompleted = false;
          break;
        }
      }

      if (!allCompleted) {
        break;
      }

      streak++;

      currentDate =
        currentDate.subtract(1, 'day');
    }

    return streak;
  }
}

module.exports = 
  new StreakService();