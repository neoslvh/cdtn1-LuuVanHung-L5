# L5 - Hệ thống quản lý kho linh kiện thay thế

**Sinh viên:** Lưu Văn Hưng - 2374802010196 - Track SE

**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027
**Luồng nghiệp vụ:** L5 - Kho linh kiện thay thế

## 1. Mục tiêu

Hệ thống hỗ trợ quản lý trung tâm theo dõi tồn kho linh kiện theo từng trung tâm. Quản lý có thể ghi nhận nhập kho và xem tồn; kỹ thuật viên kiểm tra linh kiện trước khi xuất cho phiếu bảo hành. Sprint 1 hiện thực CRUD danh mục linh kiện để làm nền cho các nghiệp vụ tồn kho ở các sprint tiếp theo.

## 2. Yêu cầu môi trường

- Node.js 20 LTS và npm 10
- PostgreSQL 16
- Biến môi trường: xem `.env.example` (`DATABASE_URL`, `PORT`)

## 3. Hướng dẫn chạy

```bash
cp .env.example .env
npm install
npm run db:migrate && npm run db:seed
npm run dev
```

Mở `http://localhost:3000/health`. API linh kiện chạy tại `/api/parts`.

## 4. Cấu trúc thư mục

```text
docs/                 SRS, sơ đồ, API contract và nhật ký thay đổi thiết kế
migrations/           Migration PostgreSQL idempotent
seeds/                Dữ liệu mẫu chạy lặp lại được
src/routes/           Nhận/trả HTTP
src/services/         Quy tắc nghiệp vụ
src/repositories/     Truy cập dữ liệu PostgreSQL
src/validators/       Kiểm tra dữ liệu đầu vào
tests/                Unit test bằng node:test
```

## 5. Kiểm thử

```bash
npm test
```

Kết quả hiện tại: 4 unit test PASS cho `InventoryService` và validation linh kiện.

## 6. Trạng thái hiện tại (buổi 8)

- [x] Ghi nhận và xử lý phản hồi BT1 trong `docs/thay-doi-thiet-ke.md`
- [x] Dựng cấu trúc routes - services - repositories - validators theo kiến trúc
- [x] Migration và seed idempotent cho năm bảng L5
- [x] CRUD `/parts` qua ba lớp route - service - repository
- [x] Unit test đầu tiên cho service và validator
- [ ] Chạy migration/seed trên PostgreSQL cục bộ, gọi API thật và lưu ảnh kết quả vào `docs/`
- [ ] Hiện thực nghiệp vụ nhập/xuất kho và QT-09 không xuất vượt tồn
