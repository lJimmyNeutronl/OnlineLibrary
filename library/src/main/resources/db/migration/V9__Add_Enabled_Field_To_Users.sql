-- Добавление поля enabled в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE; 