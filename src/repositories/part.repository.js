class PartRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    const { rows } = await this.pool.query(
      `SELECT part_id, part_code, part_name, unit_price
       FROM part
       ORDER BY part_code ASC`,
    );
    return rows;
  }

  async findById(partId) {
    const { rows } = await this.pool.query(
      `SELECT part_id, part_code, part_name, unit_price
       FROM part
       WHERE part_id = $1`,
      [partId],
    );
    return rows[0] ?? null;
  }

  async create({ part_code, part_name, unit_price }) {
    const { rows } = await this.pool.query(
      `INSERT INTO part (part_code, part_name, unit_price)
       VALUES ($1, $2, $3)
       RETURNING part_id, part_code, part_name, unit_price`,
      [part_code, part_name, unit_price],
    );
    return rows[0];
  }

  async update(partId, { part_code, part_name, unit_price }) {
    const { rows } = await this.pool.query(
      `UPDATE part
       SET part_code = COALESCE($2, part_code),
           part_name = COALESCE($3, part_name),
           unit_price = COALESCE($4, unit_price)
       WHERE part_id = $1
       RETURNING part_id, part_code, part_name, unit_price`,
      [partId, part_code, part_name, unit_price],
    );
    return rows[0] ?? null;
  }

  async delete(partId) {
    const { rowCount } = await this.pool.query(
      "DELETE FROM part WHERE part_id = $1",
      [partId],
    );
    return rowCount === 1;
  }
}

module.exports = PartRepository;
