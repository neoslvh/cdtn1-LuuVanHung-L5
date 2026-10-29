const test = require("node:test");
const assert = require("node:assert/strict");
const { validateStockSort } = require("../src/validators/stock-sort.validator");

test("sắp xếp tồn kho dùng mặc định mã linh kiện tăng dần", () => {
  assert.deepEqual(validateStockSort({}), {
    sortBy: "part_code",
    sortDirection: "asc",
  });
});

test("sắp xếp tồn kho nhận cột và chiều hợp lệ", () => {
  assert.deepEqual(
    validateStockSort({ sort_by: "quantity", sort_direction: "DESC" }),
    { sortBy: "quantity", sortDirection: "desc" },
  );
});

test("sắp xếp tồn kho từ chối cột hoặc chiều không hợp lệ", () => {
  assert.throws(
    () => validateStockSort({ sort_by: "created_at", sort_direction: "sideways" }),
    (error) =>
      Boolean(error.code === "VALIDATION_FAILED" && error.details.sort_by && error.details.sort_direction),
  );
});
