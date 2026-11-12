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

## BUG-002 - Major - Màn hình tồn kho bị crash với lỗi `data is not defined`

| Dòng | Nội dung |
| --- | --- |
| 1. Mã và mức độ | **BUG-002 - Major**. Màn hình M1 không thể hiển thị danh sách tồn kho khi callback của `DataState` tham chiếu biến chưa được truyền vào. |
| 2. Phát hiện bởi | Kiểm thử giao diện TC-UI-01: đăng nhập quản lý trung tâm rồi tải lại màn hình danh sách tồn kho. |
| 3. Triệu chứng | React hiển thị `Uncaught ReferenceError: data is not defined`; người dùng không xem được tồn kho. |
| 4. Cách tái lập | Mở M1 với dữ liệu tồn kho hợp lệ trên phiên bản trước khi sửa; chờ API trả dữ liệu. |
| 5. Nguyên nhân | Hàm con của `DataState` khai báo không có tham số nhưng bên trong truyền `data` vào `PageControls`. |
| 6. Cách sửa | Nhận tham số `data` trong callback của `DataState`, rồi dùng đúng dữ liệu phản hồi để render bảng và phân trang. |
| 7. Commit và xác nhận | [35eab89](https://github.com/neoslvh/cdtn1-LuuVanHung-L5/commit/35eab895ac6dfc7c91d63a0d2f063db818a8b9bf) — tải lại M1 hiển thị tồn kho bình thường; `npm run test:all` PASS. |

## BUG-003 - Minor - Màn hình tồn kho hiển thị trùng hai thông báo lỗi kết nối

| Dòng | Nội dung |
| --- | --- |
| 1. Mã và mức độ | **BUG-003 - Minor**. Một lỗi kết nối API trên M1 bị hiển thị hai lần, làm người dùng khó xác định hành động cần làm. |
| 2. Phát hiện bởi | Kiểm thử giao diện TC-UI-02: ngắt API rồi tải trang danh sách tồn kho. |
| 3. Triệu chứng | Có hai khối đỏ cùng báo “Không kết nối được tới hệ thống” và hai nút “Thử lại”. |
| 4. Cách tái lập | Dừng API hoặc đặt API URL sai, sau đó mở M1 bằng trình duyệt. |
| 5. Nguyên nhân | Lỗi tải cảnh báo tồn thấp và lỗi tải danh sách tồn kho đều được render độc lập, dù có cùng nguyên nhân kết nối. |
| 6. Cách sửa | Gom lỗi chặn trang thành một `pageError`; khi lỗi này có mặt, chỉ render một `DataState` có nút thử lại. |
| 7. Commit và xác nhận | [5274f7f](https://github.com/neoslvh/cdtn1-LuuVanHung-L5/commit/5274f7f15083c8adfe37f6f1a0d72547dc74a36e) — M1 chỉ còn một thông báo lỗi và một nút “Thử lại”. |
