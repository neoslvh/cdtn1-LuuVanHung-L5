import { useEffect, useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import FormMessage from "../components/FormMessage";
import { useRequest } from "../hooks/useRequest";

export default function PartIssuePage() {
  const stock = useRequest(() => inventoryApi.listAllStock(), []);
  const tickets = useRequest(() => inventoryApi.listTickets(), []);
  const [ticketId, setTicketId] = useState("");
  const [items, setItems] = useState([
    { partId: "", quantity: "", availability: null, checking: false },
  ]);
  const [usedParts, setUsedParts] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (ticketId) inventoryApi.listTicketParts(ticketId).then(setUsedParts).catch(setError);
  }, [ticketId]);
  function updateItem(index, field, value) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value, availability: null } : item,
      ),
    );
  }
  function removeItem(index) {
    setItems((current) =>
      current.length === 1 ? current : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }
  async function checkAvailability(index) {
    const item = items[index];
    setError(null);
    if (!item.partId) {
      setError({ message: "Vui lòng chọn linh kiện cần xuất." });
      return;
    }
    if (!Number.isSafeInteger(Number(item.quantity)) || Number(item.quantity) <= 0) {
      setError({ message: "Số lượng cần xuất phải là số nguyên lớn hơn 0." });
      return;
    }
    setItems((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { ...entry, checking: true, availability: null } : entry,
      ),
    );
    try {
      const availability = await inventoryApi.checkAvailability(
        Number(item.partId),
        Number(item.quantity),
      );
      setItems((current) =>
        current.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, checking: false, availability } : entry,
        ),
      );
    } catch (requestError) {
      setItems((current) =>
        current.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, checking: false } : entry,
        ),
      );
      setError(requestError);
    }
  }
  async function submit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);
    if (!ticketId) {
      setError({ message: "Vui lòng chọn phiếu bảo hành trước khi xuất linh kiện." });
      return;
    }
    const invalidIndex = items.findIndex(
      (item) =>
        !item.partId || !Number.isSafeInteger(Number(item.quantity)) || Number(item.quantity) <= 0,
    );
    if (invalidIndex >= 0) {
      setError({
        message: !items[invalidIndex].partId
          ? "Vui lòng chọn linh kiện cần xuất."
          : "Số lượng cần xuất phải là số nguyên lớn hơn 0.",
      });
      return;
    }
    if (items.some((item) => !item.availability?.available)) {
      setError({ message: "Vui lòng kiểm tra tồn và bảo đảm đủ linh kiện trước khi xuất." });
      return;
    }
    try {
      const response = await inventoryApi.issue(ticketId, {
        items: items.map((item) => ({
          part_id: Number(item.partId),
          quantity: Number(item.quantity),
        })),
      });
      setResult(response);
      setUsedParts(await inventoryApi.listTicketParts(ticketId));
      stock.reload();
    } catch (requestError) {
      setError(requestError);
    }
  }
  return (
    <section className="issue-panel">
      <DataState
        {...tickets}
        emptyMessage="Không có phiếu bảo hành tại trung tâm."
        onRetry={tickets.reload}
      >
        {(data) => (
          <label className="ticket-selector">
            Phiếu bảo hành
            <select value={ticketId} onChange={(event) => setTicketId(event.target.value)} required>
              <option value="">-- Chọn phiếu --</option>
              {data.map((ticket) => (
                <option key={ticket.ticket_id} value={ticket.ticket_id}>
                  {ticket.ticket_code}
                </option>
              ))}
            </select>
          </label>
        )}
      </DataState>
      <DataState {...stock} emptyMessage="Chưa có linh kiện tồn kho." onRetry={stock.reload}>
        {(data) => (
          <form className="issue-form" onSubmit={submit} noValidate>
            <FormMessage type="error" onDismiss={() => setError(null)}>
              {error?.message}
            </FormMessage>
            <FormMessage type="success" onDismiss={() => setResult(null)}>
              {result && (
                <>
                  Đã xuất thành công {result.issues.length} linh kiện.{" "}
                  {result.low_stock_alerts.length > 0 &&
                    `Cảnh báo: ${result.low_stock_alerts.map((item) => item.part_code).join(", ")} đã xuống dưới ngưỡng.`}
                </>
              )}
            </FormMessage>
            {items.map((issueItem, index) => {
              const selected = data.items.find((item) => String(item.part_id) === issueItem.partId);
              return (
                <fieldset className="issue-item" key={index}>
                  <legend>Linh kiện xuất {index + 1}</legend>
                  <div className="issue-row">
                    <label>
                      Linh kiện
                      <select
                        value={issueItem.partId}
                        onChange={(event) => updateItem(index, "partId", event.target.value)}
                        required
                      >
                        <option value="">-- Chọn linh kiện --</option>
                        {data.items.map((item) => (
                          <option
                            key={item.part_id}
                            value={item.part_id}
                            disabled={items.some(
                              (other, otherIndex) =>
                                otherIndex !== index && other.partId === String(item.part_id),
                            )}
                          >
                            {item.part_code} — {item.part_name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="stock-readonly">
                      Tồn hiện tại: <strong>{selected ? selected.quantity : "—"}</strong>
                    </p>
                  </div>
                  <div className="issue-row">
                    <label>
                      Số lượng cần xuất
                      <input
                        type="number"
                        min="1"
                        value={issueItem.quantity}
                        onChange={(event) => updateItem(index, "quantity", event.target.value)}
                        required
                      />
                    </label>
                    <button
                      type="button"
                      className="secondary-button check-stock-button"
                      disabled={issueItem.checking}
                      onClick={() => checkAvailability(index)}
                    >
                      {issueItem.checking ? "Đang kiểm tra…" : "Kiểm tra tồn"}
                    </button>
                  </div>
                  {issueItem.availability ? (
                    <p
                      className={`availability-result ${issueItem.availability.available ? "available" : "unavailable"}`}
                    >
                      {issueItem.availability.available
                        ? `Trạng thái: Đủ linh kiện để xuất (${issueItem.quantity}/${issueItem.availability.quantity}).`
                        : `Trạng thái: Không đủ linh kiện để xuất (${issueItem.quantity}/${issueItem.availability.quantity}).`}
                    </p>
                  ) : (
                    <p className="availability-result pending">Trạng thái: Chưa kiểm tra tồn.</p>
                  )}
                  {items.length > 1 && (
                    <button
                      className="cancel-button"
                      type="button"
                      onClick={() => removeItem(index)}
                    >
                      Bỏ linh kiện này
                    </button>
                  )}
                </fieldset>
              );
            })}
            <div className="form-actions issue-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  setItems((current) => [
                    ...current,
                    { partId: "", quantity: "", availability: null, checking: false },
                  ])
                }
              >
                Thêm linh kiện
              </button>
              <button className="issue-submit">Xuất linh kiện</button>
            </div>
          </form>
        )}
      </DataState>
      {ticketId && (
        <div className="used-parts">
          <h3>Linh kiện đã sử dụng cho phiếu</h3>
          {usedParts.length ? (
            <ul>
              {usedParts.map((item) => (
                <li key={item.part_id}>
                  {item.part_name} <strong>× {item.quantity_used}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có linh kiện nào được xuất cho phiếu này.</p>
          )}
        </div>
      )}
    </section>
  );
}
