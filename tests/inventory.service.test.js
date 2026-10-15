const test = require("node:test");
const assert = require("node:assert/strict");
const InventoryService = require("../src/services/inventory.service");

test("InventoryService tạo linh kiện qua repository", async () => {
  const expected = { part_id: 1, part_code: "L5PART001", part_name: "Pin A52", unit_price: 250000 };
  const repository = { create: async (data) => ({ part_id: 1, ...data }) };
  const service = new InventoryService(repository);

  const result = await service.createPart({ part_code: "L5PART001", part_name: "Pin A52", unit_price: 250000 });
  assert.deepEqual(result, expected);
});

test("InventoryService báo lỗi khi không tìm thấy linh kiện", async () => {
  const service = new InventoryService({ findById: async () => null });
  await assert.rejects(() => service.getPart(999), { code: "PART_NOT_FOUND" });
});
