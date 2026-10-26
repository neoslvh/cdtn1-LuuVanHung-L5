import { useEffect, useState } from "react";
import { inventoryApi } from "./api/inventory.api";
import InventoryPage from "./pages/InventoryPage";
import StockReceiptPage from "./pages/StockReceiptPage";
import PartIssuePage from "./pages/PartIssuePage";

const pages = { inventory: InventoryPage, receipt: StockReceiptPage, issue: PartIssuePage };
const pageTitles = {
  inventory: "Danh sách tồn kho",
  receipt: "Ghi nhận nhập linh kiện",
  issue: "Xuất linh kiện cho phiếu bảo hành",
};
export default function App() {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [page, setPage] = useState(() => localStorage.getItem("role") === "TECHNICIAN" ? "issue" : "inventory");
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const Page = pages[page];
  useEffect(() => {
    const onUnauthorized = () => { setToken(null); setRole(null); setPage("inventory"); };
    window.addEventListener("l5:unauthorized", onUnauthorized);
    return () => window.removeEventListener("l5:unauthorized", onUnauthorized);
  }, []);
  async function login(nextRole) {
    try {
      const data = await inventoryApi.login(nextRole);
      localStorage.setItem("access_token", data.token);
      localStorage.setItem("role", data.role); setToken(data.token);
      setRole(data.role); setPage(data.role === "TECHNICIAN" ? "issue" : "inventory");
      setError(null); setNotice(null);
    } catch (requestError) { setError(requestError); }
  }
  if (!token) return <main className="login"><h1>L5 — Kho linh kiện thay thế</h1><p>Chọn tài khoản demo để sử dụng màn hình đúng vai trò.</p>
    <button onClick={() => login("CENTER_MANAGER")}>Đăng nhập Quản lý trung tâm</button>
    <button onClick={() => login("TECHNICIAN")}>Đăng nhập Kỹ thuật viên</button>
    {error && <p className="state error">{error.message}</p>}</main>;
  function navigate(nextPage, nextNotice = null) {
    setPage(nextPage);
    if (nextNotice) setNotice(nextNotice);
  }
  return <main><header><h1>{pageTitles[page]}</h1><nav><button onClick={() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role"); setToken(null); setRole(null); setNotice(null);
  }}>Đăng xuất</button></nav></header><Page onNavigate={navigate} role={role} notice={notice} onDismissNotice={() => setNotice(null)} />
  </main>;
}
