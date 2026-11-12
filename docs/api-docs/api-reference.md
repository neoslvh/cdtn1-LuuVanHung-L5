# API Reference — L5 Spare Parts Inventory

Base URL: `http://localhost:3000`. All responses are JSON. The prototype uses demo bearer tokens: `demo-manager` for a centre manager and `demo-technician` for a technician. A protected request sends `Authorization: Bearer <token>`.

## Shared response and error contract

Successful list responses use `data`, `items`, `page`, `size`, and `total` where applicable. Validation and business errors use the following shape:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ.",
    "fields": { "quantity": "Số lượng nhập phải là số nguyên lớn hơn 0." }
  }
}
```

The API never returns a stack trace, SQL text, table name, password, token, or connection string. The demo authentication is for this coursework prototype only; it is not production JWT authentication.

## Endpoint catalogue

Each row states the required seven implementation details: method/path, purpose, authentication, input, success response, expected errors, and limitation.

| Method and path | Business purpose | Authentication | Parameters / body | Success response | Error responses | Limitation / note |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /api/auth/demo-login` | Creates a prototype demo session. | None. | `{ "role": "CENTER_MANAGER" }` or `TECHNICIAN`. | `200` with `token`, `role`, `center_id`. | `400 VALIDATION_FAILED`. | Fixed demo roles only. |
| `GET /health` | Checks API and PostgreSQL availability. | None. | None. | `200 {"status":"ok","db":"ok"}`. | `503` when DB is unavailable. | Intended for health checks, not business data. |
| `GET /api/parts` | Lists part catalogue records. | None in the current prototype. | None. | `200 {"data":[...]}`. | `500` unexpected error. | Catalogue CRUD is kept open for prototype administration. |
| `GET /api/parts/:partId` | Gets one catalogue part. | None in the current prototype. | Positive integer `partId`. | `200 {"data":{...}}`. | `400 INVALID_DATA`, `404 PART_NOT_FOUND`. | Does not include centre-specific stock. |
| `POST /api/parts` | Creates a catalogue part. | None in the current prototype. | `part_code`, `part_name`, `unit_price`. | `201 {"data":{...}}`. | `400 VALIDATION_FAILED`, `409 DATA_CONFLICT`. | Production version must restrict administration. |
| `PATCH /api/parts/:partId` | Updates catalogue part details. | None in the current prototype. | Positive `partId`; one or more editable part fields. | `200 {"data":{...}}`. | `400 VALIDATION_FAILED`, `404 PART_NOT_FOUND`, `409 DATA_CONFLICT`. | Does not alter stock quantity. |
| `DELETE /api/parts/:partId` | Deletes an unused catalogue part. | None in the current prototype. | Positive integer `partId`. | `204` no body. | `400 INVALID_DATA`, `404 PART_NOT_FOUND`, `409` when referenced. | Referenced parts cannot be removed. |
| `GET /api/part-stocks` | Lists stock in the authenticated centre. | Manager or technician. | Optional `keyword`, `low_only`, `page`, `size`, `sort_by`, `sort_direction`. | `200` with `items`, `page`, `size`, `total`. | `400 VALIDATION_FAILED`, `401 UNAUTHORIZED`. | Maximum page size is validated by the API. |
| `GET /api/part-stocks/:partId` | Reads stock for one part in the current centre. | Manager or technician. | Positive integer `partId`. | `200 {"data":{...}}`. | `400 VALIDATION_FAILED`, `401`, `404 PART_NOT_FOUND`. | Cannot read another centre's stock. |
| `POST /api/part-stocks` | Configures a stock row for a part. | Centre manager only. | `part_id`, `min_threshold`. | `201 {"data":{...}}`. | `400 VALIDATION_FAILED`, `401`, `403`, `409`. | A new row always starts with quantity `0`. |
| `PATCH /api/part-stocks/:partId` | Changes the low-stock threshold. | Centre manager only. | Positive `partId`; `min_threshold`. | `200 {"data":{...}}`. | `400`, `401`, `403`, `404`. | Does not directly edit actual quantity. |
| `DELETE /api/part-stocks/:partId` | Removes an empty stock configuration. | Centre manager only. | Positive integer `partId`. | `204` no body. | `400`, `401`, `403`, `404`, `409 STOCK_NOT_EMPTY` or `STOCK_HAS_TRANSACTIONS`. | Preserves transaction integrity. |
| `GET /api/stock-alerts` | Lists low-stock or out-of-stock items. | Centre manager only. | Optional `page`, `size`. | `200` paginated stock data. | `400`, `401`, `403`. | The condition is `quantity < min_threshold` or zero quantity. |
| `GET /api/part-transactions` | Lists receipt/issue history for one part. | Centre manager only. | Required `part_id`; optional `page`, `size`. | `200` with paginated transactions. | `400`, `401`, `403`, `404 PART_NOT_FOUND`. | Only the current centre's history is returned. |
| `POST /api/stock-receipts` | Records a stock receipt. | Centre manager only. | `{ "part_id": 1, "quantity": 3 }`. | `201` with receipt and updated stock. | `400 VALIDATION_FAILED`, `401`, `403`, `404`. | Quantity must be a positive integer. |
| `GET /api/parts/:partId/availability` | Checks whether requested quantity can be issued. | Manager or technician. | `partId`; optional `requested_quantity` (default 1). | `200` with availability and current quantity. | `400`, `401`, `404`. | A later issue can still fail if another transaction consumes stock first. |
| `GET /api/tickets` | Lists warranty tickets in the current centre. | Manager or technician. | None. | `200` array of tickets. | `401 UNAUTHORIZED`. | Other-centre tickets are excluded. |
| `GET /api/tickets/:ticketId/parts` | Lists parts already issued to one ticket. | Manager or technician. | Positive integer `ticketId`. | `200` array of ticket-part rows. | `400`, `401`, `404 TICKET_NOT_FOUND`. | Ownership is checked by centre. |
| `POST /api/tickets/:ticketId/part-issues` | Issues one or more parts to a ticket atomically. | Technician only. | Positive `ticketId`; `{ "items": [{"part_id":1,"quantity":1}] }`. | `201` with issue result and updated quantities. | `400 VALIDATION_FAILED`, `401`, `403`, `404 TICKET_NOT_FOUND`, `409 INSUFFICIENT_STOCK`. | Uses DB transaction and row locks; all items roll back if one fails. |

