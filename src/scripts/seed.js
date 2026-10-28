const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { createPool } = require("../config/database");
const { logger } = require("../logger");
const pool = createPool();

async function main() {
  const seedPath = path.resolve(__dirname, "../../seeds/001_seed_l5_demo.sql");
  await pool.query(await fs.readFile(seedPath, "utf8"));
  logger.info("demo_seed_completed");
}

main()
  .catch((error) => {
    logger.error("demo_seed_failed", { error });
    process.exitCode = 1;
  })
  .finally(() => pool.end());
