# Checklist bảo mật — L5 Kho linh kiện thay thế

> Trạng thái chỉ được ghi **ĐÃ LÀM** khi có minh chứng ở cột cuối. Mục chưa kiểm hoặc không áp dụng được ghi trung thực để hoàn thiện trước BT3.

## A. Tự kiểm năm mục OWASP Top 10:2025 của Buổi 13

| Mục | Trạng thái | Cách kiểm / kết quả | Minh chứng |
| --- | --- | --- | --- |
| A01 — Broken Access Control | ĐÃ KIỂM | Service kiểm `ticket.center_id = auth.centerId` trước khi mở transaction; integration test tạo phiếu ở trung tâm 2 và xác nhận trung tâm 1 nhận `TICKET_NOT_FOUND`, tồn kho không đổi. | `tests/stock-concurrency.integration.js` — test `khong the xuat theo phieu cua trung tam khac`. |
| A02 — Security Misconfiguration | ĐÃ KIỂM | API test token thiếu hoặc sai trả `401`; response không chứa stack, PostgreSQL hay connection string. CORS chỉ nhận origin nằm trong `CORS_ORIGINS`. | `tests/stock-api.test.js`; `src/app.js`; `.env.example`. |
| A04 — Cryptographic Failures | KHÔNG ÁP DỤNG | Prototype không có bảng người dùng, không lưu hay xác minh mật khẩu; chỉ có token demo cố định cho mục đích học tập. | `src/middleware/auth-context.js`; schema không có cột password. |
| A05 — Injection | ĐÃ KIỂM | Test truyền payload `' OR 1=1 --` vào tìm kiếm kho; payload chỉ nằm trong mảng values ở vị trí `$3`, không được chèn vào câu SQL. React render chuỗi tìm kiếm như văn bản, không dùng `dangerouslySetInnerHTML`. | `tests/stock-repository.security.test.js`; `src/repositories/stock.repository.js`. |
| A07 — Authentication Failures | ĐÃ KIỂM | API không gửi token và token sai đều trả `401` với thông báo an toàn. Đây là xác thực demo của prototype, không phải JWT/đăng nhập production. | `tests/stock-api.test.js`; `src/middleware/auth-context.js`. |

## B. Checklist bảo mật bảy mục của BT3

| Mục | Trạng thái | Minh chứng hoặc việc còn lại |
| --- | --- | --- |
| 1. Không có secret trong repo | ĐÃ KIỂM | `.env` có trong `.gitignore`; `git log --all -- .env` không trả commit nào. `.env.example` chỉ chứa giá trị mẫu local. |
| 2. Dữ liệu vào được kiểm ở tầng ứng dụng | ĐÃ LÀM | Validator kiểm `part_id`, `quantity`, pagination, sort và payload xuất; xem `src/validators/`. |
| 3. Kiểm soát truy cập theo chủ sở hữu/trung tâm | ĐÃ KIỂM | Service xác minh phiếu và kho theo `centerId`; integration test cross-center từ chối xuất và giữ nguyên tồn. |
| 4. Mật khẩu và dữ liệu nhạy cảm được bảo vệ | KHÔNG ÁP DỤNG | Không lưu mật khẩu hay dữ liệu người dùng trong phạm vi L5; logger che token, password và chuỗi kết nối nếu xuất hiện. |
| 5. Error response không lộ nội bộ | ĐÃ LÀM | Middleware trả response tổng quát cho `500`; API test kiểm response `401` không có stack/connection string. |
| 6. Log không ghi secret/dữ liệu cá nhân không cần thiết | ĐÃ LÀM | `src/logger.js` che password, token, số điện thoại, DSN và URL kết nối; có test redaction. |
| 7. Phụ thuộc được ghim phiên bản và đã kiểm cảnh báo cơ bản | ĐÃ KIỂM | Có `package-lock.json`; chạy `npm audit --omit=dev` ngày 10/11/2026 sau khi cập nhật dependency: `found 0 vulnerabilities`. |
