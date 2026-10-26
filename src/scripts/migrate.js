const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { createPool } = require("../config/database");
const { logger } = require("../logger");
const pool = createPool();

async function main() {
  const migrationsDir = path.resolve(__dirname, "../../migrations");
  const migrationFiles = (await fs.readdir(migrationsDir))
    .filter((fileName) => fileName.endsWith(".sql"))
    .sort();

  for (const fileName of migrationFiles) {
    await pool.query(await fs.readFile(path.join(migrationsDir, fileName), "utf8"));
    logger.info("migration_completed", { file_name: fileName });
  }
}

main()
  .catch((error) => { logger.error("migration_failed", { error }); process.exitCode = 1; })
  .finally(() => pool.end());
