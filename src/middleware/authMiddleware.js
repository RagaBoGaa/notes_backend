import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // If not in cookies, check if token exists in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({
        status: false,
        code: 401,
        message: 'Not authorized, token failed',
      });
    }
  } else {
    res.status(401).json({
      status: false,
      code: 401,
      message: 'Not authorized, no token',
    });
  }
};

export { protect };
