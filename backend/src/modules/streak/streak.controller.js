const streakService =
  require('./streak.service');

class streakController {
  async getStreak(req, res) {
    const streak =
      await streakService.getUserStreak(
        req.user.id
      );

    res.json({ streak });
  }
}

module.exports =
  new streakController();