const { AppError } = require("../errors/AppError");

function validatePartIssue(payload = {}) {
  const fields = {};
  if (!Array.isArray(payload.items) || payload.items.length === 0)
    fields.items = "Phải chọn ít nhất một linh kiện để xuất.";
  const seen = new Set();
  const items = (payload.items || []).map((item, index) => {
    const partId = Number(item?.part_id);
    const quantity = Number(item?.quantity);
    if (!Number.isSafeInteger(partId) || partId <= 0 || seen.has(partId))
      fields[`items[${index}].part_id`] = "Linh kiện không hợp lệ hoặc bị lặp.";
    seen.add(partId);
    if (!Number.isSafeInteger(quantity) || quantity <= 0)
      fields[`items[${index}].quantity`] = "Số lượng xuất phải là số nguyên lớn hơn 0.";
    return { partId, quantity };
  });
  if (Object.keys(fields).length)
    throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", fields);
  return { items };
}

module.exports = { validatePartIssue };
