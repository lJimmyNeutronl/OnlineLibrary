-- Удаление ограничения уникальности для отзывов, чтобы разрешить несколько отзывов от одного пользователя
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS unique_user_book_review;

-- Добавим индекс для оптимизации запросов подсчета отзывов для пары пользователь-книга
CREATE INDEX IF NOT EXISTS idx_reviews_user_book ON reviews(user_id, book_id); 