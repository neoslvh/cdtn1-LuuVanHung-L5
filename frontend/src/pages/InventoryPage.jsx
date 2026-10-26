import { useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function InventoryPage({ onNavigate, role, notice, onDismissNotice }) {
  const [lowOnly, setLowOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [alertPage, setAlertPage] = useState(1);
  const stock = useRequest(() => inventoryApi.listStock({ page: stockPage }), [stockPage]);
  const alerts = useRequest(
    () => (role === "CENTER_MANAGER" ? inventoryApi.listAlerts({ page: alertPage }) : Promise.resolve({ items: [], total: 0, page: 1, size: 20 })),
    [role, alertPage],
  );
  const search = keyword.trim().toLowerCase();
  const shown = stock.data?.items?.filter((item) =>
    (!lowOnly || item.status === "LOW_STOCK") && (!search || `${item.part_code} ${item.part_name}`.toLowerCase().includes(search)),
  );
  return <section className="inventory-panel">
    {notice && <div className={`notice ${notice.type || "success"}`}><span>{notice.message}</span><button type="button" onClick={onDismissNotice}>Đóng</button></div>}
    {role === "CENTER_MANAGER" && alerts.loading && <p className="state">Đang kiểm tra cảnh báo tồn thấp…</p>}
    {role === "CENTER_MANAGER" && alerts.error && <div className="state error"><p>Không tải được cảnh báo: {alerts.error.message}</p><button type="button" onClick={alerts.reload}>Thử lại</button></div>}
    {role === "CENTER_MANAGER" && alerts.data?.items?.length > 0 && <div className="low-stock-alert"><strong>Cảnh báo tồn thấp ({alerts.data.items.length})</strong><ul>{alerts.data.items.map((item) => <li key={item.part_id}>{item.part_code} — còn {item.quantity}, ngưỡng tối thiểu {item.min_threshold}</li>)}</ul></div>}
    <div className="inventory-tools">
      <input aria-label="Tìm mã hoặc tên linh kiện" placeholder="Tìm mã / tên linh kiện..." value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      {role === "CENTER_MANAGER" ? <button type="button" onClick={() => onNavigate("receipt")}>Nhập linh kiện</button> : <span />}
      <label className="low-stock-filter"><input type="checkbox" checked={lowOnly} onChange={(event) => { setLowOnly(event.target.checked); setStockPage(1); }} /> Chỉ xem linh kiện tồn thấp</label>
      <button type="button" className="secondary-button" title="FR6 là chức năng COULD, sẽ bổ sung sau luồng chính">Xem lịch sử</button>
    </div>
    <DataState {...stock} data={stock.data?.items} emptyMessage="Chưa có linh kiện tồn kho tại trung tâm." onRetry={stock.reload}>
      {() => !shown.length ? <p className="state">Không có linh kiện phù hợp bộ lọc.</p> : <><table className="inventory-table"><thead><tr className="table-title"><th colSpan="5">Danh sách linh kiện</th></tr><tr><th>Mã</th><th>Tên linh kiện</th><th>Tồn</th><th>Ngưỡng</th><th>Trạng thái</th></tr></thead>
        <tbody>{shown.map((item) => <tr key={item.part_id}><td>{item.part_code}</td><td>{item.part_name}</td><td>{item.quantity}</td><td>{item.min_threshold}</td><td>{item.status === "LOW_STOCK" ? "Tồn thấp" : "Bình thường"}</td></tr>)}</tbody></table><PageControls data={stock.data} onChange={setStockPage} /></>}
    </DataState>
    {role === "CENTER_MANAGER" && alerts.data?.total > alerts.data?.size && <PageControls data={alerts.data} onChange={setAlertPage} label="cảnh báo" />}
  </section>;
}

function PageControls({ data, onChange, label = "linh kiện" }) {
  const lastPage = Math.max(1, Math.ceil(data.total / data.size));
  if (lastPage === 1) return null;
  return <div className="page-controls"><button type="button" className="cancel-button" disabled={data.page === 1} onClick={() => onChange(data.page - 1)}>Trang trước</button><span>Trang {data.page}/{lastPage} ({data.total} {label})</span><button type="button" disabled={data.page === lastPage} onClick={() => onChange(data.page + 1)}>Trang sau</button></div>;
}
