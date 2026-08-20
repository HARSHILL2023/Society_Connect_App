class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Authentication required.') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Access denied.') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found.') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource already exists.') {
    return new ApiError(409, msg);
  }

  static internal(msg = 'Internal server error.') {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;
