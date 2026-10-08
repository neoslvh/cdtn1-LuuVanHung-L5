# Software Requirements Specification (SRS)

## L5 — Hệ thống quản lý kho linh kiện thay thế

Tài liệu SRS rút gọn này đặc tả luồng L5 của Case Study Smart CRM — Mekong Mobile.

## 1. Giới thiệu và phạm vi

### 1.1. Bối cảnh

Mekong Mobile có 6 trung tâm bảo hành. Tồn kho linh kiện thay thế hiện được ghi bằng sổ và cập nhật vào cuối ngày. Vì vậy kỹ thuật viên có thể nhận phiếu bảo hành rồi mới biết linh kiện đã hết, phải hẹn lại khách; tình trạng này xảy ra khoảng 20 lần mỗi tháng. Đây là vấn đề V6 của Case Study.

### 1.2. Luồng nghiệp vụ và phạm vi

Luồng L5 quản lý tồn kho linh kiện theo từng trung tâm: quản lý trung tâm ghi nhận nhập kho; kỹ thuật viên kiểm tra và xuất linh kiện cho phiếu bảo hành; hệ thống cập nhật tồn, cảnh báo tồn thấp và lưu lịch sử giao dịch.

Các thực thể dữ liệu thuộc phạm vi L5 là `part`, `part_stock`, `part_transaction` và `ticket_part`. Phiếu bảo hành đã tồn tại từ luồng khác; L5 chỉ dùng `ticket_id` để liên kết linh kiện đã xuất, không quản lý dữ liệu hay vòng đời trạng thái của phiếu.

### 1.3. Ngoài phạm vi (WON'T)

Prototype này chủ ý không thực hiện:

- Tiếp nhận, tạo mới hoặc đóng phiếu bảo hành.
- Cập nhật trạng thái hoặc lưu lịch sử trạng thái của phiếu bảo hành.
- Phân công kỹ thuật viên, đặt lịch hẹn hoặc quản lý hạn cam kết.
- Quản lý nhà cung cấp, đặt mua linh kiện, vận chuyển hoặc chuyển kho giữa các trung tâm.
- Quản lý bán hàng, khách hàng, khảo sát hài lòng và báo cáo doanh thu.

### 1.4. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
| --- | --- |
| Linh kiện | Bộ phận thay thế dùng trong sửa chữa; có mã và tồn kho theo trung tâm. |
| Tồn kho | Số lượng hiện có của một linh kiện tại một trung tâm. |
| Giao dịch nhập | Giao dịch làm tăng số lượng tồn của linh kiện. |
| Giao dịch xuất | Giao dịch sử dụng linh kiện cho phiếu bảo hành và làm giảm tồn kho. |
| Phiếu bảo hành | Yêu cầu bảo hành hoặc sửa chữa có mã duy nhất và vòng đời trạng thái. |
| `quantity` | Số lượng tồn hiện tại trong `part_stock`. |
| `min_threshold` | Ngưỡng cảnh báo tồn thấp trong `part_stock`. |

## 2. Các bên liên quan và vai trò người dùng

| Actor | Làm được | Không được làm |
| --- | --- | --- |
| Quản lý trung tâm | Xem tồn kho; ghi nhận nhập; xem lịch sử nhập — xuất; xem và nhận cảnh báo tồn thấp. | Không xem hoặc thao tác dữ liệu kho của trung tâm khác; không xuất linh kiện cho phiếu bảo hành. |
| Kỹ thuật viên | Kiểm tra tồn; xuất linh kiện cho phiếu bảo hành; xem linh kiện đã xuất cho phiếu. | Không ghi nhận nhập kho; không xem hoặc thao tác dữ liệu kho của trung tâm khác. |

## 3. Yêu cầu chức năng

### 3.1. Functional Requirements

**FR1 — Xem tồn kho linh kiện.** Hệ thống phải cho phép quản lý trung tâm xem mã, tên, `quantity` và `min_threshold` của từng linh kiện tại trung tâm mình phụ trách.

