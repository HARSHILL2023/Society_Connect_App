const ApiError = require('../utils/ApiError');

/**
 * Role-based authorization middleware
 * @param  {...string} roles - Permitted roles (Admin, Manager, Member)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
};

module.exports = { requireRole };
