const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePagination } = require("../src/validators/pagination.validator");

test("phân trang dùng mặc định page 1 va size 10", () => {
  assert.deepEqual(validatePagination({}), { page: 1, size: 10 });
});

test("phân trang chấp nhận page va size hợp lệ", () => {
  assert.deepEqual(validatePagination({ page: "2", size: "50" }), { page: 2, size: 50 });
});

test("phân trang từ chối page hoặc size không hợp lệ", () => {
  assert.throws(
    () => validatePagination({ page: "0", size: "101" }),
    (error) =>
      Boolean(error.code === "VALIDATION_FAILED" && error.details.page && error.details.size),
  );
});
