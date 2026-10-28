// Chỉ truy cập bảng ticket_part; không đặt quy tắc nghiệp vụ ở đây.
const { databaseQuery } = require("./database-query");
class TicketPartRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async addQuantity(client, ticketId, partId, quantity) {
    const { rows } = await databaseQuery(
      client,
      `INSERT INTO ticket_part (ticket_id, part_id, quantity_used) VALUES ($1, $2, $3)
       ON CONFLICT (ticket_id, part_id)
       DO UPDATE SET quantity_used = ticket_part.quantity_used + EXCLUDED.quantity_used
       RETURNING ticket_id, part_id, quantity_used`,
      [ticketId, partId, quantity],
    );
    return rows[0];
  }

  async listByTicket(ticketId) {
    const { rows } = await databaseQuery(
      this.pool,
      `SELECT tp.ticket_id, tp.part_id, p.part_code, p.part_name, tp.quantity_used
       FROM ticket_part tp JOIN part p ON p.part_id = tp.part_id
       WHERE tp.ticket_id = $1 ORDER BY p.part_code`,
      [ticketId],
    );
    return rows;
  }
}

module.exports = TicketPartRepository;
