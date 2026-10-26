// Chỉ truy cập bảng part_transaction; không đặt quy tắc nghiệp vụ ở đây.
const { databaseQuery } = require("./database-query");
class TransactionRepository {
  constructor(pool) { this.pool = pool; }

  async create(client, { centerId, partId, ticketId = null, transactionType, quantity }) {
    const { rows } = await databaseQuery(client,
      `INSERT INTO part_transaction (center_id, part_id, ticket_id, transaction_type, quantity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING transaction_id, center_id, part_id, ticket_id, transaction_type, quantity, created_at`,
      [centerId, partId, ticketId, transactionType, quantity],
    );
    return rows[0];
  }

  async listByPart(centerId, partId) {
    const { rows } = await databaseQuery(this.pool,
      `SELECT transaction_id, transaction_type, quantity, ticket_id, created_at FROM part_transaction
       WHERE center_id = $1 AND part_id = $2 ORDER BY created_at DESC`, [centerId, partId],
    );
    return rows;
  }
}

module.exports = TransactionRepository;
