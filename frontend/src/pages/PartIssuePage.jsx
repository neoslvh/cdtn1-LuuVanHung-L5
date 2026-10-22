import { useEffect, useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function PartIssuePage() {
  const stock = useRequest(() => inventoryApi.listStock(), []);
  const tickets = useRequest(() => inventoryApi.listTickets(), []);
  const [ticketId, setTicketId] = useState(""); const [partId, setPartId] = useState(""); const [quantity, setQuantity] = useState("");
  const [usedParts, setUsedParts] = useState([]); const [result, setResult] = useState(null); const [error, setError] = useState(null);
  useEffect(() => { if (ticketId) inventoryApi.listTicketParts(ticketId).then(setUsedParts).catch(setError); }, [ticketId]);
  async function submit(event) {
    event.preventDefault(); setError(null); setResult(null);
    try { const response = await inventoryApi.issue(ticketId, { items: [{ part_id: Number(partId), quantity: Number(quantity) }] }); setResult(response); setUsedParts(await inventoryApi.listTicketParts(ticketId)); stock.reload(); }
    catch (requestError) { setError(requestError); }
  }
  return <section><h2>Xuất linh kiện cho phiếu bảo hành</h2>
    <DataState {...tickets} emptyMessage="Không có phiếu bảo hành tại trung tâm." onRetry={tickets.reload}>{(data) => <label>Phiếu bảo hành<select value={ticketId} onChange={(event) => setTicketId(event.target.value)} required><option value="">-- Chọn phiếu --</option>{data.map((ticket) => <option key={ticket.ticket_id} value={ticket.ticket_id}>{ticket.ticket_code}</option>)}</select></label>}</DataState>
    <DataState {...stock} emptyMessage="Chưa có linh kiện tồn kho." onRetry={stock.reload}>{(data) => <form onSubmit={submit}>
      <label>Linh kiện<select value={partId} onChange={(event) => setPartId(event.target.value)} required><option value="">-- Chọn linh kiện --</option>{data.items.map((item) => <option key={item.part_id} value={item.part_id}>{item.part_code} — tồn {item.quantity}</option>)}</select></label>
      <label>Số lượng cần xuất<input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
      <button disabled={!ticketId}>Xuất linh kiện</button>
    </form>}</DataState>
    {error && <p className="state error">{error.message}</p>}
    {result && <div className="success">Đã xuất thành công. {result.low_stock_alerts.length > 0 && "Cảnh báo: tồn kho đã xuống dưới ngưỡng."}</div>}
    {ticketId && <div><h3>Linh kiện đã sử dụng</h3>{usedParts.length ? <ul>{usedParts.map((item) => <li key={item.part_id}>{item.part_name} — SL: {item.quantity_used}</li>)}</ul> : <p>Chưa có linh kiện nào được xuất cho phiếu này.</p>}</div>}
  </section>;
}
