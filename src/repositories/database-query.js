const { DataAccessError } = require("../errors/AppError");

function toDataAccessError(error) {
  if (error instanceof DataAccessError) return error;
  if (error?.code === "23505") {
    return new DataAccessError("DATA_ALREADY_EXISTS", "Dữ liệu đã tồn tại.", 409, error);
  }
  if (error?.code === "23503") {
    return new DataAccessError("DATA_IN_USE", "Dữ liệu đang được tham chiếu.", 409, error);
  }
  return new DataAccessError("DATA_ACCESS_FAILED", "Không thể truy cập dữ liệu. Vui lòng thử lại.", 503, error);
}

async function databaseQuery(executor, statement, values) {
  try {
    return await executor.query(statement, values);
  } catch (error) {
    throw toDataAccessError(error);
  }
}

module.exports = { databaseQuery, toDataAccessError };