## Verified live request and response examples

### 1. Demo manager login

```http
POST /api/auth/demo-login
Content-Type: application/json

{ "role": "CENTER_MANAGER" }
```

```json
{ "token": "demo-manager", "role": "CENTER_MANAGER", "center_id": 1 }
```

### 2. Get the first inventory page

```http
GET /api/part-stocks?page=1&size=1&sort_by=part_code&sort_direction=asc
Authorization: Bearer demo-manager
```

```json
{
  "center_id": 1,
  "items": [{ "part_id": "70", "part_code": "CAM-AP-01", "quantity": 27, "min_threshold": 3, "status": "NORMAL" }],
  "page": 1,
  "size": 1,
  "total": 123
}
```

### 3. Reject an invalid receipt

```http
POST /api/stock-receipts
Authorization: Bearer demo-manager
Content-Type: application/json

{ "part_id": 1, "quantity": 0 }
```

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ.",
    "fields": { "quantity": "Số lượng nhập phải là số nguyên lớn hơn 0." }
  }
}
```

### 4. Issue a part to a ticket

```http
POST /api/tickets/134/part-issues
Authorization: Bearer demo-technician
Content-Type: application/json

{ "items": [{ "part_id": 181, "quantity": 1 }] }
```

```json
{
  "ticket_id": 134,
  "ticket_code": "BH-000134/2024",
  "issues": [{ "transaction_id": "1153", "part_id": 181, "quantity": 1, "stock_before": 3, "stock_after": 2 }],
  "low_stock_alerts": [{ "part_id": 181, "part_code": "DOC-API-01", "quantity": 2, "min_threshold": 3, "status": "LOW_STOCK" }]
}
```

## Per-endpoint live response record

The following requests were run against an isolated Docker Compose project with a fresh seeded database on 12 November 2026. Long list responses are represented by their first returned record; the endpoint catalogue above defines the complete response contract.

| Endpoint | Request example | Response example |
| --- | --- | --- |
| `POST /api/auth/demo-login` | `{ "role": "TECHNICIAN" }` | `200 { "token":"demo-technician", "role":"TECHNICIAN", "center_id":1 }` |
| `GET /health` | No body. | `200 { "status":"ok", "db":"ok" }` |
| `GET /api/parts` | No body. | `200 { "data":[{ "part_id":"70", "part_code":"CAM-AP-01", "part_name":"Camera sau Apple loại 1", "unit_price":"420000" }] }` |
| `GET /api/parts/181` | Path parameter `181`. | `200 { "data":{ "part_id":"181", "part_code":"DOC-API-01", "part_name":"API documentation sample", "unit_price":"1000" } }` |
| `POST /api/parts` | `{ "part_code":"DOC-API-01", "part_name":"API documentation sample", "unit_price":1000 }` | `201 { "data":{ "part_id":"181", "part_code":"DOC-API-01", "part_name":"API documentation sample", "unit_price":"1000" } }` |
| `PATCH /api/parts/181` | `{ "part_name":"API documentation sample updated" }` | `200 { "data":{ "part_id":"181", "part_code":"DOC-API-01", "part_name":"API documentation sample updated", "unit_price":"1000" } }` |
| `DELETE /api/parts/182` | Path parameter `182`; stock configuration was removed first. | `204` with an empty body. |
| `GET /api/part-stocks` | `?page=1&size=1`, manager token. | `200 { "center_id":1, "items":[{ "part_id":"70", "part_code":"CAM-AP-01", "quantity":27, "min_threshold":3, "status":"NORMAL" }], "page":1, "size":1, "total":124 }` |
| `GET /api/part-stocks/181` | Path parameter `181`, manager token. | `200 { "data":{ "center_id":"1", "part_id":"181", "part_code":"DOC-API-01", "quantity":0, "min_threshold":2, "status":"LOW_STOCK" } }` |
| `POST /api/part-stocks` | `{ "part_id":181, "min_threshold":2 }`, manager token. | `201 { "data":{ "center_id":"1", "part_id":"181", "part_code":"DOC-API-01", "quantity":0, "min_threshold":2, "status":"LOW_STOCK" } }` |
| `PATCH /api/part-stocks/181` | `{ "min_threshold":3 }`, manager token. | `200 { "data":{ "center_id":"1", "part_id":"181", "part_code":"DOC-API-01", "quantity":0, "min_threshold":3, "status":"LOW_STOCK" } }` |
| `DELETE /api/part-stocks/182` | Path parameter `182`, manager token. | `204` with an empty body. |
| `GET /api/stock-alerts` | `?page=1&size=1`, manager token. | `200 { "center_id":1, "items":[{ "part_id":"143", "part_code":"CMH-AP-02", "quantity":0, "min_threshold":8, "status":"LOW_STOCK" }], "page":1, "size":1, "total":21 }` |
| `GET /api/part-transactions` | `?part_id=181&page=1&size=10`, manager token. | `200 { "center_id":1, "part":{ "part_id":"181", "part_code":"DOC-API-01" }, "items":[{ "transaction_id":"1152", "transaction_type":"IN", "quantity":3, "ticket_id":null }], "page":1, "size":10, "total":1 }` |
| `POST /api/stock-receipts` | `{ "part_id":181, "quantity":3 }`, manager token. | `201 { "transaction_id":"1152", "part_id":"181", "transaction_type":"IN", "quantity":3, "stock_before":0, "stock_after":3, "low_stock_alerts":[] }` |
| `GET /api/parts/181/availability` | `?requested_quantity=1`, technician token. | `200 { "part_id":"181", "part_code":"DOC-API-01", "quantity":3, "min_threshold":3, "requested_quantity":1, "available":true }` |
| `GET /api/tickets` | No body, technician token. | `200 [{ "ticket_id":"134", "ticket_code":"BH-000134/2024" }, { "ticket_id":"218", "ticket_code":"BH-000218/2024" }]` |
| `GET /api/tickets/134/parts` | Path parameter `134`, technician token. | `200 [{ "ticket_id":"134", "part_id":"61", "part_code":"CAM-OP-01", "quantity_used":1 }, { "ticket_id":"134", "part_id":"181", "part_code":"DOC-API-01", "quantity_used":1 }]` |
| `POST /api/tickets/134/part-issues` | `{ "items":[{ "part_id":181, "quantity":1 }] }`, technician token. | `201 { "ticket_id":134, "ticket_code":"BH-000134/2024", "issues":[{ "transaction_id":"1153", "part_id":181, "quantity":1, "stock_before":3, "stock_after":2 }], "low_stock_alerts":[{ "part_id":181, "part_code":"DOC-API-01", "quantity":2, "min_threshold":3, "status":"LOW_STOCK" }] }` |

## Operational limitations

- Pagination is implemented for inventory, alerts, and transaction history; the catalogue and ticket list are intentionally small in the prototype.
- Only centre isolation is modelled. Production authentication, user accounts, password storage, rate limiting, and audit retention are out of scope.
- All write endpoints should be called through the React API client in `frontend/src/api/`; this reference is for testing and integration.
