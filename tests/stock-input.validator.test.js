const test = require("node:test");
const assert = require("node:assert/strict");
const { validateStockReceipt } = require("../src/validators/stock-receipt.validator");
const { validatePartIssue } = require("../src/validators/part-issue.validator");

test("nhập kho chấp nhận số nguyên dương", () => {
  assert.deepEqual(validateStockReceipt({ part_id: "1", quantity: "2" }), {
    partId: 1,
    quantity: 2,
  });
});

test("nhập kho từ chối số lượng bằng không", () => {
  assert.throws(() => validateStockReceipt({ part_id: 1, quantity: 0 }), {
    code: "VALIDATION_FAILED",
  });
});

test("nhập kho từ chối khi chưa chọn linh kiện", () => {
  assert.throws(
    () => validateStockReceipt({ quantity: 1 }),
    (error) =>
      error.code === "VALIDATION_FAILED" &&
      error.details.part_id === "Linh kiện là thông tin bắt buộc.",
  );
});

test("xuất kho từ chối linh kiện trùng trong một giao dịch", () => {
  assert.throws(
    () =>
      validatePartIssue({
        items: [
          { part_id: 1, quantity: 1 },
          { part_id: 1, quantity: 2 },
        ],
      }),
    { code: "VALIDATION_FAILED" },
  );
});
