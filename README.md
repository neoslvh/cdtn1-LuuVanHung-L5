# L5 - Hệ thống quản lý kho linh kiện thay thế

**Sinh viên:** Lưu Văn Hưng - 2374802010196 - Track SE

**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027
**Luồng nghiệp vụ:** L5 - Kho linh kiện thay thế

## 1. Mục tiêu

Hệ thống hỗ trợ quản lý trung tâm theo dõi tồn kho linh kiện theo từng trung tâm. Quản lý có thể ghi nhận nhập kho và xem tồn; kỹ thuật viên kiểm tra linh kiện trước khi xuất cho phiếu bảo hành. Sprint 2 kết nối ba màn hình React với API thật cho luồng xem tồn → nhập/xuất → cập nhật tồn và cảnh báo tồn thấp.

## 2. Yêu cầu môi trường

- Node.js 20 LTS và npm 10 (Node 18+ vẫn chạy được ở mức prototype)
- PostgreSQL 16+
- Biến môi trường: xem `.env.example` (`DATABASE_URL`, `PORT`, `LOG_LEVEL`)

## 3. Hướng dẫn chạy

Mở hai terminal, mỗi lệnh một dòng:

```bash
copy .env.example .env
npm install
npm run db:migrate && npm run db:seed
npm run dev
```

### Nạp dataset Smart CRM cho L5

Repository có sẵn dữ liệu mẫu trong `data/sample/`, đủ liên kết để kiểm thử luồng L5. Script seed chỉ sử dụng bộ dữ liệu này.

```bash
npm run db:migrate
npm run db:seed:dataset -- --reset
```

Lệnh dataset nạp linh kiện, tồn kho, phiếu tham chiếu và lịch sử nhập/xuất. Tham số `--reset` là bắt buộc vì lệnh sẽ thay thế toàn bộ dữ liệu năm bảng L5 trên cơ sở dữ liệu cục bộ.

Có thể kiểm tra liên kết khóa của dataset mà không thay đổi cơ sở dữ liệu:

```bash
npm run db:seed:dataset -- --validate
```

```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

Mở `http://localhost:5173`. Backend chạy tại `http://localhost:3000`; kiểm tra sức khoẻ tại `/health`.
Giao diện có hai tài khoản demo: **Quản lý trung tâm** (xem tồn, nhập) và **Kỹ thuật viên** (xem tồn, xuất theo phiếu). Đây là token prototype, không dùng cho môi trường thật.

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
frontend/src/api/     Lớp gọi API duy nhất
frontend/src/pages/   Ba màn hình React theo wireframe M1–M3
frontend/src/components/  Thành phần dùng lại, gồm DataState
```

## 5. Kiểm thử

```bash
npm test
```

Kết quả hiện tại: 8 unit test PASS cho service, validation và hợp đồng dữ liệu tồn kho.

## 6. Trạng thái hiện tại (buổi 10)

- [x] Ghi nhận và xử lý phản hồi BT1 trong `docs/thay-doi-thiet-ke.md`
- [x] Dựng cấu trúc routes - services - repositories - validators theo kiến trúc
- [x] Migration và seed idempotent cho năm bảng L5
- [x] API xem tồn, nhập kho, xuất kho và cảnh báo tồn thấp qua routes - services - repositories
- [x] QT-09: xuất kho dùng transaction PostgreSQL, khoá dòng và rollback khi thiếu tồn
- [x] Frontend React gồm M1 xem tồn, M2 nhập linh kiện, M3 xuất cho phiếu; gọi API qua `frontend/src/api/`
- [x] Xử lý ba trạng thái đang tải, rỗng, lỗi bằng `DataState`
- [x] Unit test cho service, validation và contract dữ liệu
- [x] Chạy migration/seed trên PostgreSQL cục bộ; kiểm chứng luồng nhập/xuất qua API thật và lưu [ảnh kết quả xuất kho](docs/screenshots/b10-part-issue-success.jpg)
- [ ] Clone repository vào thư mục mới và xác minh README chạy lại được
