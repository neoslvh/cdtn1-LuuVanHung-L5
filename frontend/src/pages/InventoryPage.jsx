import { useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function InventoryPage({ onNavigate, role }) {
  const [lowOnly, setLowOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const stock = useRequest(() => inventoryApi.listStock(), []);
  const search = keyword.trim().toLowerCase();
  const shown = stock.data?.items?.filter((item) =>
    (!lowOnly || item.status === "LOW_STOCK") && (!search || `${item.part_code} ${item.part_name}`.toLowerCase().includes(search)),
  );
  return <section className="inventory-panel">
    <div className="inventory-tools">
      <input aria-label="Tìm mã hoặc tên linh kiện" placeholder="Tìm mã / tên linh kiện..." value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      {role === "CENTER_MANAGER" ? <button type="button" onClick={() => onNavigate("receipt")}>Nhập linh kiện</button> : <span />}
      <label className="low-stock-filter"><input type="checkbox" checked={lowOnly} onChange={(event) => setLowOnly(event.target.checked)} /> Chỉ xem linh kiện tồn thấp</label>
      <button type="button" className="secondary-button" title="FR6 là chức năng COULD, sẽ bổ sung sau luồng chính">Xem lịch sử</button>
    </div>
    <DataState {...stock} data={shown} emptyMessage="Không có linh kiện phù hợp bộ lọc." onRetry={stock.reload}>
      {(items) => <table className="inventory-table"><thead><tr className="table-title"><th colSpan="5">Danh sách linh kiện</th></tr><tr><th>Mã</th><th>Tên linh kiện</th><th>Tồn</th><th>Ngưỡng</th><th>Trạng thái</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.part_id}><td>{item.part_code}</td><td>{item.part_name}</td><td>{item.quantity}</td><td>{item.min_threshold}</td><td>{item.status === "LOW_STOCK" ? "Tồn thấp" : "Bình thường"}</td></tr>)}</tbody></table>}
    </DataState>
  </section>;
}
