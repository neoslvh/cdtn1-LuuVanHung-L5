const test = require("node:test");
const assert = require("node:assert/strict");
const StockRepository = require("../src/repositories/stock.repository");

test("tim kiem ton kho truyen gia tri nguoi dung qua tham so SQL", async () => {
  let capturedStatement;
  let capturedValues;
  const pool = {
    async query(statement, values) {
      capturedStatement = statement;
      capturedValues = values;
      return { rows: [] };
    },
  };
  const injectionPayload = "' OR 1=1 --";
  const repository = new StockRepository(pool);

  const result = await repository.list(1, { keyword: injectionPayload });

  assert.equal(result.total, 0);
  assert.equal(capturedValues[2], injectionPayload);
  assert.match(capturedStatement, /\$3/);
  assert.doesNotMatch(capturedStatement, /OR 1=1/);
});
