const componentService = require('./component.service');

class ComponentController {
    async getAll(req, res) {
        try {
            const result = await componentService.getAll();

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }
}

module.exports = new ComponentController();