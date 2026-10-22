// Chỉ đọc ticket tham chiếu từ luồng bảo hành; L5 không quản lý vòng đời phiếu.
class TicketRepository {
  constructor(pool) { this.pool = pool; }

  async findById(centerId, ticketId) {
    const { rows } = await this.pool.query(
      `SELECT ticket_id, ticket_code, center_id FROM ticket WHERE ticket_id = $1 AND center_id = $2`,
      [ticketId, centerId],
    );
    return rows[0] ?? null;
  }

  async list(centerId) {
    const { rows } = await this.pool.query(
      `SELECT ticket_id, ticket_code FROM ticket WHERE center_id = $1 ORDER BY ticket_code`, [centerId],
    );
    return rows;
  }
}

module.exports = TicketRepository;
