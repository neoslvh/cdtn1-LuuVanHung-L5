# L5 - Hệ thống quản lý kho linh kiện thay thế

**Sinh viên:**<br>
Lưu Văn Hưng - 2374802010196 - Track SE

**Học phần:**<br>
Chuyên đề Tốt nghiệp 1, HK1 2026-2027

**Luồng nghiệp vụ:**<br>
L5 - Kho linh kiện thay thế

## 1. Mục tiêu

Hệ thống hỗ trợ quản lý trung tâm theo dõi tồn kho linh kiện tại trung tâm mình phụ trách. Quản lý có thể ghi nhận nhập kho, xem tồn thấp và lịch sử nhập - xuất. Kỹ thuật viên kiểm tra tồn, xuất linh kiện cho phiếu bảo hành và xem linh kiện đã sử dụng. Mục tiêu là giảm tình trạng phát hiện thiếu linh kiện sau khi đã tiếp nhận phiếu bảo hành.

## 2. Yêu cầu môi trường

- Node.js 20 LTS
- PostgreSQL 16
- Biến môi trường: xem [.env.example](.env.example)

## 3. Hướng dẫn chạy

Phần hiện thực và migration PostgreSQL sẽ được bổ sung ở BT2. Hiện có smoke test:

```bash
npm install
npm run dev
```

Mở `http://localhost:3000/health` để kiểm tra dịch vụ.

## 4. Cấu trúc thư mục

```text
docs/       SRS, sơ đồ Draw.io, wireframe, API contract và khai báo AI
db/         SQL DDL skeleton PostgreSQL
src/        Mã nguồn ứng dụng
tests/      Kiểm thử tự động
```

## 5. Kiểm thử

Chưa có test tự động ở BT1. `npm test` sẽ được cập nhật để hiển thị số test PASS trong BT2.

## 6. Trạng thái hiện tại

- [x] Khởi tạo project, smoke test `/health` chạy được (buổi 2)
- [x] Hoàn thành SRS, Use Case, kiến trúc, ERD/DDL, wireframe và API contract (BT1)
- [ ] Module quản lý kho linh kiện (BT2)
- [ ] Migration PostgreSQL và kiểm thử tự động (BT2)
