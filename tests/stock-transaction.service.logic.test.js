const test = require("node:test");
const assert = require("node:assert/strict");
const StockTransactionService = require("../src/services/stock-transaction.service");

function makeClient(queries) {
  return {
    async query(sql) { queries.push(sql); },
    release() {},
  };
}

test("nhập kho tăng tồn và ghi giao dịch IN trong cùng transaction", async () => {
  const queries = [];
  const stockRepository = {
    findForUpdate: async () => ({ quantity: 5, min_threshold: 3 }),
    updateQuantity: async () => {},
  };
  const transactionRepository = {
    create: async (_, data) => ({ transaction_id: 10, ...data }),
  };
  const service = new StockTransactionService(
    { connect: async () => makeClient(queries) }, stockRepository, transactionRepository, {}, {},
  );

  const result = await service.receive(1, { partId: 2, quantity: 4 });

  assert.equal(result.stock_before, 5);
  assert.equal(result.stock_after, 9);
  assert.equal(result.transactionType, "IN");
  assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
});

test("xuất đúng bằng tồn được chấp nhận và tạo cảnh báo khi tồn sau xuất thấp", async () => {
  const queries = [];
  const stockRepository = {
    findForUpdate: async () => ({ quantity: 2, min_threshold: 1, part_code: "L5PART001" }),
    updateQuantity: async () => {},
  };
  const ticketRepository = { findById: async () => ({ ticket_id: 7, ticket_code: "BH-2026-00125" }) };
  const ticketPartRepository = { addQuantity: async () => {} };
  const transactionRepository = { create: async () => ({ transaction_id: 11 }) };
  const service = new StockTransactionService(
    { connect: async () => makeClient(queries) }, stockRepository, transactionRepository, ticketRepository, ticketPartRepository,
  );

  const result = await service.issue(1, 7, { items: [{ partId: 1, quantity: 2 }] });

  assert.equal(result.issues[0].stock_after, 0);
  assert.equal(result.low_stock_alerts.length, 1);
  assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
});

test("xuất vượt tồn bị từ chối và rollback toàn bộ giao dịch", async () => {
  const queries = [];
  const stockRepository = { findForUpdate: async () => ({ quantity: 1, min_threshold: 0, part_code: "L5PART001" }) };
  const ticketRepository = { findById: async () => ({ ticket_id: 7, ticket_code: "BH-2026-00125" }) };
  const service = new StockTransactionService(
    { connect: async () => makeClient(queries) }, stockRepository, {}, ticketRepository, {},
  );

  await assert.rejects(
    () => service.issue(1, 7, { items: [{ partId: 1, quantity: 2 }] }),
    { code: "INSUFFICIENT_STOCK" },
  );
  assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
});

test("xuất nhiều linh kiện rollback tất cả khi chỉ một dòng không đủ tồn", async () => {
  const queries = [];
  const updatedParts = [];
  const stockRepository = {
    findForUpdate: async (_, __, partId) => (partId === 1
      ? { quantity: 5, min_threshold: 2, part_code: "L5PART001" }
      : { quantity: 1, min_threshold: 2, part_code: "L5PART002" }),
    updateQuantity: async (_, __, partId) => { updatedParts.push(partId); },
  };
  const ticketRepository = { findById: async () => ({ ticket_id: 7, ticket_code: "BH-2026-00125" }) };
  const service = new StockTransactionService(
    { connect: async () => makeClient(queries) }, stockRepository, {}, ticketRepository, {},
  );

  await assert.rejects(
    () => service.issue(1, 7, { items: [{ partId: 1, quantity: 2 }, { partId: 2, quantity: 2 }] }),
    { code: "INSUFFICIENT_STOCK" },
  );
  assert.deepEqual(updatedParts, []);
  assert.deepEqual(queries, ["BEGIN", "ROLLBACK"]);
});

test("xuất làm tồn bằng ngưỡng thì không phát cảnh báo", async () => {
  const queries = [];
  const stockRepository = {
    findForUpdate: async () => ({ quantity: 4, min_threshold: 3, part_code: "L5PART001" }),
    updateQuantity: async () => {},
  };
  const ticketRepository = { findById: async () => ({ ticket_id: 7, ticket_code: "BH-2026-00125" }) };
  const ticketPartRepository = { addQuantity: async () => {} };
  const transactionRepository = { create: async () => ({ transaction_id: 12 }) };
  const service = new StockTransactionService(
    { connect: async () => makeClient(queries) }, stockRepository, transactionRepository, ticketRepository, ticketPartRepository,
  );

  const result = await service.issue(1, 7, { items: [{ partId: 1, quantity: 1 }] });

  assert.equal(result.issues[0].stock_after, 3);
  assert.deepEqual(result.low_stock_alerts, []);
  assert.deepEqual(queries, ["BEGIN", "COMMIT"]);
});

test("xuất bị từ chối khi phiếu không thuộc trung tâm", async () => {
  const queries = [];
  const service = new StockTransactionService(
    { connect: async () => makeClient(queries) }, {}, {}, { findById: async () => null }, {},
  );

  await assert.rejects(() => service.issue(1, 99, { items: [{ partId: 1, quantity: 1 }] }), { code: "TICKET_NOT_FOUND" });
  assert.deepEqual(queries, []);
});
