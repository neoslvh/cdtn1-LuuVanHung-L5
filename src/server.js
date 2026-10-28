require("dotenv").config();

const { createPool } = require("./config/database");
const { buildApp } = require("./app");
const { logger } = require("./logger");

const pool = createPool();
const app = buildApp(pool);
const port = Number(process.env.API_PORT || process.env.PORT || 3000);

const server = app.listen(port, () => {
  logger.info("server_started", { port });
});

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, () => {
    logger.info("server_stopping", { signal });
    server.close(() => pool.end().finally(() => process.exit(0)));
  });
}
