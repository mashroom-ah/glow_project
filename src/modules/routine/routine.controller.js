const routineService =
    require('./routine.service');

class RoutineController {
    async create(req, res) {
        try {
            const result =
                await routineService.create(
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
            const result =
                await routineService.getAll(
                    req.user.user_id
                );

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    async getById(req, res) {
        try {
            const result =
                await routineService.getById(
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
            const result =
                await routineService.update(
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
            const result =
                await routineService.delete(
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

module.exports =
    new RoutineController();