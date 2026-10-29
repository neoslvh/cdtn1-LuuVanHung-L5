# Bảng khai báo sử dụng công cụ AI

| Công cụ | Phần áp dụng | Cách dùng | Em đã chỉnh sửa / kiểm chứng như thế nào |
| --- | --- | --- | --- |
| ChatGPT | Mục 1.3 - Functional Requirements, User Story và Acceptance Criteria | Yêu cầu rà soát User Story theo INVEST, gán MoSCoW và viết lại Acceptance Criteria theo GIVEN-WHEN-THEN cho các story MUST. | Đối chiếu với phạm vi L5 và Case Study; giữ 7 User Story, 3 MUST; tự điều chỉnh câu chữ, mức ưu tiên và các luồng ngoại lệ trước khi đưa vào SRS. |
| ChatGPT | Mục 3 - Thiết kế kiến trúc | Yêu cầu rà soát kiến trúc phân lớp và các lập luận theo khuôn “Vì NFRx yêu cầu..., tôi chọn..., đánh đổi là...”. | Đối chiếu NFR1-NFR4 trong SRS; giữ kiến trúc React/Express/Repository/PostgreSQL và chỉnh bốn lập luận để mỗi câu gắn một NFR cụ thể. |
| Gemini | Mục 5 - Wireframe | Yêu cầu rà soát ba màn hình chính, bổ sung vùng minh họa luồng ngoại lệ và kiểm tra field hiển thị khớp Use Case/ERD. | Tự chỉnh lại bố cục Draw.io, đối chiếu các field với mô hình dữ liệu và chức năng trong SRS. |
| ChatGPT | BT2 - Hiện thực module quản lý kho | Hỗ trợ đề xuất cấu trúc routes → services → repositories; viết nháp validator, API contract và các chức năng xem tồn, nhập kho, kiểm tra tồn, xuất linh kiện theo phiếu bảo hành. | Tự chạy migration và seed; tự sửa mã để luồng nhập hợp lệ tăng tồn, nhập số lượng 0 bị từ chối; luồng xuất đủ tồn thành công, xuất vượt tồn bị từ chối và giữ nguyên tồn. Đối chiếu kết quả với US2, US4, US5 trong SRS. |
| ChatGPT | BT2 - Kiểm thử và xử lý lỗi | Hỗ trợ đề xuất các test cho luồng đúng, dữ liệu biên, dữ liệu không hợp lệ; gợi ý logger JSON, requestId và middleware lỗi tập trung. | Tự chạy `npm test`; tự sửa validation, điều kiện cảnh báo tồn thấp và rollback để các test luồng đúng, biên và dữ liệu sai PASS. Kiểm tra lỗi hệ thống không trả stack trace hoặc thông tin kết nối cơ sở dữ liệu cho giao diện. |
| ChatGPT | BT2 - Giao diện React | Hỗ trợ xây dựng các màn hình tồn kho, nhập linh kiện, xuất linh kiện, lịch sử giao dịch; gợi ý phân trang, sắp xếp, tìm kiếm và ba trạng thái đang tải/rỗng/lỗi. | Tự kiểm tra các luồng trên trình duyệt: chọn linh kiện → kiểm tra tồn → xuất; nhập thành công quay về danh sách; tìm kiếm/lọc không có kết quả; lỗi kết nối có nút Thử lại. Tự chỉnh nội dung thông báo và bố cục. |
| ChatGPT | BT2 - Docker, README và báo cáo | Hỗ trợ rà soát Docker Compose, `.env.example`, hướng dẫn dựng lại hệ thống, nội dung báo cáo và caption ảnh minh chứng. | Tự chạy lại theo README trên môi trường Docker, kiểm tra API, frontend và dữ liệu seed; không đưa `.env` hay secret vào repository. Tự chụp, chọn và gắn ảnh theo đúng từng luồng trong báo cáo. |
| Tự thực hiện | Toàn bộ bài nộp | Chọn phạm vi L5, quyết định MoSCoW, chỉnh sơ đồ Draw.io, kiểm tra tính nhất quán và chịu trách nhiệm nội dung. | Tự kiểm theo checklist BT1 và peer review trước khi nộp. |

Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp.

**Họ tên:** Lưu Văn Hưng<br>
**MSSV:** 2374802010196<br>
**Ngày:** 29/10/2026
