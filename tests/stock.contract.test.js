const test = require("node:test");
const assert = require("node:assert/strict");
const { toStockView } = require("../src/contracts/stock.contract");
const { maskSensitive } = require("../src/logger");
const { toDataAccessError } = require("../src/repositories/database-query");

test("hợp đồng tồn kho trả đúng trường UI đã cam kết", () => {
  const view = toStockView({ center_id: 1, part_id: 2, part_code: "L5PART002", part_name: "Màn hình A52", quantity: 2, min_threshold: 5, status: "LOW_STOCK", ignored: true });
  assert.deepEqual(Object.keys(view).sort(), ["center_id", "min_threshold", "part_code", "part_id", "part_name", "quantity", "status"]);
  assert.equal(view.status, "LOW_STOCK");
});

test("logger che du lieu nhay cam", () => {
  assert.deepEqual(
    maskSensitive({ password: "secret", access_token: "abc", so_dien_thoai: "0900000000", part_id: 1 }),
    { password: "***", access_token: "***", so_dien_thoai: "***", part_id: 1 },
  );
});

test("logger che chuoi ket noi trong stack loi", () => {
  const error = new Error("Không kết nối được postgresql://app:password@localhost:5432/mekong");
  const masked = maskSensitive({ error });
  assert.doesNotMatch(masked.error.message, /password/);
  assert.doesNotMatch(masked.error.stack, /password/);
});

test("repository dich loi khoa duy nhat thanh DataAccessError", () => {
  const error = toDataAccessError({ code: "23505", message: "duplicate key" });
  assert.equal(error.name, "DataAccessError");
  assert.equal(error.code, "DATA_ALREADY_EXISTS");
  assert.equal(error.httpStatus, 409);
});