**FR2 — Ghi nhận nhập linh kiện.** Hệ thống phải cho phép quản lý trung tâm ghi nhận giao dịch nhập có số lượng lớn hơn 0. Khi giao dịch được xác nhận, hệ thống phải lưu giao dịch và tăng `quantity` tương ứng.

**FR3 — Kiểm tra tồn trước khi sử dụng.** Hệ thống phải cho phép kỹ thuật viên kiểm tra `quantity` của linh kiện cần dùng. Nếu tồn nhỏ hơn số lượng cần dùng, hệ thống phải thông báo không đủ linh kiện để xuất.

**FR4 — Xuất linh kiện cho phiếu bảo hành.** Hệ thống phải cho phép kỹ thuật viên xuất một hoặc nhiều linh kiện cho một phiếu bảo hành. Khi hợp lệ, hệ thống phải lưu giao dịch xuất, giảm `quantity` và lưu liên kết linh kiện với phiếu. Nếu không đủ tồn, hệ thống phải từ chối giao dịch, giữ nguyên tồn và thông báo không đủ linh kiện để xuất.

**FR5 — Xem cảnh báo tồn kho thấp.** Sau mỗi giao dịch làm thay đổi tồn, hệ thống phải kiểm tra `quantity`. Khi `quantity < min_threshold`, hệ thống phải tạo cảnh báo; quản lý trung tâm phải xem được danh sách linh kiện dưới ngưỡng để ưu tiên bổ sung.

**FR6 — Xem lịch sử nhập — xuất.** Hệ thống phải cho phép quản lý trung tâm xem lịch sử biến động tồn của từng linh kiện, gồm linh kiện, loại giao dịch, số lượng, thời điểm và phiếu bảo hành liên quan nếu là giao dịch xuất.

**FR7 — Xem linh kiện đã xuất cho phiếu bảo hành.** Hệ thống phải cho phép kỹ thuật viên xem danh sách linh kiện đã ghi nhận sử dụng cho một phiếu bảo hành.


### 3.2. User Story và MoSCoW

| Mã | User Story | MoSCoW |
| --- | --- | --- |
| US1 | Là quản lý trung tâm, tôi muốn xem số lượng tồn hiện tại của từng linh kiện tại trung tâm mình phụ trách để nắm được tình trạng kho. | SHOULD |
| US2 | Là quản lý trung tâm, tôi muốn ghi nhận một giao dịch nhập linh kiện để tồn kho của trung tâm được cập nhật theo số lượng thực nhập. | MUST |
| US3 | Là kỹ thuật viên, tôi muốn kiểm tra số lượng tồn của linh kiện cần dùng để biết có thể sử dụng linh kiện đó cho phiếu bảo hành hay không. | SHOULD |
| US4 | Là kỹ thuật viên, tôi muốn ghi nhận xuất linh kiện cho một phiếu bảo hành để việc sử dụng linh kiện được theo dõi chính xác. | MUST |
| US5 | Là quản lý trung tâm, tôi muốn được cảnh báo khi tồn kho của một linh kiện thấp hơn ngưỡng tối thiểu để chủ động bổ sung trước khi hết hàng. | MUST |
| US6 | Là quản lý trung tâm, tôi muốn xem lịch sử nhập — xuất của từng linh kiện để theo dõi nguyên nhân biến động tồn kho. | COULD |
| US7 | Là kỹ thuật viên, tôi muốn xem danh sách linh kiện đã xuất cho một phiếu bảo hành để biết những linh kiện nào đã được sử dụng trong quá trình sửa chữa. | SHOULD |

### 3.3. Acceptance Criteria cho User Story MUST

#### US2 — Ghi nhận nhập linh kiện

**AC2.1 — Nhập kho thành công**

**GIVEN** linh kiện hợp lệ và số lượng nhập lớn hơn 0<br>
**WHEN** quản lý trung tâm xác nhận nhập kho<br>
**THEN** hệ thống ghi nhận giao dịch nhập và tăng số lượng tồn của linh kiện tương ứng theo số lượng đã nhập.

