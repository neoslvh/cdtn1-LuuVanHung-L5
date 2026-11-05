# Test Report — Luồng L5: Kho linh kiện thay thế (Track SE)

| Mã | Tiền điều kiện | Các bước thực hiện | Dữ liệu thử | Kết quả mong đợi | Ưu tiên | Kết quả thực tế | PASS / FAIL |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-01 (US2, BR1) | Tồn linh kiện là 5. | 1. Gọi `receive`.<br>2. Ghi nhận tồn sau giao dịch. | `part_id=2`, `quantity=4` | Tạo giao dịch `IN`; tồn tăng từ 5 lên 9; transaction commit. | Cao | Test `nhập kho tăng tồn và ghi giao dịch IN trong cùng transaction` chạy qua `npm test`: `stock_before=5`, `stock_after=9`, type `IN`, `BEGIN` → `COMMIT`. | PASS |
| TC-02 (AC2.2) | Có token quản lý trung tâm; không cần truy cập CSDL vì dữ liệu bị chặn ở validator. | 1. `POST /api/stock-receipts`.<br>2. Quan sát HTTP response. | `part_id=1`, `quantity=0` | Trả `400`; `VALIDATION_FAILED`; thông báo nêu số lượng phải lớn hơn 0; không tạo giao dịch nhập. | Cao | API test PASS: HTTP `400`, `error.code=VALIDATION_FAILED`, `fields.quantity` chứa “lớn hơn 0”. | PASS |
| TC-03 (AC2.3) | Có token quản lý trung tâm; không cần truy cập CSDL vì dữ liệu bị chặn ở validator. | 1. `POST /api/stock-receipts` không có `part_id`.<br>2. Quan sát HTTP response. | `quantity=1` | Trả `400`; `VALIDATION_FAILED`; thông báo linh kiện bắt buộc; không tạo giao dịch. | Cao | API test PASS: HTTP `400`, `error.code=VALIDATION_FAILED`, `fields.part_id=Linh kiện là thông tin bắt buộc.` | PASS |
| TC-04 (AC4.1, AC5.3) | Tồn = 2, ngưỡng = 1; phiếu thuộc cùng trung tâm. | 1. Xuất 2 linh kiện.<br>2. Kiểm tồn và cảnh báo. | `ticket_id=7`, `part_id=1`, `quantity=2` | Xuất thành công; tồn về 0; phát cảnh báo tồn thấp. | Cao | Test `xuất đúng bằng tồn được chấp nhận và tạo cảnh báo khi tồn sau xuất thấp` PASS; tồn sau xuất = 0, có 1 cảnh báo, `BEGIN` → `COMMIT`. | PASS |
| TC-05 (AC4.2, BR2) | Tồn = 1. | 1. Yêu cầu xuất 2 linh kiện.<br>2. Kiểm tồn và transaction. | `ticket_id=7`, `part_id=1`, `quantity=2` | Từ chối; tồn không đổi; rollback toàn bộ. | Cao | Test `xuất vượt tồn bị từ chối và rollback toàn bộ giao dịch` PASS; trả `INSUFFICIENT_STOCK`, `BEGIN` → `ROLLBACK`. | PASS |
| TC-06 (UC4-7a, NFR2) | Part 1 tồn = 5; part 2 tồn = 1. | 1. Yêu cầu xuất hai linh kiện.<br>2. Dòng part 2 vượt tồn.<br>3. Kiểm các cập nhật đã gọi. | Part 1: 2; part 2: 2 | Cả giao dịch bị từ chối; không cập nhật một phần cho part 1. | Cao | Test `xuất nhiều linh kiện rollback tất cả khi chỉ một dòng không đủ tồn` PASS; không có part nào bị cập nhật; transaction rollback. | PASS |
| TC-07 (AC5.2) | Tồn = 4, ngưỡng = 3. | 1. Xuất 1 linh kiện.<br>2. Kiểm cảnh báo. | `ticket_id=7`, `part_id=1`, `quantity=1` | Tồn sau xuất bằng 3; không phát cảnh báo. | Trung bình | Test `xuất làm tồn bằng ngưỡng thì không phát cảnh báo` PASS; tồn sau xuất = 3, danh sách cảnh báo rỗng. | PASS |
| TC-08 (BR4, A01) | Kỹ thuật viên thuộc trung tâm 1; phiếu 99 không thuộc trung tâm hoặc không tồn tại ở trung tâm 1. | 1. Gửi yêu cầu xuất với phiếu 99.<br>2. Quan sát lỗi. | `ticket_id=99`, `items=[{part_id:1, quantity:1}]` | Không xuất được; không mở transaction; không lộ dữ liệu phiếu khác trung tâm. | Cao | Unit test scope PASS: trả `TICKET_NOT_FOUND`, không chạy transaction. API test vai trò cũng PASS: quản lý gọi xuất linh kiện nhận HTTP `403`. Cần bổ sung API test trung tâm A/B thật để hoàn tất A01. | PASS có điều kiện |
| TC-09 (FR6) | Linh kiện 2 thuộc trung tâm 1, có 11 giao dịch. | 1. Xem lịch sử trang 2.<br>2. Kiểm linh kiện và dữ liệu trả về. | `part_id=2`, `page=2`, `size=10` | Chỉ trả lịch sử của linh kiện thuộc trung tâm; tổng = 11. | Trung bình | Test `lịch sử nhập xuất chỉ trả giao dịch của linh kiện thuộc trung tâm` PASS; trả đúng mã part và `total=11`. | PASS |
| TC-10 (BR4) | Part 99 không thuộc trung tâm 1. | 1. Xem lịch sử của part 99.<br>2. Quan sát phản hồi. | `part_id=99` | Không trả lịch sử linh kiện trung tâm khác. | Cao | Test `lịch sử nhập xuất từ chối linh kiện không thuộc trung tâm` PASS; trả `PART_NOT_FOUND`. | PASS |
| TC-11 (dữ liệu sai) | API danh sách tồn kho đang hoạt động. | 1. Gọi API với phân trang sai.<br>2. Quan sát lỗi. | `page=0`, `size=101` | Từ chối với lỗi validation; không trả danh sách không giới hạn. | Trung bình | Test `phân trang từ chối page hoặc size không hợp lệ` PASS; lỗi có chi tiết cho `page` và `size`. | PASS |
| TC-12 (tái lập) | CSDL test hoặc Docker volume có thể xóa an toàn. | 1. Chạy migration + seed lần 1.<br>2. Ghi số bản ghi.<br>3. Chạy lại lần 2.<br>4. So sánh kết quả. | `npm run db:migrate`; `npm run db:seed` (hoặc Docker Compose) | Lần 2 không lỗi và không nhân đôi dữ liệu. | Cao | **CHƯA CHẠY.** Cần chạy trên PostgreSQL/Docker sạch, lưu ảnh terminal và số bản ghi trước/sau. | CHƯA CHẠY |

## Minh chứng cần bổ sung trước khi nộp BT3

- `docs/screenshots/TC-01-nhap-kho-thanh-cong.jpg`
- `docs/screenshots/TC-02-nhap-so-luong-bang-0.jpg`
- `docs/screenshots/TC-03-thieu-linh-kien.jpg`
- `docs/screenshots/TC-04-xuat-dung-bang-ton.jpg`
- `docs/screenshots/TC-05-xuat-vuot-ton-rollback.jpg`
- `docs/screenshots/TC-06-xuat-nhieu-linh-kien-rollback.jpg`
- `docs/screenshots/TC-07-ton-bang-nguong.jpg`
- `docs/screenshots/TC-08-phieu-khac-trung-tam.jpg`
- `docs/screenshots/TC-09-lich-su-nhap-xuat.jpg`
- `docs/screenshots/TC-10-lich-su-khac-trung-tam.jpg`
- `docs/screenshots/TC-11-phan-trang-khong-hop-le.jpg`
- `docs/screenshots/TC-12-seed-khong-nhan-doi.jpg`
