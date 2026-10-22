// Chỉ truy cập bảng part_stock; không đặt quy tắc nghiệp vụ ở đây.
class StockRepository {
  constructor(pool) { this.pool = pool; }

  async list(centerId, { lowOnly = false } = {}) {
    const { rows } = await this.pool.query(
      `SELECT ps.center_id, ps.part_id, p.part_code, p.part_name, ps.quantity, ps.min_threshold,
              CASE WHEN ps.quantity < ps.min_threshold THEN 'LOW_STOCK' ELSE 'NORMAL' END AS status
       FROM part_stock ps JOIN part p ON p.part_id = ps.part_id
       WHERE ps.center_id = $1 AND ($2::boolean = FALSE OR ps.quantity < ps.min_threshold)
       ORDER BY p.part_code`, [centerId, lowOnly],
    );
    return rows;
  }

  async findForUpdate(client, centerId, partId) {
    const { rows } = await client.query(
      `SELECT ps.center_id, ps.part_id, ps.quantity, ps.min_threshold, p.part_code, p.part_name
       FROM part_stock ps JOIN part p ON p.part_id = ps.part_id
       WHERE ps.center_id = $1 AND ps.part_id = $2 FOR UPDATE`, [centerId, partId],
    );
    return rows[0] ?? null;
  }

  async updateQuantity(client, centerId, partId, quantity) {
    const { rows } = await client.query(
      `UPDATE part_stock SET quantity = $3 WHERE center_id = $1 AND part_id = $2
       RETURNING center_id, part_id, quantity, min_threshold`, [centerId, partId, quantity],
    );
    return rows[0];
  }
}

module.exports = StockRepository;
