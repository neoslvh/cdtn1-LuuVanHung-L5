import { useRef, useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function InventoryPage({ onNavigate, role, notice, onDismissNotice }) {
  const [lowOnly, setLowOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const tableRef = useRef(null);
  const stock = useRequest(
    () => inventoryApi.listStock({ page: stockPage, size: 10, lowOnly, keyword }),
    [stockPage, lowOnly, keyword],
  );
  const alerts = useRequest(
    () =>
      role === "CENTER_MANAGER"
        ? inventoryApi.listAlerts({ page: 1, size: 1 })
        : Promise.resolve({ items: [], total: 0, page: 1, size: 1 }),
    [role],
  );
  const shown = stock.data?.items || [];
  function showLowStockList() {
    setKeyword("");
    setLowOnly(true);
    setStockPage(1);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }
  return (
    <section className="inventory-panel">
      {notice && (
        <div className={`notice ${notice.type || "success"}`}>
          <span>{notice.message}</span>
          <button type="button" onClick={onDismissNotice}>
            Đóng
          </button>
        </div>
      )}
      {role === "CENTER_MANAGER" && alerts.loading && (
        <p className="state">Đang kiểm tra cảnh báo tồn thấp…</p>
      )}
      {role === "CENTER_MANAGER" && alerts.error && (
        <div className="state error">
          <p>Không tải được cảnh báo: {alerts.error.message}</p>
          <button type="button" onClick={alerts.reload}>
            Thử lại
          </button>
        </div>
      )}
      {role === "CENTER_MANAGER" && alerts.data?.total > 0 && (
        <div className="low-stock-alert">
          <strong>⚠ Có {alerts.data.total} linh kiện cần bổ sung.</strong>
          <button type="button" className="alert-link" onClick={showLowStockList}>
            Xem danh sách
          </button>
        </div>
      )}
      <div className="inventory-tools">
        <input
          aria-label="Tìm mã hoặc tên linh kiện"
          placeholder="Tìm mã / tên linh kiện..."
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value);
            setStockPage(1);
          }}
        />
        {role === "CENTER_MANAGER" ? (
          <button type="button" onClick={() => onNavigate("receipt")}>
            Nhập linh kiện
          </button>
        ) : (
          <span />
        )}
        <label className="low-stock-filter">
          <input
            type="checkbox"
            checked={lowOnly}
            onChange={(event) => {
              setLowOnly(event.target.checked);
              setStockPage(1);
            }}
          />{" "}
          Chỉ xem linh kiện tồn thấp
        </label>
        {role === "CENTER_MANAGER" ? (
          <button type="button" className="secondary-button" onClick={() => onNavigate("history")}>
            Xem lịch sử
          </button>
        ) : (
          <span />
        )}
      </div>
      <DataState
        {...stock}
        data={stock.data?.items}
        emptyMessage="Chưa có linh kiện tồn kho tại trung tâm."
        onRetry={stock.reload}
      >
        {() =>
          !shown.length ? (
            <p className="state">Không có linh kiện phù hợp bộ lọc.</p>
          ) : (
            <>
              <table className="inventory-table" ref={tableRef}>
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
                  {shown.map((item) => (
                    <tr
                      key={item.part_id}
                      className={item.status === "LOW_STOCK" ? "low-stock-row" : ""}
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
              <PageControls data={stock.data} onChange={setStockPage} />
            </>
          )
        }
      </DataState>
    </section>
  );
}

function PageControls({ data, onChange, label = "linh kiện" }) {
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
        Hiển thị {firstItem}-{lastItem}/{data.total} {label} · Trang {data.page}/{lastPage}
      </span>
      <button
        type="button"
        disabled={data.page >= lastPage || data.items.length < data.size}
        onClick={() => onChange(data.page + 1)}
      >
        Trang sau
      </button>
    </div>
  );
}
