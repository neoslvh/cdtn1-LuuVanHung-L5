const { Pool } = require("pg");

function createPool() {
  const connectionString = process.env.DATABASE_URL || buildConnectionString();
  if (!connectionString) {
    throw new Error("Thiếu cấu hình CSDL. Hãy tạo file .env từ .env.example.");
  }

  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX || 10),
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
  });
}

function buildConnectionString() {
  const { DB_NAME, DB_USER, DB_PASSWORD, DB_PORT = "5432" } = process.env;
  if (!DB_NAME || !DB_USER || !DB_PASSWORD) return null;
  return `postgresql://${encodeURIComponent(DB_USER)}:${encodeURIComponent(DB_PASSWORD)}@localhost:${DB_PORT}/${encodeURIComponent(DB_NAME)}`;
}

module.exports = { createPool, buildConnectionString };
