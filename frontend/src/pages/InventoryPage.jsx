import { useEffect, useRef, useState } from "react";
import { inventoryApi } from "../api/inventory.api";
import DataState from "../components/DataState";
import { useRequest } from "../hooks/useRequest";

export default function InventoryPage({ onNavigate, role, notice, onDismissNotice }) {
  const [lowOnly, setLowOnly] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [sortBy, setSortBy] = useState("part_code");
  const [sortDirection, setSortDirection] = useState("asc");
  const [cachedStock, setCachedStock] = useState(null);
  const tableRef = useRef(null);
  const stock = useRequest(
    () =>
      inventoryApi.listStock({
        page: stockPage,
        size: 10,
        lowOnly,
        keyword,
        sortBy,
        sortDirection,
      }),
    [stockPage, lowOnly, keyword, sortBy, sortDirection],
  );
  const alerts = useRequest(
    () =>
      role === "CENTER_MANAGER"
        ? inventoryApi.listAlerts({ page: 1, size: 1 })
        : Promise.resolve({ items: [], total: 0, page: 1, size: 1 }),
    [role],
  );
  useEffect(() => {
    if (stock.data) setCachedStock(stock.data);
  }, [stock.data]);

  const displayedStock = stock.data || cachedStock;
  const shown = displayedStock?.items || [];
  const isRefreshing = stock.loading && Boolean(displayedStock);
  const pageError = stock.error || alerts.error;
  const hasBlockingStockError = Boolean(stock.error && !displayedStock);

  function retryFailedRequests() {
    if (stock.error) stock.reload();
    if (alerts.error) alerts.reload();
  }

  function showLowStockList() {
    setKeyword("");
    setLowOnly(true);
    setStockPage(1);
    setTimeout(() => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function changeSort(nextSortBy) {
    if (nextSortBy === sortBy) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortDirection("asc");
    }
    setStockPage(1);
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
      {pageError && (
        <div className="state error">
          <p>{pageError.message}</p>
          <button type="button" onClick={retryFailedRequests}>
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
      {!hasBlockingStockError && <DataState
        {...stock}
        data={displayedStock}
        error={null}
        emptyMessage={
          lowOnly || keyword.trim()
            ? "Không có linh kiện phù hợp bộ lọc."
            : "Chưa có linh kiện tồn kho tại trung tâm."
        }
        onRetry={stock.reload}
      >
        {(data) =>
          !shown.length ? (
            <p className="state">Không có linh kiện phù hợp bộ lọc.</p>
          ) : (
            <>
              <table className="inventory-table" ref={tableRef} aria-busy={isRefreshing}>
                <thead>
                  <tr className="table-title">
                    <th colSpan="5">Danh sách linh kiện</th>
                  </tr>
                  <tr>
                    <SortableHeader
                      label="Mã"
                      sortKey="part_code"
                      activeSortBy={sortBy}
                      direction={sortDirection}
                      onSort={changeSort}
                    />
                    <SortableHeader
                      label="Tên linh kiện"
                      sortKey="part_name"
                      activeSortBy={sortBy}
                      direction={sortDirection}
                      onSort={changeSort}
                    />
                    <SortableHeader
                      label="Tồn"
                      sortKey="quantity"
                      activeSortBy={sortBy}
                      direction={sortDirection}
                      onSort={changeSort}
                    />
                    <SortableHeader
                      label="Ngưỡng"
                      sortKey="min_threshold"
                      activeSortBy={sortBy}
                      direction={sortDirection}
                      onSort={changeSort}
                    />
                    <SortableHeader
                      label="Trạng thái"
                      sortKey="status"
                      activeSortBy={sortBy}
                      direction={sortDirection}
                      onSort={changeSort}
                    />
                  </tr>
                </thead>
                <tbody>
                  {isRefreshing ? (
                    <InventorySkeletonRows />
                  ) : (
                    shown.map((item) => (
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
                    ))
                  )}
                </tbody>
              </table>
              <PageControls data={data} onChange={setStockPage} loading={isRefreshing} />
            </>
          )
        }
      </DataState>}
    </section>
  );
}

function SortableHeader({ label, sortKey, activeSortBy, direction, onSort }) {
  const isActive = activeSortBy === sortKey;
  const ariaSort = isActive ? (direction === "asc" ? "ascending" : "descending") : "none";

  return (
    <th aria-sort={ariaSort}>
      <button
        type="button"
        className={`inventory-sort-button${isActive ? " active" : ""}`}
        onClick={() => onSort(sortKey)}
        aria-label={`Sắp xếp theo ${label}${isActive ? `, hiện tại ${direction === "asc" ? "tăng dần" : "giảm dần"}` : ""}`}
      >
        <span>{label}</span>
        <span
          aria-hidden="true"
          className={`sort-indicator${isActive ? ` ${direction}` : ""}`}
        >
          <span>▲</span>
          <span>▼</span>
        </span>
      </button>
    </th>
  );
}

function InventorySkeletonRows() {
  return Array.from({ length: 10 }, (_, index) => (
    <tr className="skeleton-row" key={index}>
      {Array.from({ length: 5 }, (_, cellIndex) => (
        <td key={cellIndex}>
          <span className="skeleton-cell" />
        </td>
      ))}
    </tr>
  ));
}

function PageControls({ data, onChange, loading = false, label = "linh kiện" }) {
  const lastPage = Math.max(1, Math.ceil(data.total / data.size));
  const firstItem = (data.page - 1) * data.size + 1;
  const lastItem = Math.min(data.page * data.size, data.total);
  if (lastPage === 1) return null;
  return (
    <div className="page-controls">
      <button
        type="button"
        className="cancel-button"
        disabled={loading || data.page <= 1}
        onClick={() => onChange(data.page - 1)}
      >
        Trang trước
      </button>
      <span>
        {loading
          ? "Đang cập nhật danh sách…"
          : `Hiển thị ${firstItem}-${lastItem}/${data.total} ${label} · Trang ${data.page}/${lastPage}`}
      </span>
      <button
        type="button"
        disabled={loading || data.page >= lastPage || data.items.length < data.size}
        onClick={() => onChange(data.page + 1)}
      >
        Trang sau
      </button>
    </div>
  );
}
