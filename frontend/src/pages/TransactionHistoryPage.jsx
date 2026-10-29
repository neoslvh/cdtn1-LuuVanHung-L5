import { useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function TransactionHistoryPage({ onNavigate }) {
  const [partId, setPartId] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const stock = useRequest(
    () => inventoryApi.listStock({ page: stockPage, size: 10 }),
    [stockPage],
  );
  const history = useRequest(
    () =>
      partId
        ? inventoryApi.listTransactionHistory(partId, { page: historyPage })
        : Promise.resolve(null),
    [partId, historyPage],
  );

  function choosePart(nextPartId) {
    setPartId(String(nextPartId));
    setHistoryPage(1);
  }

  return (
    <section className="history-panel">
      <div className="history-heading">
        <div>
          <h2>Chọn linh kiện để xem lịch sử</h2>
          <p>Chọn một dòng trong danh sách tồn kho bên dưới.</p>
        </div>
        <button type="button" className="cancel-button" onClick={() => onNavigate("inventory")}>
          Quay lại tồn kho
        </button>
      </div>

      <DataState
        {...stock}
        data={stock.data}
        emptyMessage="Chưa có linh kiện để xem lịch sử."
        onRetry={stock.reload}
      >
        {(data) => (
          <>
            <table className="inventory-table history-stock-table">
              <thead>
                <tr className="table-title">
                  <th colSpan="5">Danh sách linh kiện</th>
                </tr>
                <tr>
                  <th>Mã</th>
                  <th>Tên linh kiện</th>
                  <th>Tồn</th>
                  <th>Ngưỡng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr
                    key={item.part_id}
                    className={`selectable-row ${
                      String(item.part_id) === partId ? "selected-row" : ""
                    } ${item.status === "LOW_STOCK" ? "low-stock-row" : ""}`}
                    tabIndex="0"
                    onClick={() => choosePart(item.part_id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        choosePart(item.part_id);
                      }
                    }}
                  >
                    <td>{item.part_code}</td>
                    <td>{item.part_name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.min_threshold}</td>
                    <td>
                      <span
                        className={`stock-status ${item.status === "LOW_STOCK" ? "low" : "normal"}`}
                      >
                        {item.status === "LOW_STOCK"
                          ? item.quantity === 0
                            ? "Hết hàng"
                            : "Tồn thấp"
                          : "Bình thường"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <StockPageControls data={data} onChange={setStockPage} />
          </>
        )}
      </DataState>

      {!partId ? (
        <p className="state">Chọn một linh kiện trong bảng để xem các lần nhập và xuất.</p>
      ) : (
        <DataState
          {...history}
          emptyMessage="Linh kiện này chưa có giao dịch nhập hoặc xuất."
          onRetry={history.reload}
        >
          {(data) => (
            <>
              <p className="stock-hint">
                Lịch sử: <strong>{data.part.part_code} — {data.part.part_name}</strong>
              </p>
              <table className="inventory-table">
                <thead>
                  <tr className="table-title">
                    <th colSpan="5">Lịch sử biến động tồn kho</th>
                  </tr>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Loại</th>
                    <th>Số lượng</th>
                    <th>Phiếu bảo hành</th>
                    <th>Thời điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.transaction_id}>
                      <td>{item.transaction_id}</td>
                      <td>{item.transaction_type === "IN" ? "Nhập kho" : "Xuất kho"}</td>
                      <td>{item.quantity}</td>
                      <td>{item.ticket_code || "—"}</td>
                      <td>{new Date(item.created_at).toLocaleString("vi-VN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <HistoryPageControls data={data} onChange={setHistoryPage} />
            </>
          )}
        </DataState>
      )}
    </section>
  );
}

function StockPageControls({ data, onChange }) {
  const lastPage = Math.max(1, Math.ceil(data.total / data.size));
  const firstItem = (data.page - 1) * data.size + 1;
  const lastItem = Math.min(data.page * data.size, data.total);

  if (lastPage === 1) return null;

  return (
    <div className="page-controls">
      <button
        type="button"
        className="cancel-button"
        disabled={data.page <= 1}
        onClick={() => onChange(data.page - 1)}
      >
        Trang trước
      </button>
      <span>
        Hiển thị {firstItem}-{lastItem}/{data.total} linh kiện · Trang {data.page}/{lastPage}
      </span>
      <button type="button" disabled={data.page >= lastPage} onClick={() => onChange(data.page + 1)}>
        Trang sau
      </button>
    </div>
  );
}

function HistoryPageControls({ data, onChange }) {
  const lastPage = Math.max(1, Math.ceil(data.total / data.size));

  if (lastPage === 1) return null;

  return (
    <div className="page-controls">
      <button
        type="button"
        className="cancel-button"
        disabled={data.page === 1}
        onClick={() => onChange(data.page - 1)}
      >
        Trang trước
      </button>
      <span>
        Trang {data.page}/{lastPage} ({data.total} giao dịch)
      </span>
      <button type="button" disabled={data.page === lastPage} onClick={() => onChange(data.page + 1)}>
        Trang sau
      </button>
    </div>
  );
}
