# Bug Log

## BUG-001 - Major - Danh sach ton kho tra ve qua nhieu dong khi tham so phan trang khong hop le

| Dòng | Nội dung |
| --- | --- |
| 1. Mã và mức độ | **BUG-001 - Major**. Quản lý trung tâm khó tra cứu kho khi danh sách lớn vì yêu cầu phân trang không được kiểm tra thống nhất. |
| 2. Phát hiện bởi | Kiểm thử API `GET /api/part-stocks` khi bổ sung giao diện xem tồn kho. |
| 3. Triệu chứng | API có thể nhận `page` hoặc `size` không hợp lệ; giao diện không có quy ước phân trang ổn định. |
| 4. Cách tái lập | Gọi `GET /api/part-stocks?page=0&size=101` bằng token hợp lệ của quản lý trung tâm. |
| 5. Nguyên nhân | Route chưa dùng một validator chung để ép kiểu, đặt giá trị mặc định và giới hạn `page`, `size` trước khi gọi tầng nghiệp vụ. |
| 6. Cách sửa | Thêm `validatePagination()`; đặt mặc định `page=1`, `size=10`, từ chối giá trị ngoài phạm vi và dùng kết quả đã kiểm tra trong route/service. |
| 7. Commit và xác nhận | [c2f5864](https://github.com/neoslvh/cdtn1-LuuVanHung-L5/commit/c2f5864) - chạy `npm test`, gồm test `phân trang từ chối page hoặc size không hợp lệ`, PASS. |
