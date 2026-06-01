const userService = require('../../../src/modules/user/user.service');
const { AppUser } = require('../../../src/database/models');
const { mockUsers } = require('../../helpers/mockData');

jest.mock('../../../src/database/models', () => ({
  AppUser: {
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

describe('UserService', () => {
  const userId = mockUsers.regular.user_id;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const updateData = {
      name: 'Updated Name',
      city: 'Updated City',
      height: 180,
      weight: 80,
      birth_date: '1995-05-05',
      activity_level: 'high',
    };

    test('успешно обновляет профиль', async () => {
      const mockUser = {
        update: jest.fn().mockResolvedValue(true),
      };
      AppUser.findByPk.mockResolvedValue(mockUser);

      const result = await userService.updateProfile(userId, updateData);

      expect(AppUser.findByPk).toHaveBeenCalledWith(userId);
      expect(mockUser.update).toHaveBeenCalledWith(updateData);
      expect(result.message).toBe('Profile updated successfully');
    });

    test('выбрасывает ошибку если пользователь не найден', async () => {
      AppUser.findByPk.mockResolvedValue(null);

      await expect(userService.updateProfile(userId, updateData)).rejects.toThrow('User not found');
    });
  });
});