const { AppError } = require("../errors/AppError");

// Prototype-only: token demo tạo qua /api/auth/demo-login; thay bằng JWT thật ở giai đoạn sau.
const demoUsers = {
  "demo-manager": { role: "CENTER_MANAGER", centerId: 1 },
  "demo-technician": { role: "TECHNICIAN", centerId: 1 },
};

function requireAuth(req, res, next) {
  const token = req.get("authorization")?.replace(/^Bearer\s+/i, "");
  const auth = demoUsers[token];
  if (!auth) return next(new AppError("UNAUTHORIZED", "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."));
  req.auth = auth;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.auth.role)) return next(new AppError("FORBIDDEN", "Bạn không có quyền thực hiện thao tác này."));
    next();
  };
}

module.exports = { requireAuth, requireRole, demoUsers };
