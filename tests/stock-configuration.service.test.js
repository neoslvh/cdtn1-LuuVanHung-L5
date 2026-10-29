const test = require("node:test");
const assert = require("node:assert/strict");
const StockConfigurationService = require("../src/services/stock-configuration.service");
const { validateStockConfigPayload } = require("../src/validators/stock-config.validator");

const stock = {
  center_id: 1,
  part_id: 7,
  part_code: "LK007",
  part_name: "Pin thay thế",
  quantity: 0,
  min_threshold: 3,
  status: "LOW_STOCK",
};

test("cấu hình tồn kho tạo mới với tồn ban đầu bằng 0", async () => {
  const created = [];
  const service = new StockConfigurationService(
    {
      create: async (centerId, partId, minThreshold) => {
        created.push({ centerId, partId, minThreshold });
        return stock;
      },
    },
    { findById: async () => ({ part_id: 7 }) },
  );

  const result = await service.createStock(1, { partId: 7, minThreshold: 3 });

  assert.deepEqual(created, [{ centerId: 1, partId: 7, minThreshold: 3 }]);
  assert.equal(result.quantity, 0);
  assert.equal(result.min_threshold, 3);
});

test("cấu hình tồn kho từ chối xóa khi vẫn còn tồn", async () => {
  const service = new StockConfigurationService(
    { find: async () => ({ ...stock, quantity: 1 }) },
    {},
  );

  await assert.rejects(() => service.deleteStock(1, 7), { code: "STOCK_NOT_EMPTY" });
});

test("cấu hình tồn kho chỉ xóa khi tồn bằng 0 và chưa có giao dịch", async () => {
  let deleted = false;
  const service = new StockConfigurationService(
    {
      find: async () => stock,
      hasTransactions: async () => false,
      delete: async () => {
        deleted = true;
        return true;
      },
    },
    {},
  );

  await service.deleteStock(1, 7);

  assert.equal(deleted, true);
});

test("cấu hình tồn kho từ chối ngưỡng bằng 0", () => {
  assert.throws(() => validateStockConfigPayload({ part_id: 7, min_threshold: 0 }), {
    code: "INVALID_DATA",
  });
});
