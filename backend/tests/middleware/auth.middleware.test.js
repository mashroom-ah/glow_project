const authMiddleware = require('../../src/middlewares/auth.middleware');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  test('пропускает запрос с валидным токеном', () => {
    req.headers.authorization = 'Bearer valid-token';
    jwt.verify.mockReturnValue({ user_id: '123' });

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_ACCESS_SECRET);
    expect(req.user).toEqual({ user_id: '123' });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('возвращает 401 при отсутствии заголовка Authorization', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  test('возвращает 401 при отсутствии токена', () => {
    req.headers.authorization = 'Bearer ';
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });

  test('возвращает 401 при невалидном токене', () => {
    req.headers.authorization = 'Bearer invalid-token';
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });
});