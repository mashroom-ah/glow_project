const { AppUser } = require('../../database/models');

class UserService {
    async updateProfile(userId, data) {
        const user = await AppUser.findByPk(userId);

        if (!user) {
            throw new Error('User not found');
        }

        await user.update({
            name: data.name,
            city: data.city,
            height: data.height,
            weight: data.weight,
            birth_date: data.birth_date,
            activity_level: data.activity_level,
        });

        return {
            message: 'Profile updated successfully',
        };
    }
}

module.exports = new UserService();