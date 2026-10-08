-- L5 - Kho linh kiện thay thế
-- PostgreSQL DDL skeleton for BT1 / Track SE

CREATE TABLE part (
  part_id BIGSERIAL PRIMARY KEY,
  part_code VARCHAR(30) NOT NULL UNIQUE,
  part_name VARCHAR(120) NOT NULL,
  unit_price NUMERIC(12, 0) NOT NULL CHECK (unit_price >= 0)
);

CREATE TABLE part_stock (
  center_id BIGINT NOT NULL,
  part_id BIGINT NOT NULL REFERENCES part(part_id),
  quantity INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_threshold INT NOT NULL CHECK (min_threshold >= 0),
  PRIMARY KEY (center_id, part_id)
);

-- Bảng tham chiếu tối thiểu của luồng phiếu bảo hành.
-- L5 chỉ đọc ticket_id và không quản lý vòng đời của phiếu.
CREATE TABLE ticket (
  ticket_id BIGSERIAL PRIMARY KEY,
  ticket_code VARCHAR(20) NOT NULL UNIQUE,
  center_id BIGINT NOT NULL
);

CREATE TABLE ticket_part (
  ticket_id BIGINT NOT NULL REFERENCES ticket(ticket_id),
  part_id BIGINT NOT NULL REFERENCES part(part_id),
  quantity_used INT NOT NULL CHECK (quantity_used > 0),
  PRIMARY KEY (ticket_id, part_id)
);

CREATE TABLE part_transaction (
  transaction_id BIGSERIAL PRIMARY KEY,
  center_id BIGINT NOT NULL,
  part_id BIGINT NOT NULL,
  ticket_id BIGINT NULL,
  transaction_type VARCHAR(10) NOT NULL
    CHECK (transaction_type IN ('IN', 'OUT')),
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaction_stock
    FOREIGN KEY (center_id, part_id)
    REFERENCES part_stock(center_id, part_id),
  CONSTRAINT fk_transaction_ticket_part
    FOREIGN KEY (ticket_id, part_id)
    REFERENCES ticket_part(ticket_id, part_id),
  CONSTRAINT chk_transaction_ticket
    CHECK (
      (transaction_type = 'IN' AND ticket_id IS NULL)
      OR (transaction_type = 'OUT' AND ticket_id IS NOT NULL)
    )
);

-- FR6: lọc lịch sử giao dịch theo kho/linh kiện và sắp xếp thời điểm.
CREATE INDEX idx_part_tx_stock_time
  ON part_transaction(center_id, part_id, created_at DESC);

-- FR5/NFR4: lọc nhanh linh kiện tồn dưới ngưỡng theo trung tâm.
CREATE INDEX idx_part_stock_low
  ON part_stock(center_id)
  WHERE quantity < min_threshold;
