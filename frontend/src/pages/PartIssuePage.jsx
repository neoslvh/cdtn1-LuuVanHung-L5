import { useEffect, useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function PartIssuePage() {
  const stock = useRequest(() => inventoryApi.listAllStock(), []);
  const tickets = useRequest(() => inventoryApi.listTickets(), []);
  const [ticketId, setTicketId] = useState("");
  const [items, setItems] = useState([{ partId: "", quantity: "" }]);
  const [usedParts, setUsedParts] = useState([]); const [result, setResult] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { if (ticketId) inventoryApi.listTicketParts(ticketId).then(setUsedParts).catch(setError); }, [ticketId]);
  function updateItem(index, field, value) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }
  function removeItem(index) {
    setItems((current) => current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index));
  }
  async function submit(event) {
    event.preventDefault(); setError(null); setResult(null);
    try {
      const response = await inventoryApi.issue(ticketId, { items: items.map((item) => ({ part_id: Number(item.partId), quantity: Number(item.quantity) })) });
      setResult(response); setUsedParts(await inventoryApi.listTicketParts(ticketId)); stock.reload();
    }
    catch (requestError) { setError(requestError); }
  }
  return <section>
    <DataState {...tickets} emptyMessage="Không có phiếu bảo hành tại trung tâm." onRetry={tickets.reload}>{(data) => <label>Phiếu bảo hành<select value={ticketId} onChange={(event) => setTicketId(event.target.value)} required><option value="">-- Chọn phiếu --</option>{data.map((ticket) => <option key={ticket.ticket_id} value={ticket.ticket_id}>{ticket.ticket_code}</option>)}</select></label>}</DataState>
    <DataState {...stock} emptyMessage="Chưa có linh kiện tồn kho." onRetry={stock.reload}>{(data) => <form onSubmit={submit}>
      {items.map((issueItem, index) => {
        const selected = data.items.find((item) => String(item.part_id) === issueItem.partId);
        return <fieldset className="issue-item" key={index}><legend>Linh kiện xuất {index + 1}</legend>
          <label>Linh kiện<select value={issueItem.partId} onChange={(event) => updateItem(index, "partId", event.target.value)} required><option value="">-- Chọn linh kiện --</option>{data.items.map((item) => <option key={item.part_id} value={item.part_id} disabled={items.some((other, otherIndex) => otherIndex !== index && other.partId === String(item.part_id))}>{item.part_code} — tồn {item.quantity}</option>)}</select></label>
          {selected && <p className="stock-hint">Tồn hiện tại: <strong>{selected.quantity}</strong>; ngưỡng cảnh báo: {selected.min_threshold}.</p>}
          <label>Số lượng cần xuất<input type="number" min="1" value={issueItem.quantity} onChange={(event) => updateItem(index, "quantity", event.target.value)} required /></label>
          {items.length > 1 && <button className="cancel-button" type="button" onClick={() => removeItem(index)}>Bỏ linh kiện này</button>}
        </fieldset>;
      })}
      <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setItems((current) => [...current, { partId: "", quantity: "" }])}>Thêm linh kiện</button><button disabled={!ticketId}>Xuất linh kiện</button></div>
    </form>}</DataState>
    {error && <p className="state error">{error.message}</p>}
    {result && <div className="success">Đã xuất thành công {result.issues.length} linh kiện. {result.low_stock_alerts.length > 0 && `Cảnh báo: ${result.low_stock_alerts.map((item) => item.part_code).join(", ")} đã xuống dưới ngưỡng.`}</div>}
    {ticketId && <div><h3>Linh kiện đã sử dụng</h3>{usedParts.length ? <ul>{usedParts.map((item) => <li key={item.part_id}>{item.part_name} — SL: {item.quantity_used}</li>)}</ul> : <p>Chưa có linh kiện nào được xuất cho phiếu này.</p>}</div>}
  </section>;
}
