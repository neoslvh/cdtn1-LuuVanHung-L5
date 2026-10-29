# L5 - Hệ thống quản lý kho linh kiện thay thế

**Sinh viên:** Lưu Văn Hưng - 2374802010196 - Track SE

**Học phần:** Chuyên đề Tốt nghiệp 1, HK1 2026-2027
**Luồng nghiệp vụ:** L5 - Kho linh kiện thay thế

## 1. Mục tiêu

Hệ thống hỗ trợ quản lý trung tâm theo dõi tồn kho linh kiện theo từng trung tâm. Quản lý có thể ghi nhận nhập kho và xem tồn; kỹ thuật viên kiểm tra linh kiện trước khi xuất cho phiếu bảo hành. Sprint 2 kết nối ba màn hình React với API thật cho luồng xem tồn → nhập/xuất → cập nhật tồn và cảnh báo tồn thấp.

## 2. Yêu cầu môi trường

- Cách khuyến nghị: Docker Desktop đang chạy.
- Nếu chạy cục bộ: Node.js 20 LTS, npm 10 và PostgreSQL 16+.
- Biến môi trường backend: xem `.env.example` (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_PORT`, `API_PORT`, `LOG_LEVEL`).
- Với Docker Compose, frontend nhận địa chỉ API từ `PUBLIC_API_URL` trong `.env` ở thư mục gốc.
- Khi chạy frontend cục bộ và cần đổi API, xem `frontend/.env.example` (`VITE_API_BASE_URL`).

## 3. Hướng dẫn chạy

Chỉ chọn **một** trong hai cách dưới đây. Không cần chạy Docker và PostgreSQL cục bộ cùng lúc.

### Cách A — Docker Compose (khuyến nghị)

Docker Desktop phải đang chạy. Từ thư mục gốc repository, tạo file môi trường:

```bash
# Git Bash
cp .env.example .env

# PowerShell
Copy-Item .env.example .env
```

Sau đó chạy toàn bộ PostgreSQL, API và frontend:

```bash
docker compose up -d --build
```

Không cần tạo `frontend/.env` khi chạy Docker. Compose dùng `PUBLIC_API_URL` trong file `.env` ở thư mục gốc để build frontend. Mặc định giữ `PUBLIC_API_URL=http://localhost:3000`; chỉ sửa biến này khi API được mở ở địa chỉ khác.

Mở `http://localhost:5173`. API health check tại `http://localhost:3000/health`.

Khi volume PostgreSQL còn trống, Compose tự tạo database, bảng và nạp dataset L5 từ `data/sample/`. Các lần bật tiếp theo giữ nguyên dữ liệu đã thao tác.

```bash
# Kiểm tra trạng thái và log API
docker compose ps
docker compose logs api --tail 20
```

Sau khi sửa source code, build lại bằng:

```bash
docker compose up -d --build
```

Để tạo lại dataset từ đầu (xóa toàn bộ dữ liệu Docker cục bộ):

```bash
docker compose down -v
docker compose up -d --build
```

### Cách B — Chạy cục bộ với PostgreSQL

1. Tạo file `.env` từ mẫu, rồi cập nhật `DB_NAME`, `DB_USER`, `DB_PASSWORD` theo PostgreSQL trên máy.

   ```bash
   # Git Bash
   cp .env.example .env

   # PowerShell
   Copy-Item .env.example .env
   ```

2. Tạo database có tên trùng với `DB_NAME` trong `.env`. Ví dụ nếu dùng tài khoản `postgres`:

   ```bash
   createdb -U postgres mekong_l5
   ```

   Hoặc tạo database `mekong_l5` trong pgAdmin. Nếu PostgreSQL yêu cầu mật khẩu, dùng mật khẩu đã đặt khi cài PostgreSQL để điền vào `DB_PASSWORD`.

3. **Terminal 1 — Backend:** cài dependency, tạo bảng, nạp dataset và chạy API.

   ```bash
   npm ci
   npm run db:migrate
   npm run db:seed:dataset -- --reset
   npm run dev
   ```

4. **Terminal 2 — Frontend:**

   ```bash
   cd frontend
   npm ci
   npm run dev
   ```

   Frontend mặc định gọi API tại `http://localhost:3000`, nên không bắt buộc tạo `frontend/.env` nếu dùng đúng địa chỉ này. Nếu API chạy ở địa chỉ khác, tạo file môi trường riêng rồi sửa `VITE_API_BASE_URL`:

   ```bash
   # Git Bash, đang ở thư mục frontend
   cp .env.example .env

   # PowerShell, đang ở thư mục frontend
   Copy-Item .env.example .env
   ```

Mở `http://localhost:5173`. Giao diện có hai tài khoản demo: **Quản lý trung tâm** (xem tồn, nhập) và **Kỹ thuật viên** (xem tồn, xuất theo phiếu). Đây là token prototype, không dùng cho môi trường thật.

### Kiểm tra dataset Smart CRM cho L5

Repository có sẵn dữ liệu mẫu trong `data/sample/`, đủ liên kết để kiểm thử luồng L5. Có thể kiểm tra liên kết khóa mà không thay đổi cơ sở dữ liệu:

```bash
npm run db:seed:dataset -- --validate
```

Tham số `--reset` ở cách chạy cục bộ sẽ thay thế toàn bộ dữ liệu năm bảng L5 trong database đang kết nối.

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
- [x] Chạy migration/seed trên PostgreSQL cục bộ; kiểm chứng luồng nhập/xuất qua API thật và lưu 
- [x] Clone repository vào thư mục mới và xác minh README chạy lại được
