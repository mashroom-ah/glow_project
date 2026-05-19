const itemService = require('./item.service');

class ItemController {
    async create(req, res) {
        try {
            const result = await itemService.create(
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

    async getAll(req, res) {
        try {
            const result = await itemService.getAll(
                req.user.user_id
            );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async getById(req, res) {
        try {
            const result = await itemService.getById(
                req.user.user_id,
                req.params.id
            );

            return res.json(result);
        } catch (error) {
            return res.status(404).json({
                message: error.message,
            });
        }
    }

    async update(req, res) {
        try {
            const result = await itemService.update(
                req.user.user_id,
                req.params.id,
                req.body
            );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async delete(req, res) {
        try {
            const result = await itemService.delete(
                req.user.user_id,
                req.params.id
            );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async archive(req, res) {
        try {
            const result = await itemService.archive(
                req.user.user_id,
                req.params.id
            );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async restore(req, res) {
        try {
            const result = await itemService.restore(
                req.user.user_id,
                req.params.id
            );

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }
}

module.exports = new ItemController();