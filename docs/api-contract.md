# API Contract — L5: Kho linh kiện thay thế

Đặc tả này là phần track **SE** nộp kèm [SRS](srs.md). Nội dung theo mẫu API contract trong tài liệu tự học B3 và phục vụ các User Story MUST: US2, US4, US5.

## A3.1. Danh sách endpoint

| Phương thức | Đường dẫn | Mục đích | User Story |
| --- | --- | --- | --- |
| `GET` | `/api/part-stocks?page={page}&size={size}` | Xem tồn kho linh kiện tại trung tâm. | US1 |
| `POST` | `/api/stock-receipts` | Ghi nhận nhập linh kiện, tăng tồn kho tại trung tâm. | US2 |
| `GET` | `/api/parts/{part_id}/availability?requested_quantity={quantity}` | Kiểm tra số lượng linh kiện có đáp ứng nhu cầu sử dụng. | US3 |
| `POST` | `/api/tickets/{ticket_id}/part-issues` | Xuất một hoặc nhiều linh kiện cho phiếu bảo hành. | US4 |
| `GET` | `/api/stock-alerts?page={page}&size={size}` | Xem cảnh báo và danh sách linh kiện tồn dưới ngưỡng. | US5 |
| `GET` | `/api/part-transactions?part_id={part_id}&page={page}&size={size}` | Xem lịch sử nhập — xuất của linh kiện. | US6 |
| `GET` | `/api/tickets/{ticket_id}/parts` | Xem linh kiện đã xuất cho phiếu bảo hành. | US7 |

## A3.2. Quy ước chung

- Định dạng trao đổi: JSON, mã hóa UTF-8. Header bắt buộc: `Content-Type: application/json`.
- Tên trường dùng `snake_case`, khớp tên cột trong mô hình dữ liệu để dễ truy vết.
- Thời gian dùng ISO 8601 kèm múi giờ `+07:00`, ví dụ `2026-10-01T09:15:00+07:00`.
- Tiền tệ (nếu có) là số nguyên VND, không có phần thập phân hoặc dấu phân cách.
- Phân trang dùng `page` (bắt đầu từ 1) và `size` (mặc định 20, tối đa 100); response kèm `total`.
- Mọi lỗi trả về cùng cấu trúc:

```json
{
  "error": {
    "code": "...",
    "message": "...",
    "fields": {}
  }
}
```

## A3.3. Chi tiết endpoint

### POST /api/stock-receipts — Ghi nhận nhập linh kiện — US2

**Actor:** Quản lý trung tâm. Trung tâm được xác định từ tài khoản đăng nhập, không nhận `center_id` từ request.

#### Request body

```json
{
  "part_id": 101,
  "quantity": 20
}
```

#### Response `201 Created`

```json
{
  "transaction_id": 501,
  "transaction_type": "NHAP",
  "part_id": 101,
  "center_id": 3,
  "quantity": 20,
  "stock_before": 8,
  "stock_after": 28,
  "low_stock_alerts": [],
  "created_at": "2026-10-01T09:15:00+07:00"
}
```

#### Response lỗi

**`400 Bad Request` — dữ liệu không hợp lệ**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ.",
    "fields": {
      "quantity": "Số lượng nhập phải là số nguyên lớn hơn 0."
    }
  }
}
```

**`404 Not Found` — không tìm thấy linh kiện**

```json
{
  "error": {
    "code": "PART_NOT_FOUND",
    "message": "Không tìm thấy linh kiện.",
    "fields": {
      "part_id": "Linh kiện không tồn tại."
    }
  }
}
```

### POST /api/tickets/{ticket_id}/part-issues — Xuất linh kiện — US4

**Actor:** Kỹ thuật viên. Các dòng xuất được xử lý nguyên tử: nếu một linh kiện không đủ, không dòng nào được xuất và tồn kho giữ nguyên.

#### Path parameter

| Trường | Bắt buộc | Kiểu / ràng buộc | Thông báo lỗi khi vi phạm |
| --- | --- | --- | --- |
| `ticket_id` | Có | Số nguyên dương; phiếu tồn tại và thuộc trung tâm của kỹ thuật viên. | Phiếu bảo hành không hợp lệ hoặc không thuộc trung tâm của bạn. |

#### Request body

```json
{
  "items": [
    {
      "part_id": 101,
      "quantity": 1
    },
    {
      "part_id": 205,
      "quantity": 2
    }
  ]
}
```

#### Response `201 Created`

```json
{
  "ticket_id": 9001,
  "status": "DANG_XU_LY",
  "issues": [
    {
      "transaction_id": 502,
      "part_id": 101,
      "quantity": 1,
      "stock_before": 3,
      "stock_after": 2
    },
    {
      "transaction_id": 503,
      "part_id": 205,
      "quantity": 2,
      "stock_before": 10,
      "stock_after": 8
    }
  ],
  "low_stock_alerts": [
    {
      "part_id": 101,
      "quantity": 2,
      "min_threshold": 5,
      "status": "LOW_STOCK"
    }
  ],
  "created_at": "2026-10-01T10:30:00+07:00"
}
```

#### Response lỗi

**`400 Bad Request` — dữ liệu dòng xuất không hợp lệ**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ.",
    "fields": {
      "items[0].quantity": "Số lượng xuất phải là số nguyên lớn hơn 0."
    }
  }
}
```

