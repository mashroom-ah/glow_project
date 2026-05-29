const skinReactionService =
  require('./skinReaction.service');

class SkinReactionController {
  async getAll(req, res) {
    try {
      const result =
        await skinReactionService.getAll();

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message:
          error.message,
      });
    }
  }
}

module.exports =
  new SkinReactionController();