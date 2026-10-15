const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePartPayload } = require("../src/validators/part.validator");

test("validator từ chối giá linh kiện âm", () => {
  assert.throws(
    () => validatePartPayload({ part_code: "L5PART001", part_name: "Pin A52", unit_price: -1 }),
    { code: "INVALID_DATA" },
  );
});

test("validator chấp nhận dữ liệu linh kiện hợp lệ", () => {
  const data = validatePartPayload({ part_code: " L5PART001 ", part_name: " Pin A52 ", unit_price: "250000" });
  assert.deepEqual(data, { part_code: "L5PART001", part_name: "Pin A52", unit_price: 250000 });
});
