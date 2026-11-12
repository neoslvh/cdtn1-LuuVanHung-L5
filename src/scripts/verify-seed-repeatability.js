const { execFile } = require("child_process");
const path = require("path");
const { promisify } = require("util");
require("dotenv").config();

const { createPool } = require("../config/database");
const { logger } = require("../logger");

const execFileAsync = promisify(execFile);
const rootDirectory = path.resolve(__dirname, "../..");
const trackedTables = ["part", "part_stock", "ticket", "ticket_part", "part_transaction"];

async function getCounts(pool) {
  const queries = trackedTables.map((table) => `SELECT '${table}' AS table_name, COUNT(*)::int AS count FROM ${table}`);
  const { rows } = await pool.query(queries.join(" UNION ALL "));
  return Object.fromEntries(rows.map((row) => [row.table_name, Number(row.count)]));
}

async function runSeedIfEmpty() {
  await execFileAsync(process.execPath, ["src/scripts/seed-dataset.js", "--if-empty"], {
    cwd: rootDirectory,
  });
}

async function main() {
  const pool = createPool();
  try {
    const before = await getCounts(pool);
    await runSeedIfEmpty();
    const afterFirstRun = await getCounts(pool);
    await runSeedIfEmpty();
    const afterSecondRun = await getCounts(pool);

    if (JSON.stringify(afterFirstRun) !== JSON.stringify(afterSecondRun)) {
      throw new Error("Seed chạy lần hai đã làm thay đổi số lượng bản ghi.");
    }

    logger.info("dataset_seed_repeatability_verified", {
      counts_before: before,
      counts_after_first_run: afterFirstRun,
      counts_after_second_run: afterSecondRun,
    });
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  logger.error("dataset_seed_repeatability_failed", { error });
  process.exitCode = 1;
});
