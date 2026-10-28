const { AppError } = require("../errors/AppError");

function validateStockReceipt(payload = {}) {
  const fields = {};
  const partId = Number(payload.part_id);
  const quantity = Number(payload.quantity);
  if (!Number.isSafeInteger(partId) || partId <= 0)
    fields.part_id = "Linh kiện là thông tin bắt buộc.";
  if (!Number.isSafeInteger(quantity) || quantity <= 0)
    fields.quantity = "Số lượng nhập phải là số nguyên lớn hơn 0.";
  if (Object.keys(fields).length)
    throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", fields);
  return { partId, quantity };
}

module.exports = { validateStockReceipt };
