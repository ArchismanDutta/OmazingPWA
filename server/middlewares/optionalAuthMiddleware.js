const jwt = require('jsonwebtoken');

/**
 * Optional authentication middleware
 * Populates req.user if a valid token is present, but doesn't block the request if no token
 */
const optionalAuthMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return next();
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request
      req.user = {
        id: decoded.id || decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (tokenError) {
      // Token is invalid, but we don't block the request
      console.log('Invalid token in optional auth, continuing without user');
    }

    next();
  } catch (error) {
    // Any other error, continue without user
    console.error('Error in optional auth middleware:', error);
    next();
  }
};

module.exports = optionalAuthMiddleware;