**`409 Conflict` — xuất vượt tồn (QT-09)**

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Không đủ linh kiện để xuất; phiếu đã chuyển sang trạng thái CHO_LINH_KIEN.",
    "ticket_status": "CHO_LINH_KIEN",
    "fields": {
      "items[0].quantity": "Linh kiện chỉ còn 0, không đủ để xuất 1."
    }
  }
}
```

**`404 Not Found` — phiếu hoặc linh kiện không tồn tại**

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Không tìm thấy phiếu bảo hành.",
    "fields": {
      "ticket_id": "Phiếu bảo hành không tồn tại."
    }
  }
}
```

### GET /api/stock-alerts?page={page}&size={size} — Xem cảnh báo tồn thấp — US5

**Actor:** Quản lý trung tâm.

#### Query parameter

| Trường | Bắt buộc | Kiểu / ràng buộc | Thông báo lỗi khi vi phạm |
| --- | --- | --- | --- |
| `page` | Không | Số nguyên `>= 1`; mặc định `1`. | page phải là số nguyên lớn hơn hoặc bằng 1. |
| `size` | Không | Số nguyên `1–100`; mặc định `20`. | size phải nằm trong khoảng từ 1 đến 100. |

#### Response `200 OK`

```json
{
  "center_id": 3,
  "items": [
    {
      "part_id": 101,
      "part_code": "PIN-IP13-01",
      "part_name": "Pin iPhone 13",
      "quantity": 2,
      "min_threshold": 5,
      "status": "LOW_STOCK"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1
}
```

#### Response lỗi

**`400 Bad Request` — tham số phân trang không hợp lệ**

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ.",
    "fields": {
      "size": "size phải nằm trong khoảng từ 1 đến 100."
    }
  }
}
```

**`403 Forbidden` — không có quyền**

```json
{
  "error": {
    "code": "STOCK_ALERT_FORBIDDEN",
    "message": "Chỉ quản lý trung tâm được phép xem cảnh báo tồn kho.",
    "fields": {}
  }
}
```

## A3.4. Bảng validation

| Trường | Bắt buộc | Kiểu / ràng buộc | Thông báo lỗi khi vi phạm |
| --- | --- | --- | --- |
| `POST /api/stock-receipts.part_id` | Có | Số nguyên dương, phải tồn tại trong bảng `part`. | Không tìm thấy linh kiện. |
| `POST /api/stock-receipts.quantity` | Có | Số nguyên, `> 0`. | Số lượng nhập phải là số nguyên lớn hơn 0. |
| `POST /api/tickets/{ticket_id}/part-issues.items` | Có | Mảng có ít nhất một phần tử. | Phải chọn ít nhất một linh kiện để xuất. |
| `items[].part_id` | Có | Số nguyên dương, phải tồn tại trong bảng `part`; không được trùng trong cùng request. | Linh kiện không hợp lệ hoặc bị lặp. |
| `items[].quantity` | Có | Số nguyên, `> 0`; tổng xuất không vượt tồn tại trung tâm (QT-09). | Số lượng xuất không hợp lệ hoặc vượt tồn kho. |
| `GET /api/stock-alerts.page` | Không | Số nguyên, `>= 1`; mặc định `1`. | page phải là số nguyên lớn hơn hoặc bằng 1. |
| `GET /api/stock-alerts.size` | Không | Số nguyên, `1–100`; mặc định `20`. | size phải nằm trong khoảng từ 1 đến 100. |

## Xác thực và phân quyền

Mọi endpoint yêu cầu `Authorization: Bearer <access_token>`.

| Endpoint | Vai trò được gọi | Ràng buộc dữ liệu |
| --- | --- | --- |
| `POST /api/stock-receipts` | `CENTER_MANAGER` | Chỉ nhập kho tại trung tâm đang phụ trách. |
| `POST /api/tickets/{ticket_id}/part-issues` | `TECHNICIAN` | Chỉ xuất cho phiếu thuộc trung tâm đang làm việc. |
| `GET /api/stock-alerts` | `CENTER_MANAGER` | Chỉ xem cảnh báo của trung tâm đang phụ trách. |

Quy định này áp dụng QT-14. Endpoint xuất linh kiện áp dụng thêm QT-06 và QT-09: không xuất vượt tồn; khi không đủ linh kiện, phiếu chuyển sang `CHO_LINH_KIEN` và lần chuyển trạng thái phải được lưu.

## Tự kiểm trước khi nộp BT1

- [x] Mỗi endpoint nối được tới ít nhất một User Story trong SRS (US1–US7); các endpoint MUST có đặc tả request, response thành công, lỗi và validation chi tiết.
- [x] Mỗi endpoint có một response thành công và ít nhất hai response lỗi.
- [x] Trường request dùng `snake_case` và bám các thực thể `part`, `part_stock`, `part_transaction`, `ticket_part`, `ticket`.
- [x] Không có endpoint không phục vụ User Story.
- [x] QT-06, QT-09 và QT-14 xuất hiện trong validation, response lỗi hoặc phân quyền.
