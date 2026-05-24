const waterService = require(
  './water.service'
);

class WaterController {
  async getToday(req, res) {
    try {
      const result =
        await waterService.getToday(
          req.user.user_id
        );

      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }

  async addWater(req, res) {
    try {
      const result =
        await waterService.addWater(
          req.user.user_id,
          req.body.amount_ml
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  async removeWater(req, res) {
    try {
      const result =
        await waterService.removeWater(
          req.user.user_id,
          req.body.amount_ml
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message: error.message,
      });
    }
  }
}

module.exports = new WaterController();