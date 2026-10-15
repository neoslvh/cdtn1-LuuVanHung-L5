const { Pool } = require("pg");

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Thiếu DATABASE_URL. Hãy tạo file .env từ .env.example.");
  }

  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX || 10),
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 30000,
  });
}

module.exports = { createPool };
