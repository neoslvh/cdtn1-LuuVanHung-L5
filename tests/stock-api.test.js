const test = require("node:test");
const assert = require("node:assert/strict");
const { buildApp } = require("../src/app");

const unusedPool = {
  async query() {
    throw new Error("Test validation khong duoc goi CSDL.");
  },
  async connect() {
    throw new Error("Test validation khong duoc goi CSDL.");
  },
};

async function callApi({ method, path, token, body }) {
  const app = buildApp(unusedPool);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });

  try {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

test("API nhap kho tu choi so luong bang khong voi 400 va thong bao ro", async () => {
  const response = await callApi({
    method: "POST",
    path: "/api/stock-receipts",
    token: "demo-manager",
    body: { part_id: 1, quantity: 0 },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_FAILED");
  assert.match(response.body.error.fields.quantity, /lớn hơn 0/i);
});

test("API nhap kho tu choi thieu linh kien voi 400 va thong bao ro", async () => {
  const response = await callApi({
    method: "POST",
    path: "/api/stock-receipts",
    token: "demo-manager",
    body: { quantity: 1 },
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.error.code, "VALIDATION_FAILED");
  assert.equal(response.body.error.fields.part_id, "Linh kiện là thông tin bắt buộc.");
});

test("API khong co token tra 401 va khong lo stack trace", async () => {
  const response = await callApi({ method: "GET", path: "/api/part-stocks" });
  const bodyText = JSON.stringify(response.body).toLowerCase();

  assert.equal(response.status, 401);
  assert.equal(response.body.error.code, "UNAUTHORIZED");
  assert.doesNotMatch(bodyText, /stack|postgres|database_url|connection string/);
});

test("API tu choi quan ly xuat linh kien voi 403", async () => {
  const response = await callApi({
    method: "POST",
    path: "/api/tickets/1/part-issues",
    token: "demo-manager",
    body: { items: [{ part_id: 1, quantity: 1 }] },
  });

  assert.equal(response.status, 403);
  assert.equal(response.body.error.code, "FORBIDDEN");
  assert.match(response.body.error.message, /không có quyền/i);
});
