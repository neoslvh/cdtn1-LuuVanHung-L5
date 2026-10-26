import { useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function StockReceiptPage({ onNavigate }) {
  const stock = useRequest(() => inventoryApi.listAllStock(), []);
  const [partId, setPartId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState(null);
  const selectedPart = stock.data?.items?.find((item) => String(item.part_id) === partId);
  async function submit(event) {
    event.preventDefault(); setError(null);
    try {
      const receipt = await inventoryApi.receive({ part_id: Number(partId), quantity: Number(quantity) });
      onNavigate("inventory", {
        type: "success",
        message: `Đã nhập ${receipt.quantity} ${selectedPart.part_name} (${selectedPart.part_code}). Tồn kho được cập nhật từ ${receipt.stock_before} lên ${receipt.stock_after}.`,
      });
    }
    catch (requestError) { setError(requestError); }
  }
  return <section className="receipt-panel">
    <DataState {...stock} emptyMessage="Chưa có linh kiện để nhập kho." onRetry={stock.reload}>
      {(data) => <form onSubmit={submit}>
        <label>Linh kiện<select value={partId} onChange={(event) => setPartId(event.target.value)} required><option value="">-- Chọn linh kiện --</option>{data.items.map((item) => <option key={item.part_id} value={item.part_id}>{item.part_name}</option>)}</select></label>
        <label>Mã linh kiện<input className="readonly-field" value={selectedPart?.part_code || "—"} readOnly /></label>
        <label>Tồn hiện tại<input className="readonly-field" value={selectedPart ? `${selectedPart.quantity} linh kiện` : "Chọn linh kiện để xem tồn"} readOnly /></label>
        <label>Số lượng nhập<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={() => onNavigate("inventory")}>Hủy</button>
          <button type="submit">Xác nhận nhập</button>
        </div>
      </form>}
    </DataState>
    {error && <p className="state error">{error.message}</p>}
  </section>;
}
