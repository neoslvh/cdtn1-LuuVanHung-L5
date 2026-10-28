export default function DataState({ loading, error, data, emptyMessage, onRetry, children }) {
  if (loading) return <p className="state">Đang tải dữ liệu…</p>;
  if (error)
    return (
      <div className="state error">
        <p>{error.message}</p>
        <button onClick={onRetry}>Thử lại</button>
      </div>
    );
  const empty =
    !data || (Array.isArray(data) && data.length === 0) || (data.items && data.items.length === 0);
  if (empty) return <p className="state">{emptyMessage || "Chưa có dữ liệu."}</p>;
  return children(data);
}
