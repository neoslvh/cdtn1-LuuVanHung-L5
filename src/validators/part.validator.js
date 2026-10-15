const { AppError } = require("../errors/AppError");

const allowedFields = ["part_code", "part_name", "unit_price"];

function validatePartPayload(payload, { partial = false } = {}) {
  const data = {};
  const errors = {};
  const suppliedFields = Object.keys(payload).filter((key) => allowedFields.includes(key));

  if (partial && suppliedFields.length === 0) {
    throw new AppError("INVALID_DATA", "Cần ít nhất một trường được phép cập nhật.");
  }

  if (!partial || Object.hasOwn(payload, "part_code")) {
    if (typeof payload.part_code !== "string" || !payload.part_code.trim() || payload.part_code.trim().length > 30) {
      errors.part_code = "part_code là chuỗi bắt buộc, dài từ 1 đến 30 ký tự.";
    } else data.part_code = payload.part_code.trim();
  }

  if (!partial || Object.hasOwn(payload, "part_name")) {
    if (typeof payload.part_name !== "string" || !payload.part_name.trim() || payload.part_name.trim().length > 120) {
      errors.part_name = "part_name là chuỗi bắt buộc, dài từ 1 đến 120 ký tự.";
    } else data.part_name = payload.part_name.trim();
  }

  if (!partial || Object.hasOwn(payload, "unit_price")) {
    const price = Number(payload.unit_price);
    if (!Number.isFinite(price) || price < 0) errors.unit_price = "unit_price phải là số không âm.";
    else data.unit_price = price;
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("INVALID_DATA", "Dữ liệu linh kiện không hợp lệ.", errors);
  }
  return data;
}

module.exports = { validatePartPayload };
