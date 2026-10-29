const { AppError } = require("../errors/AppError");

const SORTABLE_COLUMNS = new Set([
  "part_code",
  "part_name",
  "quantity",
  "min_threshold",
  "status",
]);

function validateStockSort(query = {}) {
  const sortBy = query.sort_by || "part_code";
  const sortDirection = String(query.sort_direction || "asc").toLowerCase();
  const fields = {};

  if (!SORTABLE_COLUMNS.has(sortBy)) {
    fields.sort_by = "sort_by không hợp lệ.";
  }
  if (sortDirection !== "asc" && sortDirection !== "desc") {
    fields.sort_direction = "sort_direction chỉ nhận asc hoặc desc.";
  }
  if (Object.keys(fields).length > 0) {
    throw new AppError("VALIDATION_FAILED", "Dữ liệu không hợp lệ.", fields);
  }

  return { sortBy, sortDirection };
}

module.exports = { validateStockSort };
