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
    });

    test('возвращает 404 если пользователь не найден', async () => {
      AppUser.findByPk.mockResolvedValue(null);

      await userController.getMe(req, res);

      // Реальный контроллер при user = null возвращает 404
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    test('возвращает 500 при ошибке БД', async () => {
      AppUser.findByPk.mockRejectedValue(new Error('Database error'));

      await userController.getMe(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });
});