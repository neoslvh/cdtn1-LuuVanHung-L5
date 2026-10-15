# Nhật ký thay đổi thiết kế

## Sau phản hồi Bài tập 1 (buổi 8, ngày 15/10/2026)

### TD-01 — Bổ sung chú thích cho ERD

- Phản hồi của GV: ERD ở Mục 4.1 chưa có chú thích ký hiệu `PK`, `FK`, `UQ` và ký pháp lực lượng quan hệ `1 : 0..N`; vì vậy người đọc không thể tự đối chiếu đầy đủ sơ đồ.
- Quyết định: SỬA.
- Lý do: BT1 yêu cầu mọi sơ đồ có chú thích và ERD cần diễn đạt rõ khóa cùng bội số quan hệ để kiểm chứng mô hình dữ liệu độc lập.
- Ảnh hưởng: Bổ sung khối chú thích vào `docs/erd.drawio` và dòng chú thích ERD tại Mục 4.1 trong `docs/srs.md`.

### TD-02 — Nêu rõ ngoài phạm vi ở sơ đồ kiến trúc

- Phản hồi của GV: Mục 3 chưa ghi rõ phần **NGOÀI PHẠM VI** cạnh sơ đồ kiến trúc.
- Quyết định: SỬA.
- Lý do: Luồng L5 chỉ quản lý kho linh kiện; đăng nhập/xác thực, vòng đời phiếu bảo hành, nhà cung cấp, đặt mua, vận chuyển và chuyển kho không thuộc trách nhiệm của module này.
- Ảnh hưởng: Thêm nhãn “NGOÀI PHẠM VI L5” vào `docs/architecture.drawio` và đồng bộ nội dung tại Mục 3 của `docs/srs.md`.

### TD-03 — Thống nhất nguồn dữ liệu số lượng linh kiện đã dùng

- Phản hồi của GV: Ghi chú dưới wireframe nói số lượng đã dùng không lưu trùng ở `ticket_part`, nhưng bảng `ticket_part` lại có cột `quantity_used`.
- Quyết định: SỬA.
- Lý do: `ticket_part.quantity_used` là số lượng đã dùng hiện tại của từng linh kiện cho từng phiếu, phục vụ xem nhanh danh sách linh kiện đã xuất; `part_transaction` là lịch sử sự kiện nhập/xuất để truy vết. Hai bảng có trách nhiệm khác nhau, không được mô tả là nguồn dữ liệu mâu thuẫn.
- Ảnh hưởng: Đồng bộ BR5 trong `docs/srs.md`, ghi chú trong `docs/wireframe.drawio`, ERD/DDL `ticket_part.quantity_used` và mô tả truy vết của `part_transaction`.

### TD-04 — Bổ sung ngày cho cam kết sử dụng AI

- Phản hồi của GV: Dòng cam kết trong phụ lục AI chưa có ngày.
- Quyết định: SỬA.
- Lý do: Cam kết cần có mốc thời gian để xác định thời điểm sinh viên xác nhận trách nhiệm về nội dung nộp.
- Ảnh hưởng: Thêm dòng “Ngày cam kết: 09/10/2026” trong `docs/ai-disclosure.md` và phụ lục AI của báo cáo BT1 đã cập nhật.

## Kiểm tra nhất quán sau điều chỉnh

- SRS, ERD, kiến trúc, wireframe và DDL đều dùng thống nhất năm bảng: `part`, `part_stock`, `part_transaction`, `ticket`, `ticket_part`.
- `ticket_part.quantity_used` là dữ liệu tổng hợp theo phiếu và linh kiện; `part_transaction` là lịch sử giao dịch, trong đó giao dịch `OUT` bắt buộc gắn với `ticket_id`.
- Phạm vi L5 không quản lý vòng đời phiếu bảo hành; `ticket` chỉ là bảng tham chiếu tối thiểu để bảo đảm liên kết xuất linh kiện hợp lệ.
