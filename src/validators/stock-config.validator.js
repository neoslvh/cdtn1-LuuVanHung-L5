const { AppError } = require("../errors/AppError");

function validatePositiveInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    return `${fieldName} phải là số nguyên lớn hơn 0.`;
  }
  return null;
}

function validateStockConfigPayload(payload, { partial = false } = {}) {
  const errors = {};
  const data = {};

  if (!partial || Object.hasOwn(payload, "part_id")) {
    const error = validatePositiveInteger(payload.part_id, "part_id");
    if (error) errors.part_id = error;
    else data.partId = Number(payload.part_id);
  }

  if (!partial || Object.hasOwn(payload, "min_threshold")) {
    const error = validatePositiveInteger(payload.min_threshold, "min_threshold");
    if (error) errors.min_threshold = error;
    else data.minThreshold = Number(payload.min_threshold);
  }

  if (partial && !Object.hasOwn(payload, "min_threshold")) {
    errors.min_threshold = "Cần cung cấp min_threshold để cập nhật.";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("INVALID_DATA", "Dữ liệu cấu hình tồn kho không hợp lệ.", errors);
  }

  return data;
}

module.exports = { validateStockConfigPayload };
