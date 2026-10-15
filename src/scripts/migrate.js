const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { createPool } = require("../config/database");
const pool = createPool();

async function main() {
  const migrationPath = path.resolve(__dirname, "../../migrations/001_create_l5_schema.sql");
  await pool.query(await fs.readFile(migrationPath, "utf8"));
  console.log("Đã chạy migration 001_create_l5_schema.sql");
}

main()
  .catch((error) => { console.error("Migration thất bại:", error.message); process.exitCode = 1; })
  .finally(() => pool.end());
