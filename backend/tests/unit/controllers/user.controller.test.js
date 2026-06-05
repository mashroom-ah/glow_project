const userController = require('../../../src/modules/user/user.controller');
const { AppUser } = require('../../../src/database/models');

jest.mock('../../../src/database/models', () => ({
  AppUser: {
    findByPk: jest.fn(),
  },
}));

describe('UserController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      user: { user_id: 'test-user-id' },
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
      const mockUser = {
        user_id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };
      AppUser.findByPk.mockResolvedValue(mockUser);

      await userController.getMe(req, res);

      expect(AppUser.findByPk).toHaveBeenCalledWith('test-user-id', {
        attributes: { exclude: ['password_hash'] },
      });
      expect(res.json).toHaveBeenCalledWith(mockUser);
      // Статус не вызывается, так как нет ошибки
      expect(res.status).not.toHaveBeenCalled();
    });

    test('возвращает null если пользователь не найден', async () => {
      AppUser.findByPk.mockResolvedValue(null);

      await userController.getMe(req, res);

      // Контроллер возвращает null со статусом 200 (без вызова status)
      expect(res.json).toHaveBeenCalledWith(null);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('возвращает 500 при ошибке БД', async () => {
      AppUser.findByPk.mockRejectedValue(new Error('Database error'));

      await userController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('updateProfile', () => {
    test('обновляет профиль пользователя', async () => {
      const userService = require('../../../src/modules/user/user.service');
      userService.updateProfile = jest.fn().mockResolvedValue({ message: 'Profile updated successfully' });

      req.body = { name: 'New Name', city: 'New City' };

      await userController.updateProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Profile updated successfully' });
    });

    test('возвращает 400 при ошибке', async () => {
      const userService = require('../../../src/modules/user/user.service');
      userService.updateProfile = jest.fn().mockRejectedValue(new Error('Validation failed'));

      req.body = { name: 'New Name' };

      await userController.updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Validation failed' });
    });
  });
});