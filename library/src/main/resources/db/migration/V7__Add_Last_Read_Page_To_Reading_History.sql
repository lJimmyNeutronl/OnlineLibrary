-- Добавление столбца last_read_page в таблицу reading_history
ALTER TABLE reading_history ADD COLUMN last_read_page INTEGER;
 
-- Создание индекса для оптимизации запросов
CREATE INDEX idx_reading_history_last_read_page ON reading_history(last_read_page); 