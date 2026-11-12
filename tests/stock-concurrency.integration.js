const test = require("node:test");
const assert = require("node:assert/strict");
require("dotenv").config();

const { createPool } = require("../src/config/database");
const StockRepository = require("../src/repositories/stock.repository");
const TransactionRepository = require("../src/repositories/transaction.repository");
const TicketRepository = require("../src/repositories/ticket.repository");
const TicketPartRepository = require("../src/repositories/ticket-part.repository");
const StockTransactionService = require("../src/services/stock-transaction.service");

test("integration: hai yeu cau xuat dong thoi khong lam ton am", async () => {
  const pool = createPool();
  const suffix = `${process.pid}${Date.now()}`.slice(-12);
  const partCode = `CONC-${suffix}`;
  const ticketCodeA = `CONC-A-${suffix}`;
  const ticketCodeB = `CONC-B-${suffix}`;
  let partId;
  const ticketIds = [];

  try {
    const { rows: partRows } = await pool.query(
      `INSERT INTO part (part_code, part_name, unit_price)
       VALUES ($1, 'Linh kien kiem thu dong thoi', 1)
       RETURNING part_id`,
      [partCode],
    );
    partId = partRows[0].part_id;

    await pool.query(
      `INSERT INTO part_stock (center_id, part_id, quantity, min_threshold)
       VALUES (1, $1, 1, 1)`,
      [partId],
    );

    for (const ticketCode of [ticketCodeA, ticketCodeB]) {
      const { rows } = await pool.query(
        "INSERT INTO ticket (ticket_code, center_id) VALUES ($1, 1) RETURNING ticket_id",
        [ticketCode],
      );
      ticketIds.push(rows[0].ticket_id);
    }

    const service = new StockTransactionService(
      pool,
      new StockRepository(pool),
      new TransactionRepository(pool),
      new TicketRepository(pool),
      new TicketPartRepository(pool),
    );

    const results = await Promise.allSettled(
      ticketIds.map((ticketId) => service.issue(1, ticketId, { items: [{ partId, quantity: 1 }] })),
    );

    const successfulIssues = results.filter((result) => result.status === "fulfilled");
    const rejectedIssues = results.filter((result) => result.status === "rejected");
    assert.equal(successfulIssues.length, 1);
    assert.equal(rejectedIssues.length, 1);
    assert.equal(rejectedIssues[0].reason.code, "INSUFFICIENT_STOCK");

    const { rows: stockRows } = await pool.query(
      "SELECT quantity FROM part_stock WHERE center_id = 1 AND part_id = $1",
      [partId],
    );
    assert.equal(stockRows[0].quantity, 0);

    const { rows: transactionRows } = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM part_transaction
       WHERE center_id = 1 AND part_id = $1 AND transaction_type = 'OUT'`,
      [partId],
    );
    assert.equal(transactionRows[0].total, 1);
  } finally {
    if (partId) {
      await pool.query("DELETE FROM part_transaction WHERE part_id = $1", [partId]);
      await pool.query("DELETE FROM ticket_part WHERE part_id = $1", [partId]);
      await pool.query("DELETE FROM part_stock WHERE center_id = 1 AND part_id = $1", [partId]);
      await pool.query("DELETE FROM part WHERE part_id = $1", [partId]);
    }
    if (ticketIds.length > 0) {
      await pool.query("DELETE FROM ticket WHERE ticket_id = ANY($1::bigint[])", [ticketIds]);
    }
    await pool.end();
  }
});

test("integration: khong the xuat theo phieu cua trung tam khac", async () => {
  const pool = createPool();
  const suffix = `${process.pid}${Date.now()}`.slice(-12);
  const partCode = `SCOPE-${suffix}`;
  const ticketCode = `SCOPE-${suffix}`;
  let partId;
  let ticketId;

  try {
    const { rows: partRows } = await pool.query(
      `INSERT INTO part (part_code, part_name, unit_price)
       VALUES ($1, 'Linh kien kiem thu pham vi trung tam', 1)
       RETURNING part_id`,
      [partCode],
    );
    partId = partRows[0].part_id;

    await pool.query(
      `INSERT INTO part_stock (center_id, part_id, quantity, min_threshold)
       VALUES (2, $1, 1, 1)`,
      [partId],
    );

    const { rows: ticketRows } = await pool.query(
      "INSERT INTO ticket (ticket_code, center_id) VALUES ($1, 2) RETURNING ticket_id",
      [ticketCode],
    );
    ticketId = ticketRows[0].ticket_id;

    const service = new StockTransactionService(
      pool,
      new StockRepository(pool),
      new TransactionRepository(pool),
      new TicketRepository(pool),
      new TicketPartRepository(pool),
    );

    await assert.rejects(() => service.issue(1, ticketId, { items: [{ partId, quantity: 1 }] }), {
      code: "TICKET_NOT_FOUND",
    });

    const { rows: stockRows } = await pool.query(
      "SELECT quantity FROM part_stock WHERE center_id = 2 AND part_id = $1",
      [partId],
    );
    assert.equal(stockRows[0].quantity, 1);
  } finally {
    if (partId) {
      await pool.query("DELETE FROM part_transaction WHERE part_id = $1", [partId]);
      await pool.query("DELETE FROM ticket_part WHERE part_id = $1", [partId]);
      await pool.query("DELETE FROM part_stock WHERE center_id = 2 AND part_id = $1", [partId]);
      await pool.query("DELETE FROM part WHERE part_id = $1", [partId]);
    }
    if (ticketId) await pool.query("DELETE FROM ticket WHERE ticket_id = $1", [ticketId]);
    await pool.end();
  }
});
