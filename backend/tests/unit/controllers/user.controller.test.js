const userController = require('../../../src/modules/user/user.controller');
const { AppUser } = require('../../../src/database/models');
const userService = require('../../../src/modules/user/user.service');
const { mockUsers } = require('../../helpers/mockData');

jest.mock('../../../src/database/models', () => ({
  AppUser: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../../src/modules/user/user.service', () => ({
  updateProfile: jest.fn(),
}));

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { user_id: mockUsers.regular.user_id },
      body: {},
    };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    test('возвращает данные пользователя без пароля', async () => {
      const mockUser = { ...mockUsers.regular };
      delete mockUser.password_hash;
      AppUser.findByPk.mockResolvedValue(mockUser);

      await userController.getMe(req, res);

      expect(AppUser.findByPk).toHaveBeenCalledWith(mockUsers.regular.user_id, {
        attributes: { exclude: ['password_hash'] },
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    test('возвращает 500 если пользователь не найден', async () => {
      AppUser.findByPk.mockResolvedValue(null);

      await userController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) });
    });
  });

  describe('updateProfile', () => {
    test('обновляет профиль пользователя', async () => {
      req.body = { name: 'New Name', city: 'New City' };
      userService.updateProfile.mockResolvedValue({ message: 'Profile updated successfully' });

      await userController.updateProfile(req, res);

      expect(userService.updateProfile).toHaveBeenCalledWith(mockUsers.regular.user_id, req.body);
      expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
    });

    test('возвращает 400 при ошибке', async () => {
      userService.updateProfile.mockRejectedValue(new Error('Update failed'));

      await userController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Update failed' });
    });
  });
});