-- Performance indexes for faster queries
-- Run this script manually in MySQL Workbench or HeidiSQL
-- Connect to service_db on localhost:3307

-- First, drop existing indexes if any (ignore errors if they don't exist)
DROP INDEX idx_orders_status ON orders;
DROP INDEX idx_orders_created_at ON orders;
DROP INDEX idx_orders_client_id ON orders;
DROP INDEX idx_device_order_id ON device;
DROP INDEX idx_device_status ON device;
DROP INDEX idx_order_log_order_id ON order_log;
DROP INDEX idx_order_log_created_at ON order_log;
DROP INDEX idx_client_name ON client;
DROP INDEX idx_client_phone ON client;

-- Now create all indexes
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_device_order_id ON device(order_id);
CREATE INDEX idx_device_status ON device(status);
CREATE INDEX idx_order_log_order_id ON order_log(order_id);
CREATE INDEX idx_order_log_created_at ON order_log(created_at DESC);
CREATE INDEX idx_client_name ON client(name);
CREATE INDEX idx_client_phone ON client(phone);

-- Verify indexes were created
SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME 
FROM information_schema.statistics 
WHERE table_schema = 'service_db' 
  AND INDEX_NAME LIKE 'idx_%'
ORDER BY TABLE_NAME, INDEX_NAME;