**AC2.2 — Số lượng nhập không hợp lệ**

**GIVEN** số lượng nhập bằng 0 hoặc nhỏ hơn 0<br>
**WHEN** quản lý trung tâm xác nhận nhập kho<br>
**THEN** hệ thống từ chối ghi nhận giao dịch và hiển thị thông báo số lượng nhập không hợp lệ.

**AC2.3 — Chưa chọn linh kiện**

**GIVEN** quản lý trung tâm chưa chọn linh kiện cần nhập<br>
**WHEN** quản lý trung tâm xác nhận nhập kho<br>
**THEN** hệ thống từ chối ghi nhận giao dịch và thông báo rằng linh kiện là thông tin bắt buộc.

#### US4 — Xuất linh kiện cho phiếu bảo hành

**AC4.1 — Xuất thành công**

**GIVEN** phiếu bảo hành hợp lệ và số lượng tồn của linh kiện lớn hơn hoặc bằng số lượng cần xuất<br>
**WHEN** kỹ thuật viên xác nhận xuất linh kiện<br>
**THEN** hệ thống ghi nhận giao dịch xuất, giảm số lượng tồn tương ứng và liên kết linh kiện đã xuất với phiếu bảo hành.

**AC4.2 — Xuất vượt số lượng tồn**

**GIVEN** số lượng cần xuất lớn hơn số lượng tồn hiện tại<br>
**WHEN** kỹ thuật viên xác nhận xuất linh kiện<br>
**THEN** hệ thống từ chối giao dịch, giữ nguyên số lượng tồn và thông báo không đủ linh kiện để xuất.

**AC4.3 — Tồn sau xuất xuống dưới ngưỡng**

**GIVEN** giao dịch xuất hợp lệ và số lượng tồn sau giao dịch sẽ thấp hơn `min_threshold`<br>
**WHEN** kỹ thuật viên xác nhận xuất linh kiện<br>
**THEN** hệ thống hoàn tất giao dịch xuất, cập nhật số lượng tồn và phát cảnh báo tồn thấp cho linh kiện đó.

#### US5 — Cảnh báo tồn kho thấp

**AC5.1 — Tồn thấp hơn ngưỡng**

**GIVEN** số lượng tồn của một linh kiện thấp hơn `min_threshold`<br>
**WHEN** hệ thống kiểm tra trạng thái tồn kho sau khi số lượng tồn thay đổi<br>
**THEN** hệ thống hiển thị cảnh báo tồn thấp cho linh kiện đó.

**AC5.2 — Tồn bằng ngưỡng**

**GIVEN** số lượng tồn của linh kiện bằng `min_threshold`<br>
**WHEN** hệ thống kiểm tra trạng thái tồn kho<br>
**THEN** hệ thống không phát cảnh báo tồn thấp cho linh kiện đó.

**AC5.3 — Linh kiện hết hàng**

**GIVEN** số lượng tồn của linh kiện bằng 0<br>
**WHEN** hệ thống kiểm tra trạng thái tồn kho<br>
**THEN** hệ thống hiển thị cảnh báo tồn thấp và xác định linh kiện hiện không còn sẵn để xuất.

### 3.4. Đặc tả Use Case quan trọng nhất

#### UC4 — Xuất linh kiện cho phiếu bảo hành

**Actor chính:** Kỹ thuật viên<br>
**Mục tiêu:** Ghi nhận linh kiện đã sử dụng cho một phiếu bảo hành để theo dõi chính xác việc sử dụng linh kiện và cập nhật tồn kho.<br>
**Điều kiện trước:** Kỹ thuật viên đã đăng nhập; nhận được `ticket_id` của phiếu bảo hành thuộc trung tâm kỹ thuật viên làm việc và linh kiện cần xuất đã được chọn. Dữ liệu, trạng thái và vòng đời của phiếu thuộc luồng ngoài phạm vi L5.<br>
**Điều kiện sau — thành công:** Giao dịch xuất được lưu; số lượng tồn được giảm tương ứng; linh kiện được liên kết với phiếu bảo hành; cảnh báo tồn thấp được tạo nếu cần.<br>
**Điều kiện sau — thất bại:** Không có giao dịch xuất nào được lưu và tồn kho không thay đổi.<br>
**Liên quan:** US3, US4, US5 | **Mức ưu tiên:** MUST

