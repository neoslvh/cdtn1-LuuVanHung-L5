# L5 - Hệ thống quản lý kho linh kiện thay thế

**Sinh viên:** Lưu Văn Hưng - 2374802010196 - Track SE

**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027
**Luồng nghiệp vụ:** L5 - Kho linh kiện thay thế

## 1. Mục tiêu

Hệ thống hỗ trợ quản lý trung tâm theo dõi tồn kho linh kiện theo từng trung tâm. Quản lý có thể ghi nhận nhập kho và xem tồn; kỹ thuật viên kiểm tra linh kiện trước khi xuất cho phiếu bảo hành. Sprint 2 kết nối ba màn hình React với API thật cho luồng xem tồn → nhập/xuất → cập nhật tồn và cảnh báo tồn thấp.

## 2. Yêu cầu môi trường

- Node.js 20 LTS và npm 10 (Node 18+ vẫn chạy được ở mức prototype)
- PostgreSQL 16+
- Biến môi trường backend: xem `.env.example` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `API_PORT`, `LOG_LEVEL`)
- Biến môi trường frontend: xem `frontend/.env.example` (`VITE_API_BASE_URL`)

## 3. Hướng dẫn chạy

Mở hai terminal, mỗi lệnh một dòng:

```bash
copy .env.example .env
npm ci
npm run db:migrate
npm run db:seed
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
npm ci
npm run dev
```

Mở `http://localhost:5173`. Backend chạy tại `http://localhost:3000`; kiểm tra sức khoẻ tại `/health`.
Giao diện có hai tài khoản demo: **Quản lý trung tâm** (xem tồn, nhập) và **Kỹ thuật viên** (xem tồn, xuất theo phiếu). Đây là token prototype, không dùng cho môi trường thật.

### Chạy toàn bộ hệ thống bằng Docker

Docker Desktop phải đang chạy. Nếu chưa tạo `.env`, hãy thực hiện bước `copy .env.example .env` ở phần hướng dẫn chạy phía trên. Sau đó, từ thư mục gốc chạy:

```bash
docker compose up -d --build
```

Mở `http://localhost:5173`; API health check tại `http://localhost:3000/health`. Khi volume PostgreSQL còn trống, Compose tự tạo bảng và nạp dataset L5 từ `data/sample/`. Các lần bật tiếp theo giữ nguyên dữ liệu đã thao tác. Kiểm tra trạng thái và log:

```bash
docker compose ps
docker compose logs api --tail 20
```

Để tạo lại dataset từ đầu (xóa volume Docker cục bộ):

```bash
docker compose down -v
docker compose up -d --build
```

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
frontend/src/pages/   Ba màn hình React M1–M3 và trang lịch sử nhập-xuất
frontend/src/components/  Thành phần dùng lại, gồm DataState và FormMessage
```

## 5. Kiểm thử

```bash
npm test
```

Kết quả hiện tại: 23 unit test PASS cho service, validation, logger và hợp đồng dữ liệu tồn kho.

Kiểm tra bản build frontend:

```bash
cd frontend
npm run build
```

## 6. Trạng thái hiện tại (buổi 11)

- [x] Ghi nhận và xử lý phản hồi BT1 trong `docs/thay-doi-thiet-ke.md`
- [x] Dựng cấu trúc routes - services - repositories - validators theo kiến trúc
- [x] Migration và seed idempotent cho năm bảng L5
- [x] API xem tồn, nhập kho, xuất kho và cảnh báo tồn thấp qua routes - services - repositories
- [x] QT-09: xuất kho dùng transaction PostgreSQL, khoá dòng và rollback khi thiếu tồn
- [x] Frontend React gồm M1 xem tồn, M2 nhập linh kiện, M3 xuất cho phiếu; gọi API qua `frontend/src/api/`
- [x] Xử lý ba trạng thái đang tải, rỗng, lỗi bằng `DataState`
- [x] Unit test cho service, validation và contract dữ liệu
- [x] Logger JSON, `request_id`, che dữ liệu nhạy cảm và middleware lỗi tập trung
- [x] Docker Compose chạy PostgreSQL, API và frontend từ môi trường sạch
- [x] Có Bug Log cho lỗi đã sửa và test xác nhận
- [x] Chạy migration/seed trên PostgreSQL cục bộ; kiểm chứng luồng nhập/xuất qua API thật và lưu [ảnh kết quả xuất kho](docs/screenshots/b10-part-issue-success.jpg)
- [ ] Clone repository vào thư mục mới và xác minh README chạy lại được
