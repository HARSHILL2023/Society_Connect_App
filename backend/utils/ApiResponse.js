class ApiResponse {
  static send(res, statusCode, success, message, data = null) {
    const payload = { success, message };
    if (data !== null) payload.data = data;
    return res.status(statusCode).json(payload);
  }

  static ok(res, message = 'Success', data = null) {
    return ApiResponse.send(res, 200, true, message, data);
  }

  static created(res, message = 'Resource created successfully', data = null) {
    return ApiResponse.send(res, 201, true, message, data);
  }
}

module.exports = ApiResponse;
