import { useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function StockReceiptPage() {
  const stock = useRequest(() => inventoryApi.listStock(), []);
  const [partId, setPartId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  async function submit(event) {
    event.preventDefault(); setError(null); setResult(null);
    try { setResult(await inventoryApi.receive({ part_id: Number(partId), quantity: Number(quantity) })); stock.reload(); }
    catch (requestError) { setError(requestError); }
  }
  return <section><h2>Ghi nhận nhập linh kiện</h2>
    <DataState {...stock} emptyMessage="Chưa có linh kiện để nhập kho." onRetry={stock.reload}>
      {(data) => <form onSubmit={submit}>
        <label>Linh kiện<select value={partId} onChange={(event) => setPartId(event.target.value)} required><option value="">-- Chọn linh kiện --</option>{data.items.map((item) => <option key={item.part_id} value={item.part_id}>{item.part_code} — {item.part_name} (tồn {item.quantity})</option>)}</select></label>
        <label>Số lượng nhập<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <button>Xác nhận nhập</button>
      </form>}
    </DataState>
    {error && <p className="state error">{error.message}</p>}
    {result && <p className="success">Đã nhập {result.quantity}; tồn thay đổi từ {result.stock_before} thành {result.stock_after}.</p>}
  </section>;
}
