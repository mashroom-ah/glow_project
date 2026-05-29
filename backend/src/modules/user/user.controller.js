const { AppUser } = require('../../database/models');
const userService = require('./user.service');

class UserController {
    async getMe(req, res) {
        try {
            const user = await AppUser.findByPk(
                req.user.user_id,
                {
                    attributes: {
                        exclude: ['password_hash'],
                    },
                }
            );

            return res.json(user);
        } catch (error) {
            return res.status(500).json({
                message: error.message,
            });
        }
    }

    async updateProfile(req, res) {
        try {
            const result = await userService.updateProfile(
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
}

module.exports = new UserController();