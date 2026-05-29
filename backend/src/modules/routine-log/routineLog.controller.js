const routineLogService =
  require('./routineLog.service');

class RoutineLogController {
  async create(req, res) {
    try {
      const result =
        await routineLogService.create(
          req.user.user_id,
          req.body
        );

      return res.status(201).json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async getByDate(req, res) {
    try {
      const result =
        await routineLogService.getByDate(
          req.user.user_id,
          req.params.date
        );

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const result = await routineLogService.update(
        req.user.user_id,
        req.params.id,
        req.body
      );
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports =
  new RoutineLogController();