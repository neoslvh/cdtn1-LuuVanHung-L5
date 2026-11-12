# Bảng khai báo sử dụng công cụ AI

| Công cụ | Phần áp dụng | Cách dùng | Kiểm chứng |
| --- | --- | --- | --- |
| ChatGPT | Mục 1.3 - Functional Requirements, User Story và Acceptance Criteria | Yêu cầu rà soát User Story theo INVEST, gán MoSCoW và viết lại Acceptance Criteria theo GIVEN-WHEN-THEN cho các story MUST. | Đối chiếu Case Study với `docs/srs.md`; tự chốt 7 User Story, trong đó có 3 MUST. Đặc tả GWT của US2, US4 và US5 được kiểm lại qua bảng truy vết và Use Case. |
| ChatGPT | Mục 3 - Thiết kế kiến trúc | Yêu cầu rà soát kiến trúc phân lớp và các lập luận theo khuôn “Vì NFRx yêu cầu..., tôi chọn..., đánh đổi là...”. | Đối chiếu NFR1-NFR4 trong `docs/srs.md` với `docs/architecture.drawio`; kiểm tra source có các thư mục `src/routes`, `src/services`, `src/repositories` tương ứng ba lớp. |
| Gemini | Mục 5 - Wireframe | Yêu cầu rà soát ba màn hình chính, bổ sung vùng minh họa luồng ngoại lệ và kiểm tra field hiển thị khớp Use Case/ERD. | Tự chỉnh `docs/wireframe.drawio`; đối chiếu field với `docs/erd.drawio` và kiểm tra ba màn hình React: tồn kho, nhập linh kiện, xuất linh kiện theo phiếu. |
| ChatGPT | BT2 - Hiện thực module quản lý kho | Hỗ trợ đề xuất cấu trúc routes → services → repositories; viết nháp validator, API contract và các chức năng xem tồn, nhập kho, kiểm tra tồn, xuất linh kiện theo phiếu bảo hành. | Chạy migration/seed và `npm run test:all`; đối chiếu `docs/srs.md` với `src/services/stock-transaction.service.js`. Xác nhận US2, US4, US5 bằng các TC-01 đến TC-07 trong `docs/test-report.md`. |
| ChatGPT | BT2 - Kiểm thử và xử lý lỗi | Hỗ trợ đề xuất các test cho luồng đúng, dữ liệu biên, dữ liệu không hợp lệ; gợi ý logger JSON, requestId và middleware lỗi tập trung. | Chạy `npm test`; kiểm tra test rollback, cảnh báo ngưỡng, dữ liệu sai và logger redaction PASS. Đối chiếu `src/logger.js`, middleware lỗi và `docs/checklist-bao-mat.md` để xác nhận response không lộ stack hay chuỗi kết nối. |
| ChatGPT | BT2 - Giao diện React | Hỗ trợ xây dựng các màn hình tồn kho, nhập linh kiện, xuất linh kiện, lịch sử giao dịch; gợi ý phân trang, sắp xếp, tìm kiếm và ba trạng thái đang tải/rỗng/lỗi. | Tự thao tác trên frontend: nhập kho thành công, kiểm tra tồn trước xuất, xuất đủ/thiếu tồn, tìm kiếm không có kết quả và lỗi kết nối có nút Thử lại. Ảnh minh chứng lưu trong `docs/screenshots/`. |
| ChatGPT | BT2 - Docker, README và báo cáo | Hỗ trợ rà soát Docker Compose, `.env.example`, hướng dẫn dựng lại hệ thống, nội dung báo cáo và caption ảnh minh chứng. | Dựng lại bằng `docker compose up -d --build`; kiểm tra `docker compose ps`, `curl http://localhost:3000/health` và dữ liệu seed. Đối chiếu hướng dẫn trong `README.md` và `docs/deployment-guide.md`; `.env` không được commit. |
| ChatGPT | BT3 - Kế hoạch, báo cáo kiểm thử và Bug Log | Hỗ trợ lập Test Plan/Test Report theo năm loại test, rà soát 3 Bug Log theo mẫu bảy dòng và đề xuất lệnh chạy test tái lập/đồng thời. | Đối chiếu từng test với US2, US4, US5, BR1-BR4 và QT-09 trong `docs/test-plan.md`/`docs/test-report.md`. Chạy `npm run test:all`; kiểm tra 12 TC PASS, 36 unit/API test và 2 integration test PASS; kiểm tra link commit trong `docs/bug-log.md`. |
| ChatGPT | BT3 - Đóng gói và tài liệu kỹ thuật | Hỗ trợ viết nháp Deployment Guide, checklist bảo mật, API reference tiếng Anh và cấu hình Docker/biến môi trường. | Chạy Docker trên volume mới, health check, seed lặp lại và test:all; đối chiếu endpoint thật với `docs/api-docs/api-reference.md`. Kiểm tra từng mục trong `docs/checklist-bao-mat.md` trước khi chụp minh chứng C1, TC-11 và TC-12. |
| Tự thực hiện | Toàn bộ bài nộp | Chọn phạm vi L5, quyết định MoSCoW, chỉnh sơ đồ Draw.io, kiểm tra tính nhất quán và chịu trách nhiệm nội dung. | Tự rà soát source, docs, lệnh Docker, kết quả test và ảnh minh chứng; chỉ nộp nội dung đã được chạy hoặc đối chiếu lại. |

Tôi xác nhận đã đọc, hiểu và chịu trách nhiệm về toàn bộ nội dung nộp.

**Họ tên:** Lưu Văn Hưng<br>
**MSSV:** 2374802010196<br>
**Ngày:** 12/11/2026
