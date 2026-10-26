const fs = require("fs/promises");
const path = require("path");
require("dotenv").config();
const { createPool } = require("../config/database");
const { logger } = require("../logger");

const rootDir = path.resolve(__dirname, "../..");
let datasetDir;

async function resolveDatasetDir() {
  const sampleDir = path.resolve(rootDir, "data/sample");
  try {
    await fs.access(path.join(sampleDir, "parts.csv"));
    return sampleDir;
  } catch {
    throw new Error("Không tìm thấy dữ liệu mẫu tại data/sample/.");
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
      else if (character === '"') quoted = false;
      else field += character;
    } else if (character === '"') quoted = true;
    else if (character === ",") { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field.replace(/\r$/, "")); rows.push(row); row = []; field = ""; }
    else field += character;
  }
  if (field || row.length) { row.push(field.replace(/\r$/, "")); rows.push(row); }

  const [header = [], ...records] = rows;
  return records
    .filter((record) => record.some((value) => value !== ""))
    .map((record) => Object.fromEntries(header.map((name, index) => [name.replace(/^\uFEFF/, ""), record[index] ?? ""])));
}

async function readCsv(fileName) {
  return parseCsv(await fs.readFile(path.join(datasetDir, fileName), "utf8"));
}

function asPositiveInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) throw new Error(`${fieldName} không hợp lệ: ${value}`);
  return number;
}

function asNonNegativeInteger(value, fieldName) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new Error(`${fieldName} không hợp lệ: ${value}`);
  return number;
}

async function insertRows(client, table, columns, rows) {
  const batchSize = 250;
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize);
    const values = batch.flat();
    const placeholders = batch.map((row, rowIndex) => `(${row.map((_, columnIndex) => `$${rowIndex * columns.length + columnIndex + 1}`).join(", ")})`).join(", ");
    await client.query(`INSERT INTO ${table} (${columns.join(", ")}) VALUES ${placeholders}`, values);
  }
}

async function main() {
  const reset = process.argv.includes("--reset");
  const validateOnly = process.argv.includes("--validate");
  if (!reset && !validateOnly) {
    throw new Error("Chạy kiểm tra: npm run db:seed:dataset -- --validate; hoặc nạp dữ liệu: npm run db:seed:dataset -- --reset");
  }
  datasetDir = await resolveDatasetDir();

  const [centers, parts, stocks, tickets, transactions] = await Promise.all([
    readCsv("service_centers.csv"), readCsv("parts.csv"), readCsv("part_stock.csv"),
    readCsv("tickets_history.csv"), readCsv("part_transactions.csv"),
  ]);
  const centerIds = new Set(centers.map((row) => asPositiveInteger(row.center_id, "service_centers.center_id")));
  const partIds = new Set(parts.map((row) => asPositiveInteger(row.part_id, "parts.part_id")));
  const stockKeys = new Set(stocks.map((row) => `${row.center_id}:${row.part_id}`));
  const ticketByCode = new Map(tickets.map((row) => [row.ticket_code, asPositiveInteger(row.ticket_id, "tickets_history.ticket_id")]));

  for (const row of stocks) {
    if (!centerIds.has(asPositiveInteger(row.center_id, "part_stock.center_id")) || !partIds.has(asPositiveInteger(row.part_id, "part_stock.part_id"))) {
      throw new Error("part_stock chứa center_id hoặc part_id không có trong dataset.");
    }
  }
  for (const row of transactions) {
    const centerId = asPositiveInteger(row.center_id, "part_transactions.center_id");
    const partId = asPositiveInteger(row.part_id, "part_transactions.part_id");
    if (!centerIds.has(centerId) || !partIds.has(partId) || !stockKeys.has(`${centerId}:${partId}`)) {
      throw new Error("part_transactions có tham chiếu kho không hợp lệ.");
    }
    if (!['NHAP', 'XUAT'].includes(row.loai)) throw new Error(`Loại giao dịch không hợp lệ: ${row.loai}`);
    if (row.loai === 'XUAT' && !ticketByCode.has(row.ticket_code)) throw new Error(`Không tìm thấy phiếu: ${row.ticket_code}`);
  }

  const ticketParts = new Map();
  for (const row of transactions.filter((item) => item.loai === "XUAT")) {
    const key = `${row.ticket_code}:${row.part_id}`;
    ticketParts.set(key, (ticketParts.get(key) || 0) + asPositiveInteger(row.so_luong, "part_transactions.so_luong"));
  }

  if (validateOnly) {
    logger.info("dataset_validated", { dataset_dir: datasetDir, part_count: parts.length, stock_count: stocks.length, ticket_count: tickets.length, transaction_count: transactions.length });
    return;
  }

  const pool = createPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE part_transaction, ticket_part, ticket, part_stock, part RESTART IDENTITY CASCADE");

    await insertRows(client, "part", ["part_id", "part_code", "part_name", "unit_price"], parts.map((row) => [
      asPositiveInteger(row.part_id, "parts.part_id"), row.part_code, row.part_name, Number(row.unit_price),
    ]));
    await insertRows(client, "part_stock", ["center_id", "part_id", "quantity", "min_threshold"], stocks.map((row) => [
      asPositiveInteger(row.center_id, "part_stock.center_id"), asPositiveInteger(row.part_id, "part_stock.part_id"),
      asNonNegativeInteger(row.quantity, "part_stock.quantity"), asPositiveInteger(row.min_threshold, "part_stock.min_threshold"),
    ]));
    await insertRows(client, "ticket", ["ticket_id", "ticket_code", "center_id"], tickets.map((row) => [
      asPositiveInteger(row.ticket_id, "tickets_history.ticket_id"), row.ticket_code, asPositiveInteger(row.center_id, "tickets_history.center_id"),
    ]));
    await insertRows(client, "ticket_part", ["ticket_id", "part_id", "quantity_used"], [...ticketParts.entries()].map(([key, quantity]) => {
      const [ticketCode, partId] = key.split(":");
      return [ticketByCode.get(ticketCode), asPositiveInteger(partId, "part_transactions.part_id"), quantity];
    }));
    await insertRows(client, "part_transaction", ["transaction_id", "center_id", "part_id", "ticket_id", "transaction_type", "quantity", "created_at"], transactions.map((row) => [
      asPositiveInteger(row.transaction_id, "part_transactions.transaction_id"), asPositiveInteger(row.center_id, "part_transactions.center_id"),
      asPositiveInteger(row.part_id, "part_transactions.part_id"), row.loai === "XUAT" ? ticketByCode.get(row.ticket_code) : null,
      row.loai === "NHAP" ? "IN" : "OUT", asPositiveInteger(row.so_luong, "part_transactions.so_luong"), row.ngay,
    ]));

    await client.query("SELECT setval(pg_get_serial_sequence('part', 'part_id'), (SELECT MAX(part_id) FROM part), true)");
    await client.query("SELECT setval(pg_get_serial_sequence('ticket', 'ticket_id'), (SELECT MAX(ticket_id) FROM ticket), true)");
    await client.query("SELECT setval(pg_get_serial_sequence('part_transaction', 'transaction_id'), (SELECT MAX(transaction_id) FROM part_transaction), true)");
    await client.query("COMMIT");
    logger.info("dataset_seed_completed", { dataset_dir: datasetDir, part_count: parts.length, stock_count: stocks.length, ticket_count: tickets.length, transaction_count: transactions.length });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => { logger.error("dataset_seed_failed", { error }); process.exitCode = 1; });
