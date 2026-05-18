const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { AppUser, RefreshToken } = require('../../database/models');

class AuthService {
    async register(data) {
        const existingUser = await AppUser.findOne({
            where: {
                email: data.email,
            },
        });

        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await AppUser.create({
            email: data.email,
            password_hash: hashedPassword,
            name: data.name,
            city: data.city,
            height: data.height,
            weight: data.weight,
            birth_date: data.birth_date,
            activity_level: data.activity_level,
        });

        return this.generateAuthResponse(user);
    }

    async login(email, password) {
        const user = await AppUser.findOne({
            where: {
                email,
            }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        return this.generateAuthResponse(user);
    }

    async generateAuthResponse(user) {
        const accessToken = jwt.sign(
            {
                user_id: user.user_id,
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: '15m',
            }
        );

        const refreshToken = jwt.sign(
            {
                user_id: user.user_id,
            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn: '30d',
            }
        );

        await RefreshToken.create({
            user_id: user.user_id,
            token: refreshToken,
            expires_at: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
            ),
        });

        return {
            user: {
                user_id: user.user_id,
                email: user.email,
                name: user.name,
            },

            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token required');
        }

        const existingToken = await RefreshToken.findOne({
            where: {
                token: refreshToken,
                revoked: false,
            },
        });

        if (!existingToken) {
            throw new Error('Invalid refresh token');
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await AppUser.findByPk(decoded.user_id);

        if (!user) {
            throw new Error('User not found');
        }

        const newAccessToken = jwt.sign(
            {
                user_id: user.user_id,
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: '15m',
            }
        );

        return {
            access_token: newAccessToken,
        };
    }

    async logout(refreshToken) {
        if (!refreshToken) {
            throw new Error('Refresh token required');
        }

        const token = await RefreshToken.findOne({
            where:{
                token: refreshToken,
            }
        });

        if (!token) {
            throw new Error ('Token not found');
        }

        token.revoked = true;

        await token.save();

        return {
            message: 'Logged out successfully',
        };
    }
}

module.exports = new AuthService();
