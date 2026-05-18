const { AppUser } = require('../../database/models');

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
}

module.exports = new UserController();