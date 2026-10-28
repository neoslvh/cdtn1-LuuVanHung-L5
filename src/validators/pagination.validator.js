const { AppError } = require("../errors/AppError");

// Quy ước phân trang chung cho danh sách tồn kho và cảnh báo tồn thấp.
function validatePagination(query = {}) {
  const fields = {};
  const page = query.page === undefined ? 1 : Number(query.page);
  const size = query.size === undefined ? 10 : Number(query.size);

  if (!Number.isSafeInteger(page) || page < 1) {
    fields.page = "page phải là số nguyên lớn hơn hoặc bằng 1.";
  }
  if (!Number.isSafeInteger(size) || size < 1 || size > 100) {
    fields.size = "size phải nằm trong khoảng từ 1 đến 100.";
  }
  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", fields);
  }
  return { page, size };
}

module.exports = { validatePagination };
