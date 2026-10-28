const { randomUUID } = require("crypto");

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const configuredLevel =
  LEVELS[String(process.env.LOG_LEVEL || "info").toLowerCase()] ?? LEVELS.info;
const sensitiveKeys = [
  "password",
  "mat_khau",
  "token",
  "jwt",
  "authorization",
  "secret",
  "cvv",
  "so_the",
  "phone",
  "dien_thoai",
  "database_url",
  "connection_string",
  "connection",
  "dsn",
  "uri",
  "url",
];

function redactText(value) {
  return String(value)
    .replace(/postgres(?:ql)?:\/\/[^\s@/]+(?::[^\s@]+)?@/gi, "postgresql://***@")
    .replace(/\b(password|token|secret|authorization)\s*[:=]\s*[^\s,;]+/gi, "$1=***")
    .replace(/\b(?:\+?84|0)\d{9,10}\b/g, "***");
}

function maskSensitive(value) {
  if (value === null || typeof value !== "object") return value;
  // Stack chỉ nằm trong log server, không trả cho frontend; vẫn redaction trước khi ghi.
  if (value instanceof Error)
    return {
      name: value.name,
      code: value.code,
      message: redactText(value.message),
      stack: value.stack ? redactText(value.stack) : undefined,
    };
  if (Array.isArray(value)) return value.map(maskSensitive);
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveKeys.some((word) => key.toLowerCase().includes(word)) ? "***" : maskSensitive(item),
    ]),
  );
}

function log(level, message, context = {}) {
  if ((LEVELS[level] ?? LEVELS.info) < configuredLevel) return;
  process.stdout.write(
    `${JSON.stringify({ timestamp: new Date().toISOString(), level, message, ...maskSensitive(context) })}\n`,
  );
}

const logger = {
  debug: (message, context) => log("debug", message, context),
  info: (message, context) => log("info", message, context),
  warn: (message, context) => log("warn", message, context),
  error: (message, context) => log("error", message, context),
};

function requestContext(req, res, next) {
  const suppliedId = req.get("x-request-id");
  req.requestId =
    typeof suppliedId === "string" && /^[a-zA-Z0-9_-]{8,100}$/.test(suppliedId)
      ? suppliedId
      : randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  const startedAt = Date.now();
  res.on("finish", () =>
    logger.info("request_completed", {
      request_id: req.requestId,
      method: req.method,
      path: req.path,
      status_code: res.statusCode,
      duration_ms: Date.now() - startedAt,
    }),
  );
  next();
}

module.exports = { logger, requestContext, maskSensitive, redactText };
