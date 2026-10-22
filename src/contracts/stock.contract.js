// CONTRACT: một dòng tồn kho trả từ service sang API/UI.
// part_id là khoá linh kiện; quantity/min_threshold là đơn vị chiếc;
// status chỉ là NORMAL hoặc LOW_STOCK. Không có dữ liệu -> mảng rỗng.
function toStockView(row) {
  return {
    center_id: row.center_id,
    part_id: row.part_id,
    part_code: row.part_code,
    part_name: row.part_name,
    quantity: row.quantity,
    min_threshold: row.min_threshold,
    status: row.status,
  };
}

module.exports = { toStockView };
