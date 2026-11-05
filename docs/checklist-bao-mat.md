# Checklist bảo mật — L5 Kho linh kiện thay thế

> Trạng thái chỉ được ghi **ĐÃ LÀM** khi có minh chứng ở cột cuối. Mục chưa kiểm hoặc không áp dụng được ghi trung thực để hoàn thiện trước BT3.

## A. Tự kiểm năm mục OWASP Top 10:2025 của Buổi 13

| Mục | Trạng thái | Cách kiểm / kết quả | Minh chứng |
| --- | --- | --- | --- |
| A01 — Broken Access Control | CHƯA KIỂM ĐỦ | Source giới hạn dữ liệu theo `centerId`; đã có unit test từ chối ticket/part ngoài trung tâm. Chưa có tài khoản demo và fixture trung tâm 2 để chạy API thật giữa hai trung tâm. | `tests/stock-transaction.service.logic.test.js`; cần bổ sung API test cross-center. |
| A02 — Security Misconfiguration | ĐÃ KIỂM MỘT PHẦN | API test token thiếu trả `401`; response không chứa stack, PostgreSQL hay connection string. CORS chỉ phản hồi origin thuộc danh sách cho phép trong `src/app.js`. | `tests/stock-api.test.js`; `src/app.js`; cần chụp ảnh/lệnh chạy khi nộp. |
| A04 — Cryptographic Failures | KHÔNG ÁP DỤNG | Prototype không có bảng người dùng, không lưu hay xác minh mật khẩu; chỉ có token demo cố định cho mục đích học tập. | `src/middleware/auth-context.js`; schema không có cột password. |
| A05 — Injection | CHƯA KIỂM | Cần gọi tìm kiếm tồn kho với `' OR 1=1 --` và `<script>alert(1)</script>`, xác nhận không trả toàn bộ dữ liệu và giao diện không thực thi script. | Sẽ lưu request/ảnh tại `docs/screenshots/`. |
| A07 — Authentication Failures | ĐÃ KIỂM MỘT PHẦN | Gọi API không gửi token trả `401`; cần chạy thêm token sai qua API Docker và chụp ảnh. | `tests/stock-api.test.js`; `docs/api-tests.http`. |

## B. Checklist bảo mật bảy mục của BT3

| Mục | Trạng thái | Minh chứng hoặc việc còn lại |
| --- | --- | --- |
| 1. Không có secret trong repo | CHƯA KIỂM LỊCH SỬ | `.env` đã nằm trong `.gitignore`; trước khi nộp cần chạy `git log --all -- .env` và kiểm tra kết quả. |
| 2. Dữ liệu vào được kiểm ở tầng ứng dụng | ĐÃ LÀM | Validator kiểm `part_id`, `quantity`, pagination, sort và payload xuất; xem `src/validators/`. |
| 3. Kiểm soát truy cập theo chủ sở hữu/trung tâm | CHƯA KIỂM ĐỦ | Middleware có role/centerId; cần API test trung tâm A truy cập dữ liệu trung tâm B. |
| 4. Mật khẩu và dữ liệu nhạy cảm được bảo vệ | KHÔNG ÁP DỤNG | Không lưu mật khẩu hay dữ liệu người dùng trong phạm vi L5; logger che token, password và chuỗi kết nối nếu xuất hiện. |
| 5. Error response không lộ nội bộ | ĐÃ LÀM | Middleware trả response tổng quát cho `500`; API test kiểm response `401` không có stack/connection string. |
| 6. Log không ghi secret/dữ liệu cá nhân không cần thiết | ĐÃ LÀM | `src/logger.js` che password, token, số điện thoại, DSN và URL kết nối; có test redaction. |
| 7. Phụ thuộc được ghim phiên bản và đã kiểm cảnh báo cơ bản | CHƯA KIỂM ĐỦ | Có `package-lock.json`; cần chạy `npm audit` và ghi kết quả trước khi nộp. |
