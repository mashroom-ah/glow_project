const groupComponentService = require('./groupComponent.service');

class GroupComponentController {
  async getByGroup(req, res) {
    try {
      const { group_name } = req.query;
      if (!group_name) {
        return res.status(400).json({ message: 'group_name is required' });
      }
      const result = await groupComponentService.getByGroup(group_name);
      return res.json(result);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new GroupComponentController();