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
| TC-08 (BR4, A01) | Phiếu bảo hành thuộc trung tâm 2; yêu cầu được thực hiện với `centerId=1`. | 1. Test tự tạo kho và phiếu ở trung tâm 2.<br>2. Gọi service xuất dưới ngữ cảnh trung tâm 1.<br>3. Kiểm tồn sau lỗi. | 1 linh kiện, số lượng xuất 1. | Không xuất được; không mở transaction; tồn kho trung tâm 2 không đổi và không lộ dữ liệu phiếu khác trung tâm. | Cao | Integration test `khong the xuat theo phieu cua trung tam khac` PASS; trả `TICKET_NOT_FOUND`, tồn trước/sau không đổi; fixture tự xóa sau test. | PASS |
| TC-09 (FR6) | Linh kiện 2 thuộc trung tâm 1, có 11 giao dịch. | 1. Xem lịch sử trang 2.<br>2. Kiểm linh kiện và dữ liệu trả về. | `part_id=2`, `page=2`, `size=10` | Chỉ trả lịch sử của linh kiện thuộc trung tâm; tổng = 11. | Trung bình | Test `lịch sử nhập xuất chỉ trả giao dịch của linh kiện thuộc trung tâm` PASS; trả đúng mã part và `total=11`. | PASS |
| TC-10 (BR4) | Part 99 không thuộc trung tâm 1. | 1. Xem lịch sử của part 99.<br>2. Quan sát phản hồi. | `part_id=99` | Không trả lịch sử linh kiện trung tâm khác. | Cao | Test `lịch sử nhập xuất từ chối linh kiện không thuộc trung tâm` PASS; trả `PART_NOT_FOUND`. | PASS |
| TC-11 (C8, tái lập) | PostgreSQL Docker đang chạy và dataset L5 đã được nạp một lần. | 1. Ghi số dòng của 5 bảng L5.<br>2. Chạy seed hai lần với cờ `--if-empty`.<br>3. So sánh số dòng sau mỗi lần. | `docker compose exec api npm run test:all` (hoặc chạy riêng `npm run db:verify:repeatable`) | Lần seed thứ hai không lỗi, không thêm bản ghi và số dòng của 5 bảng không đổi. | Cao | Chạy thật ngày 12/11/2026: trước/lần 1/lần 2 đều là `part=180`, `part_stock=123`, `ticket=95`, `ticket_part=95`, `part_transaction=200`; log `dataset_seed_repeatability_verified`. | PASS |
| TC-12 (NFR1, đồng thời) | PostgreSQL đang chạy; `.env` trỏ vào CSDL test/dev; test tự tạo fixture. | 1. Tạo tồn kho = 1 và hai phiếu cùng trung tâm.<br>2. Gửi đồng thời hai yêu cầu xuất mỗi yêu cầu 1 linh kiện.<br>3. Kiểm tồn và số giao dịch xuất. | `npm run test:integration` | Chỉ một yêu cầu thành công; yêu cầu còn lại nhận `INSUFFICIENT_STOCK`; tồn cuối = 0; chỉ có một giao dịch `OUT`. | Cao | Chạy thật ngày 10/11/2026: 1 test PASS; một yêu cầu bị từ chối `INSUFFICIENT_STOCK`, tồn cuối = 0 và có đúng 1 giao dịch `OUT`. Fixture được tự xóa sau test. | PASS |

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
- `docs/screenshots/TC-11-seed-chay-lai-khong-nhan-doi.jpg`
- `docs/screenshots/TC-12-xuat-dong-thoi-khong-am.jpg`

## Minh chứng C8 — seed chạy lại không nhân đôi dữ liệu

TC-11 là phép thử tái lập nằm trong 12 test case. Khi Docker Desktop hoạt động, chạy `docker compose exec api npm run db:verify:repeatable` trên volume đã được nạp dataset. Lưu ảnh `docs/screenshots/TC-11-seed-chay-lai-khong-nhan-doi.jpg` cho số lượng bản ghi trước/sau.

## Minh chứng C1 — chạy lại trên volume Docker mới

Ngày 12/11/2026, hệ thống được dựng bằng một Compose project cách ly (`l5-clean-check`) với volume PostgreSQL mới và cổng host `3010`/`5180`, không dùng dữ liệu Docker đang có. `db`, `api`, `web` đều ở trạng thái `healthy`; `GET http://localhost:3010/health` trả `{"status":"ok","db":"ok"}`. Trong container mới, `npm run test:all` PASS 36 unit/API test và 2 integration test; `npm run db:verify:repeatable` cũng PASS. Khi đóng gói PDF, chèn ảnh terminal tại `docs/screenshots/C1-compose-volume-moi.jpg`.
