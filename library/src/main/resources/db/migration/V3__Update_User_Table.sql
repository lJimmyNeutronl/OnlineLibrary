-- Удаление колонки username
ALTER TABLE users DROP COLUMN username;

-- Добавление колонок first_name и last_name
ALTER TABLE users ADD COLUMN first_name VARCHAR(50);
ALTER TABLE users ADD COLUMN last_name VARCHAR(50);
