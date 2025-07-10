import ratelimit from '../config/upstash.js';

const rateLimiter = async (req, res, next) => {
  try {
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const result = await ratelimit.limit(ip);

    if (!result.success) {
      return res.status(429).json({
        status: false,
        code: 429,
        message: 'Too many requests, please try again later.',
      });
    }

    next();
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ message: 'Internal server error' });
    next(error);
  }
};

export default rateLimiter;
