const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export class ApiError extends Error {
  constructor(status, code, message, fields = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function request(path, options = {}) {
  const token = localStorage.getItem("access_token");
  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    });
  } catch {
    throw new ApiError(0, "NETWORK_ERROR", "Không kết nối được tới hệ thống. Vui lòng kiểm tra mạng rồi bấm Thử lại.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error || {};
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      window.dispatchEvent(new Event("l5:unauthorized"));
    }
    throw new ApiError(response.status, error.code, error.message || "Không kết nối được tới hệ thống. Vui lòng thử lại.", error.fields);
  }
  return body?.data ?? body;
}