##### Luồng chính (happy path)

1. Kỹ thuật viên chọn chức năng **Xuất linh kiện cho phiếu bảo hành**.
2. Kỹ thuật viên chọn một phiếu bảo hành tại trung tâm mình làm việc.
3. Hệ thống hiển thị linh kiện và số lượng tồn hiện tại tại trung tâm. [include UC3]
4. Kỹ thuật viên chọn một hoặc nhiều linh kiện, rồi nhập số lượng cần xuất cho từng linh kiện.
5. Kỹ thuật viên xác nhận xuất linh kiện.
6. Hệ thống kiểm tra số lượng tồn của tất cả linh kiện được yêu cầu.
7. Hệ thống ghi giao dịch xuất, giảm tồn tương ứng và lưu liên kết linh kiện với phiếu bảo hành.
8. Hệ thống kiểm tra tồn sau xuất; nếu `quantity < min_threshold`, hệ thống tạo cảnh báo tồn thấp.
9. Hệ thống hiển thị kết quả xuất linh kiện thành công.

##### Luồng ngoại lệ

**4a. Chưa chọn linh kiện hoặc số lượng xuất không hợp lệ**

→ Hệ thống từ chối xác nhận và thông báo phải chọn ít nhất một linh kiện; số lượng xuất phải là số nguyên lớn hơn 0.<br>
→ Quay lại bước 4.

**6a. Số lượng cần xuất lớn hơn tồn hiện tại**

→ Hệ thống từ chối giao dịch, giữ nguyên tồn kho và thông báo không đủ linh kiện để xuất.<br>
→ Kết thúc use case.

**7a. Lỗi khi lưu giao dịch xuất hoặc cập nhật tồn kho**

→ Hệ thống rollback toàn bộ thao tác; không được lưu giao dịch xuất hoặc giảm tồn một phần.<br>
→ Hệ thống thông báo giao dịch chưa hoàn tất và cho phép kỹ thuật viên thực hiện lại từ bước 4.

### 3.5. Use Case Diagram

Sơ đồ gốc được lưu tại [usecase.drawio](usecase.drawio). Sơ đồ có ranh giới **Hệ thống quản lý kho linh kiện thay thế**, hai actor và tám use case dưới đây.

| Actor | Use Case | Mục đích |
| --- | --- | --- |
| Quản lý trung tâm | UC1 — Xem tồn kho linh kiện | Xem mã, tên, tồn hiện tại và ngưỡng tồn của linh kiện tại trung tâm phụ trách. |
| Quản lý trung tâm | UC2 — Ghi nhận nhập linh kiện | Ghi nhận số lượng linh kiện nhập và tăng tồn kho. |
| Quản lý trung tâm | UC5 — Xem cảnh báo tồn thấp | Xem cảnh báo cho linh kiện có `quantity < min_threshold`. |
| Quản lý trung tâm | UC6 — Xem lịch sử nhập — xuất | Xem các giao dịch làm biến động tồn kho. |
| Kỹ thuật viên | UC3 — Kiểm tra tồn kho linh kiện | Kiểm tra linh kiện có đủ để dùng cho phiếu bảo hành hay không. |
| Kỹ thuật viên | UC4 — Xuất linh kiện cho phiếu bảo hành | Ghi nhận linh kiện sử dụng và cập nhật tồn kho. |
| Kỹ thuật viên | UC7 — Xem linh kiện đã xuất cho phiếu bảo hành | Truy vết linh kiện đã sử dụng khi sửa chữa. |

Quan hệ `<<include>>`: UC4 bao gồm UC3, vì hệ thống luôn phải kiểm tra tồn kho trước khi cho phép xuất linh kiện.

