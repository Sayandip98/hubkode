class ApiResponse {
  constructor(statusCode, data, message = "Success", pagination = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (pagination) {
      this.pagination = pagination;
    }
  }
}

class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.success = false;
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiResponse, ApiError };