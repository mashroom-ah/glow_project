const {
  WaterLog,
} = require('../../database/models');

class WaterService {
  async getToday(userId) {
    const today = new Date()
      .toLocaleDateString('en-CA');

    const waterLog =
      await WaterLog.findOne({
        where: {
          user_id: userId,
          date: today,
        },
      });

    if (!waterLog) {
      throw new Error(
        'Water log not found'
      );
    }

    return {
      date: waterLog.date,

      achieved_amount:
        waterLog.achieved_amount,

      target_amount:
        waterLog.target_amount,
    };
  }

  async addWater(userId, amount) {
    if (
      !amount ||
      amount <= 0
    ) {
      throw new Error(
        'Invalid amount'
      );
    }

    const today = new Date()
      .toLocaleDateString('en-CA');

    const waterLog =
      await WaterLog.findOne({
        where: {
          user_id: userId,
          date: today,
        },
      });

    if (!waterLog) {
      throw new Error(
        'Water log not found'
      );
    }

    waterLog.achieved_amount +=
      amount;

    await waterLog.save();

    return {
      achieved_amount:
        waterLog.achieved_amount,
    };
  }

  async removeWater(userId, amount) {
    if (
      !amount ||
      amount <= 0
    ) {
      throw new Error(
        'Invalid amount'
      );
    }

    const today = new Date()
      .toLocaleDateString('en-CA');

    const waterLog =
      await WaterLog.findOne({
        where: {
          user_id: userId,
          date: today,
        },
      });

    if (!waterLog) {
      throw new Error(
        'Water log not found'
      );
    }

    waterLog.achieved_amount =
      Math.max(
        0,
        waterLog.achieved_amount -
          amount
      );

    await waterLog.save();

    return {
      achieved_amount:
        waterLog.achieved_amount,
    };
  }
}

module.exports = new WaterService();