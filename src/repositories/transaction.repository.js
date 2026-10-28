// Chỉ truy cập bảng part_transaction; không đặt quy tắc nghiệp vụ ở đây.
const { databaseQuery } = require("./database-query");
class TransactionRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async create(client, { centerId, partId, ticketId = null, transactionType, quantity }) {
    const { rows } = await databaseQuery(
      client,
      `INSERT INTO part_transaction (center_id, part_id, ticket_id, transaction_type, quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING transaction_id, center_id, part_id, ticket_id, transaction_type, quantity, created_at`,
      [centerId, partId, ticketId, transactionType, quantity],
    );
    return rows[0];
  }

  async listByPart(centerId, partId, { page = 1, size = 10 } = {}) {
    const offset = (page - 1) * size;
    const { rows } = await databaseQuery(
      this.pool,
      `SELECT pt.transaction_id, pt.transaction_type, pt.quantity, pt.ticket_id, pt.created_at,
              t.ticket_code, COUNT(*) OVER() AS total
       FROM part_transaction pt
       LEFT JOIN ticket t ON t.ticket_id = pt.ticket_id
       WHERE pt.center_id = $1 AND pt.part_id = $2
       ORDER BY pt.created_at DESC, pt.transaction_id DESC
       LIMIT $3 OFFSET $4`,
      [centerId, partId, size, offset],
    );
    return {
      rows: rows.map(({ total, ...row }) => row),
      total: Number(rows[0]?.total ?? 0),
    };
  }
}

module.exports = TransactionRepository;
