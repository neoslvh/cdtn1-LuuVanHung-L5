INSERT INTO part (part_code, part_name, unit_price)
VALUES
  ('L5PART001', 'Pin A52', 250000),
  ('L5PART002', 'Màn hình A52', 1200000),
  ('L5PART003', 'Cáp sạc Type-C', 100000)
ON CONFLICT (part_code) DO UPDATE
SET part_name = EXCLUDED.part_name, unit_price = EXCLUDED.unit_price;

INSERT INTO part_stock (center_id, part_id, quantity, min_threshold)
SELECT 1, part_id,
  CASE part_code WHEN 'L5PART001' THEN 12 WHEN 'L5PART002' THEN 2 ELSE 0 END,
  CASE part_code WHEN 'L5PART001' THEN 5 WHEN 'L5PART002' THEN 5 ELSE 3 END
FROM part
WHERE part_code IN ('L5PART001', 'L5PART002', 'L5PART003')
ON CONFLICT (center_id, part_id) DO UPDATE
SET quantity = EXCLUDED.quantity, min_threshold = EXCLUDED.min_threshold;

INSERT INTO ticket (ticket_code, center_id)
VALUES ('BH-2026-00125', 1)
ON CONFLICT (ticket_code) DO UPDATE SET center_id = EXCLUDED.center_id;

INSERT INTO ticket_part (ticket_id, part_id, quantity_used)
SELECT ticket.ticket_id, part.part_id, 2
FROM ticket
JOIN part ON part.part_code = 'L5PART001'
WHERE ticket.ticket_code = 'BH-2026-00125'
ON CONFLICT (ticket_id, part_id) DO UPDATE SET quantity_used = EXCLUDED.quantity_used;
