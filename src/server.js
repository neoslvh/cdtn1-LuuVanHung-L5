require("dotenv").config();

const { createPool } = require("./config/database");
const { buildApp } = require("./app");

const pool = createPool();
const app = buildApp(pool);
const port = Number(process.env.PORT || 3000);

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => server.close(() => pool.end().finally(() => process.exit(0))));
}
