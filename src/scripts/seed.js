const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { createPool } = require("../config/database");
const pool = createPool();

async function main() {
  const seedPath = path.resolve(__dirname, "../../seeds/001_seed_l5_demo.sql");
  await pool.query(await fs.readFile(seedPath, "utf8"));
  console.log("Đã nạp dữ liệu mẫu L5.");
}

main()
  .catch((error) => { console.error("Seed thất bại:", error.message); process.exitCode = 1; })
  .finally(() => pool.end());
