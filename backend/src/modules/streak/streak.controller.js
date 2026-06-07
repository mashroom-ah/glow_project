const streakService =
  require('./streak.service');

class streakController {
  async getStreak(req, res) {
    try {
      const result =
        await streakService.getUserStreak(
          req.user_id
        );

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
}

module.exports =
  new streakController();