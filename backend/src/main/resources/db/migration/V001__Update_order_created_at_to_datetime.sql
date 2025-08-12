-- Migration to update orders.created_at from DATE to DATETIME
-- This allows storing both date and time when an order is created

ALTER TABLE orders MODIFY COLUMN created_at DATETIME NOT NULL;
