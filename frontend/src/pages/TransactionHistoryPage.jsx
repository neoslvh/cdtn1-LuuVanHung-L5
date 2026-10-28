import { useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function TransactionHistoryPage({ onNavigate }) {
  const stock = useRequest(() => inventoryApi.listAllStock(), []);
  const [partId, setPartId] = useState("");
  const [page, setPage] = useState(1);
  const history = useRequest(
    () => (partId ? inventoryApi.listTransactionHistory(partId, { page }) : Promise.resolve(null)),
    [partId, page],
  );

  const choosePart = (event) => {
    setPartId(event.target.value);
    setPage(1);
  };
  return (
    <section className="history-panel">
      <div className="history-heading">
        <label>
          Linh kiện
          <DataState
            {...stock}
            emptyMessage="Chưa có linh kiện để xem lịch sử."
            onRetry={stock.reload}
          >
            {(data) => (
              <select value={partId} onChange={choosePart}>
                <option value="">-- Chọn linh kiện --</option>
                {data.items.map((item) => (
                  <option key={item.part_id} value={item.part_id}>
                    {item.part_code} — {item.part_name}
                  </option>
                ))}
              </select>
            )}
          </DataState>
        </label>
        <button type="button" className="cancel-button" onClick={() => onNavigate("inventory")}>
          Quay lại tồn kho
        </button>
      </div>
      {!partId ? (
        <p className="state">Chọn linh kiện để xem các lần nhập và xuất.</p>
      ) : (
        <DataState
          {...history}
          emptyMessage="Linh kiện này chưa có giao dịch nhập hoặc xuất."
          onRetry={history.reload}
        >
          {(data) => (
            <>
              <p className="stock-hint">
                Lịch sử:{" "}
                <strong>
                  {data.part.part_code} — {data.part.part_name}
                </strong>
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
              <PageControls data={data} onChange={setPage} />
            </>
          )}
        </DataState>
      )}
    </section>
  );
}

function PageControls({ data, onChange }) {
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
      <button
        type="button"
        disabled={data.page === lastPage}
        onClick={() => onChange(data.page + 1)}
      >
        Trang sau
      </button>
    </div>
  );
}
