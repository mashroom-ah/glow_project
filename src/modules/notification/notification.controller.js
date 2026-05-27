const service = require(
  './notification.service'
);

class NotificationController {
  async getSettings(req, res) {
    try {
      const result =
        await service.getSettings(
          req.user.user_id
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async updateSettings(
    req,
    res
  ) {
    try {
      const result =
        await service.updateSettings(
          req.user.user_id,
          req.body
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async subscribe(req, res) {
    try {
      const result =
        await service.saveSubscription(
          req.user.user_id,
          req.body
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async unsubscribe(
    req,
    res
  ) {
    try {
      const result =
        await service.removeSubscription(
          req.body.endpoint
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}

module.exports =
  new NotificationController();