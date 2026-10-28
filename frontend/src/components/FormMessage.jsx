export default function FormMessage({ type = "error", children, onDismiss }) {
  if (!children) return null;
  return (
    <div className={`form-message ${type}`} role={type === "error" ? "alert" : "status"}>
      <span>{children}</span>
      {onDismiss && (
        <button type="button" className="message-close" onClick={onDismiss}>
          Đóng
        </button>
      )}
    </div>
  );
}
