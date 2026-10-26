-- Hỗ trợ tra cứu dữ liệu L5 sau khi nạp bộ dataset chính thức.
CREATE INDEX IF NOT EXISTS idx_ticket_center
  ON ticket(center_id);

CREATE INDEX IF NOT EXISTS idx_ticket_part_part
  ON ticket_part(part_id);
