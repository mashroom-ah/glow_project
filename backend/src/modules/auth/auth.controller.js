const authService = require('./auth.service');
const { AppUser } = require('../../database/models');

class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);

            return res.status(201).json(result);
        }
        catch (error) {
            return res.status(400).json({
                message: error.message,
            });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(
                email,
                password
            );

            return res.json(result);
        } catch (error) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }

    async refresh(req, res) {
        try {
            const { refresh_token } = req.body;

            const result = await authService.refresh(
                refresh_token
            );

            return res.json(result);
        } catch (error) {
            return res.status(401).json({
                message: error.message,
            });
        }
    }

    async logout(req, res) {
        try {
            const { refresh_token } = req.body;

            const result = await authService.logout(refresh_token);

            return res.json(result);
        } catch (error) {
            return res.status(400).json({
                message: error.message,
            })
        };
    }

    async me(req, res) {
        try {
            const user = await AppUser.findByPk(
                req.user.user_id,
                {
                    attributes: {
                        exclude: ['password_hash'],
                    },
                }
            );

            if (!user) {
                return res.status(404).json({
                    message: 'User not found',
                });
            }

            return res.json(user);
        } catch (error) {
            return res.status(500).json ({
                message: error.message,
            });
        }
    }
}

module.exports = new AuthController();
