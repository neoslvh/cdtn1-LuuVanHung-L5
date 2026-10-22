const test = require("node:test");
const assert = require("node:assert/strict");
const { toStockView } = require("../src/contracts/stock.contract");

test("hợp đồng tồn kho trả đúng trường UI đã cam kết", () => {
  const view = toStockView({ center_id: 1, part_id: 2, part_code: "L5PART002", part_name: "Màn hình A52", quantity: 2, min_threshold: 5, status: "LOW_STOCK", ignored: true });
  assert.deepEqual(Object.keys(view).sort(), ["center_id", "min_threshold", "part_code", "part_id", "part_name", "quantity", "status"]);
  assert.equal(view.status, "LOW_STOCK");
});
