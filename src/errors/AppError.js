// Lỗi nghiệp vụ có mã; routes sẽ dịch mã này thành HTTP response trong BT2.

class AppError extends Error {
  constructor(code, message, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

module.exports = { AppError };