## 4. Yêu cầu phi chức năng

**NFR1 — Toàn vẹn tồn kho.** 100% giao dịch xuất phải bảo đảm `quantity >= 0`; không trường hợp nào được làm tồn kho âm, kể cả khi có yêu cầu xuất đồng thời.

**NFR2 — Nhất quán giao dịch.** 100% giao dịch xuất thất bại phải được rollback hoàn toàn: không tạo giao dịch xuất và không thay đổi tồn kho.

**NFR3 — Phân quyền dữ liệu.** 100% yêu cầu truy cập dữ liệu kho phải bị giới hạn theo trung tâm của người dùng; người dùng không được xem hoặc thao tác dữ liệu của trung tâm khác.

**NFR4 — Hiệu năng tra cứu tồn kho.** Ít nhất 95% yêu cầu xem tồn kho, danh sách tồn thấp và lịch sử nhập - xuất phải phản hồi trong <= 2 giây với khoảng 10.000 bản ghi thử nghiệm trên môi trường cục bộ.

## 5. Ràng buộc và quy tắc nghiệp vụ

**BR1 — Tồn kho không âm.** `part_stock.quantity` luôn phải thỏa `quantity >= 0`.

**BR2 — Không xuất vượt tồn (QT-09).** Số lượng yêu cầu xuất phải thỏa `quantity_requested <= quantity`. Nếu không thỏa, giao dịch bị từ chối và tồn kho không thay đổi.

**BR3 — Cảnh báo tồn thấp (QT-09).** Khi `quantity < min_threshold`, hệ thống phải cảnh báo cho quản lý trung tâm.

**BR4 — Dữ liệu theo trung tâm (QT-14).** Kỹ thuật viên chỉ xem dữ liệu của trung tâm mình làm việc; quản lý trung tâm chỉ xem dữ liệu của đơn vị mình phụ trách.

**BR5 — Truy vết linh kiện đã sử dụng.** Mỗi linh kiện xuất cho phiếu bảo hành phải được lưu liên kết trong `ticket_part` để truy vết sau này.

## 6. Bảng truy vết yêu cầu

| Mã FR | Yêu cầu chức năng | User Story | Use Case | MoSCoW | Bảng dữ liệu | Màn hình | Test case (BT3) |
| --- | --- | --- | --- | --- | --- |
| FR1 | Xem tồn kho linh kiện | US1 | UC1 — Xem tồn kho linh kiện | SHOULD | `part`, `part_stock` | M1 — Danh sách tồn kho | — |
| FR2 | Ghi nhận nhập linh kiện | US2 | UC2 — Ghi nhận nhập linh kiện | MUST | `part_stock`, `part_transaction` | M2 — Nhập linh kiện | — |
| FR3 | Kiểm tra tồn trước khi sử dụng | US3 | UC3 — Kiểm tra tồn kho | SHOULD | `part`, `part_stock` | M3 — Xuất linh kiện cho phiếu | — |
| FR4 | Xuất linh kiện cho phiếu bảo hành | US4 | UC4 — Xuất linh kiện cho phiếu bảo hành | MUST | `part_stock`, `part_transaction`, `ticket_part` | M3 — Xuất linh kiện cho phiếu | — |
| FR5 | Xem cảnh báo tồn kho thấp | US5 | UC5 — Xem cảnh báo tồn thấp | MUST | `part`, `part_stock` | M1 — Danh sách tồn kho | — |
| FR6 | Xem lịch sử nhập — xuất | US6 | UC6 — Xem lịch sử nhập — xuất | COULD | `part`, `part_transaction`, `ticket_part` | M1 — Danh sách tồn kho | — |
| FR7 | Xem linh kiện đã xuất cho phiếu bảo hành | US7 | UC7 — Xem linh kiện đã xuất cho phiếu bảo hành | SHOULD | `part`, `ticket_part` | M3 — Xuất linh kiện cho phiếu | — |
