// Chỉ truy cập bảng part_stock; không đặt quy tắc nghiệp vụ ở đây.
const { databaseQuery } = require("./database-query");
class StockRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async list(centerId, { lowOnly = false, keyword = "", page = 1, size = 10 } = {}) {
    const offset = (page - 1) * size;
    const { rows } = await databaseQuery(
      this.pool,
      `SELECT ps.center_id, ps.part_id, p.part_code, p.part_name, ps.quantity, ps.min_threshold,
              CASE WHEN ps.quantity < ps.min_threshold THEN 'LOW_STOCK' ELSE 'NORMAL' END AS status,
              COUNT(*) OVER() AS total
       FROM part_stock ps JOIN part p ON p.part_id = ps.part_id
       WHERE ps.center_id = $1
         AND ($2::boolean = FALSE OR ps.quantity < ps.min_threshold)
         AND ($3 = '' OR p.part_code ILIKE '%' || $3 || '%' OR p.part_name ILIKE '%' || $3 || '%')
       ORDER BY p.part_code
       LIMIT $4 OFFSET $5`,
      [centerId, lowOnly, keyword, size, offset],
    );
    return {
      rows: rows.map(({ total, ...row }) => row),
      total: Number(rows[0]?.total ?? 0),
    };
  }

  async findForUpdate(client, centerId, partId) {
    const { rows } = await databaseQuery(
      client,
      `SELECT ps.center_id, ps.part_id, ps.quantity, ps.min_threshold, p.part_code, p.part_name
       FROM part_stock ps JOIN part p ON p.part_id = ps.part_id
       WHERE ps.center_id = $1 AND ps.part_id = $2 FOR UPDATE`,
      [centerId, partId],
    );
    return rows[0] ?? null;
  }

  async find(centerId, partId) {
    const { rows } = await databaseQuery(
      this.pool,
      `SELECT ps.center_id, ps.part_id, ps.quantity, ps.min_threshold, p.part_code, p.part_name,
              CASE WHEN ps.quantity < ps.min_threshold THEN 'LOW_STOCK' ELSE 'NORMAL' END AS status
       FROM part_stock ps JOIN part p ON p.part_id = ps.part_id
       WHERE ps.center_id = $1 AND ps.part_id = $2`,
      [centerId, partId],
    );
    return rows[0] ?? null;
  }

  async updateQuantity(client, centerId, partId, quantity) {
    const { rows } = await databaseQuery(
      client,
      `UPDATE part_stock SET quantity = $3 WHERE center_id = $1 AND part_id = $2
       RETURNING center_id, part_id, quantity, min_threshold`,
      [centerId, partId, quantity],
    );
    return rows[0];
  }
}

module.exports = StockRepository;
