# Test Plan — Luồng L5: Kho linh kiện thay thế (Track SE)

## 1. Phạm vi kiểm thử

Kiểm thử các quy tắc và luồng nghiệp vụ đã hiện thực cho kho linh kiện tại một trung tâm:

- Nhập linh kiện và tăng tồn kho (FR2, US2).
- Kiểm tra tồn trước khi xuất (FR3, US3).
- Xuất một hoặc nhiều linh kiện cho phiếu bảo hành; không xuất vượt tồn; rollback khi thất bại (FR4, US4, BR1, BR2).
- Cảnh báo tồn thấp sau giao dịch và trường hợp tồn bằng ngưỡng (FR5, US5, BR3).
- Phạm vi dữ liệu theo trung tâm và lịch sử nhập/xuất (FR6, BR4).
- Phân trang, kiểm tra dữ liệu đầu vào và khả năng chạy lại migration/seed.

Chủ ý **không kiểm**: tải hiệu năng 10.000 bản ghi, bảo mật xâm nhập, đăng nhập/JWT thật và giao diện trên mọi trình duyệt. Các nội dung này chưa thuộc phạm vi prototype hoặc thuộc giai đoạn Chuyên đề tốt nghiệp 2. Kiểm thử giao diện chỉ xác minh các luồng nghiệp vụ chính qua API và màn hình React.

## 2. Loại test và số lượng mỗi tầng

| Tầng / loại | Số lượng trong Test Report | Kỹ thuật và phạm vi |
| --- | ---: | --- |
| Unit test service/validator | 7 | Kiểm quy tắc nhập, xuất, rollback, cảnh báo, dữ liệu đầu vào bằng `node:test`. |
| Integration test PostgreSQL | 2 | Chạy migration/seed lặp lại và kiểm tác dụng phụ dữ liệu kho. |
| API/UI test | 3 | Kiểm phản hồi lỗi, xác thực và giới hạn dữ liệu theo trung tâm qua API hoặc giao diện. |

Kỹ thuật chọn dữ liệu: phân vùng tương đương cho dữ liệu hợp lệ/không hợp lệ; giá trị biên tại `quantity = min_threshold` và `quantity_requested = quantity`; kiểm tra tác dụng phụ trước/sau giao dịch.

Mười hai test case được phân bố đủ năm loại bắt buộc:

- Luồng đúng: TC-01, TC-04, TC-09.
- Giá trị biên: TC-04, TC-05, TC-07.
- Dữ liệu sai: TC-02, TC-03, TC-11.
- Bảo mật/chất lượng dữ liệu: TC-08, TC-10.
- Tính tái lập: TC-12.

## 3. Tiêu chí thành công đo được

- Có 12 test case với đủ tám cột; mỗi quy tắc BR1–BR4 đã hiện thực có ít nhất một test luồng đúng hoặc vi phạm.
- Toàn bộ test case được chạy thật, có kết quả thực tế, ảnh minh chứng và trạng thái PASS/FAIL trung thực.
- Lệnh `npm test` PASS toàn bộ test tự động.
- Không còn bug Critical đang mở; bug Major còn lại (nếu có) phải có lý do và hướng xử lý trong Bug Log.
- Migration và seed chạy lại lần hai không lỗi, không làm nhân đôi dữ liệu.

## 4. Môi trường và dữ liệu thử

- Môi trường: Windows 11, Node.js 20, PostgreSQL 16 hoặc Docker Compose của repository.
- Test tự động: `npm test` tại thư mục gốc.
- Dữ liệu: dữ liệu demo/dataset được nạp bởi `npm run db:migrate`, `npm run db:seed` hoặc Docker Compose. Test API/UI sử dụng tài khoản demo theo vai trò quản lý trung tâm và kỹ thuật viên.
- Trước test có làm thay đổi dữ liệu, ghi lại số lượng tồn ban đầu hoặc dựng lại dữ liệu bằng migration/seed để kết quả không phụ thuộc lần chạy trước.
- Ảnh minh chứng lưu tại `docs/screenshots/` theo tên `TC-xx-<mo-ta>.jpg` hoặc `.png`.
